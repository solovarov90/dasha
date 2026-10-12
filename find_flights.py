#!/usr/bin/env python3
"""Поиск составных (на двух отдельных билетах) перелётов CXR/SGN -> HUB -> IKT.

Источник цен: Travelpayouts (Aviasales) Flight Data API, эндпоинт
/aviasales/v3/prices_for_dates. Это кэш цен, найденных пользователями за
последние 48 часов, поэтому цены и время вылета нужно перепроверять по ссылке.

Для каждой пары (origin, hub) собираются билеты первого плеча, для каждого
hub -> IKT - второго. Затем перебираются все сочетания, у которых:
  * пересадка (прилёт 1-го плеча -> вылет 2-го) от --min-layover до
    --max-layover часов (по умолчанию 4..24);
  * прилёт в Иркутск не позже конца дня --deadline (по умолчанию 7 января).
В выдачу попадают --top самых дешёвых комбинаций.

Запуск:
    export TRAVELPAYOUTS_TOKEN=...      # https://www.travelpayouts.com/programs/100/tools/api
    export TRAVELPAYOUTS_MARKER=...     # необязательно: ваш партнёрский marker
    python3 find_flights.py                    # быстрый режим: запрос по месяцам
    python3 find_flights.py --daily            # перебор каждой даты отдельным запросом
    python3 find_flights.py --start 2026-12-20 --top 20

Только стандартная библиотека, Python 3.9+.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from bisect import bisect_left, bisect_right
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"
SITE_URL = "https://www.aviasales.ru"

ORIGINS = ["CXR", "SGN"]
HUBS = ["BKK", "DMK", "CAN", "PEK", "HRB", "ALA"]
DESTINATION = "IKT"

# Фиксированные смещения UTC (без перехода на летнее время) - для показа
# местного времени прилёта первого плеча в хабе.
UTC_OFFSET_H = {"CXR": 7, "SGN": 7, "BKK": 7, "DMK": 7, "CAN": 8, "PEK": 8, "HRB": 8, "ALA": 5, "IKT": 8}

CACHE_FILE = Path(os.environ.get("FLIGHTS_CACHE", ".flights_cache.json"))
CACHE_TTL_S = 6 * 3600


@dataclass(frozen=True)
class Leg:
    origin: str
    dest: str
    price: float
    dep: datetime  # aware
    arr: datetime  # aware
    airline: str
    flight_number: str
    transfers: int
    link: str

    @property
    def label(self) -> str:
        return f"{self.airline}{self.flight_number}".strip() or "?"


@dataclass(frozen=True)
class Combo:
    first: Leg
    second: Leg

    @property
    def total(self) -> float:
        return self.first.price + self.second.price

    @property
    def layover(self) -> timedelta:
        return self.second.dep - self.first.arr


# --------------------------------------------------------------------------- API


class ApiError(RuntimeError):
    pass


class Cache:
    """Простой файловый кэш ответов, чтобы повторный запуск не долбил API."""

    def __init__(self, path: Path, enabled: bool):
        self.path, self.enabled = path, enabled
        self.data: dict = {}
        if enabled and path.exists():
            try:
                self.data = json.loads(path.read_text())
            except (OSError, ValueError):
                self.data = {}

    def get(self, key: str):
        item = self.data.get(key)
        if self.enabled and item and time.time() - item["ts"] < CACHE_TTL_S:
            return item["payload"]
        return None

    def put(self, key: str, payload) -> None:
        if self.enabled:
            self.data[key] = {"ts": time.time(), "payload": payload}

    def save(self) -> None:
        if self.enabled:
            try:
                self.path.write_text(json.dumps(self.data))
            except OSError:
                pass


def http_get_json(params: dict, token: str, retries: int = 4) -> dict:
    req = Request(
        f"{API_URL}?{urlencode(params)}",
        headers={"X-Access-Token": token, "Accept-Encoding": "identity"},
    )
    for attempt in range(retries):
        try:
            with urlopen(req, timeout=30) as resp:
                return json.load(resp)
        except HTTPError as e:
            if e.code in (401, 403):
                raise ApiError(f"HTTP {e.code}: неверный или неактивный токен Travelpayouts")
            if e.code == 429 or e.code >= 500:
                time.sleep(2 ** attempt)
                continue
            raise ApiError(f"HTTP {e.code} для {params.get('origin')}->{params.get('destination')}")
        except (URLError, TimeoutError, ValueError):
            time.sleep(2 ** attempt)
    raise ApiError(f"не удалось получить {params.get('origin')}->{params.get('destination')}")


def parse_dt(s: str) -> datetime:
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def parse_offer(o: dict, marker: str) -> Leg | None:
    try:
        dep = parse_dt(o["departure_at"])
        minutes = o.get("duration_to") or o.get("duration")
        if not minutes:
            return None
        link = o.get("link") or ""
        if link:
            link = SITE_URL + link
            if marker:
                link += ("&" if "?" in link else "?") + urlencode({"marker": marker})
        return Leg(
            origin=o.get("origin_airport") or o["origin"],
            dest=o.get("destination_airport") or o["destination"],
            price=float(o["price"]),
            dep=dep,
            arr=dep + timedelta(minutes=int(minutes)),
            airline=o.get("airline", ""),
            flight_number=str(o.get("flight_number", "")),
            transfers=int(o.get("transfers", 0) or 0),
            link=link,
        )
    except (KeyError, ValueError, TypeError):
        return None


def fetch_legs(origin: str, dest: str, period: str, token: str, currency: str,
               marker: str, cache: Cache) -> list[Leg]:
    """period: 'YYYY-MM-DD' или 'YYYY-MM'."""
    params = {
        "origin": origin,
        "destination": dest,
        "departure_at": period,
        "one_way": "true",
        "direct": "false",
        "unique": "false",
        "sorting": "price",
        "currency": currency,
        "limit": 1000,
    }
    key = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()
    payload = cache.get(key)
    if payload is None:
        payload = http_get_json(params, token)
        if not payload.get("success", True):
            raise ApiError(f"API: {payload.get('error') or payload}")
        payload = payload.get("data") or []
        cache.put(key, payload)
    legs = (parse_offer(o, marker) for o in payload)
    return [leg for leg in legs if leg]


def periods(start: date, end: date, daily: bool) -> list[str]:
    if daily:
        return [(start + timedelta(days=i)).isoformat() for i in range((end - start).days + 1)]
    out, d = [], start.replace(day=1)
    while d <= end:
        out.append(d.strftime("%Y-%m"))
        d = (d.replace(day=28) + timedelta(days=4)).replace(day=1)
    return out


def collect(routes: list[tuple[str, str]], start: date, end: date, args, cache: Cache):
    """Возвращает {(origin, dest): [Leg, ...]} с вылетом в [start, end]."""
    jobs = [(o, d, p) for o, d in routes for p in periods(start, end, args.daily)]
    result: dict[tuple[str, str], dict[tuple, Leg]] = {r: {} for r in routes}
    errors: list[str] = []

    def run(job):
        o, d, p = job
        try:
            return job, fetch_legs(o, d, p, args.token, args.currency, args.marker, cache)
        except ApiError as e:
            return job, e

    done = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for job, res in pool.map(run, jobs):
            done += 1
            if done % 25 == 0 or done == len(jobs):
                print(f"  запросов: {done}/{len(jobs)}", file=sys.stderr, end="\r")
            if isinstance(res, ApiError):
                errors.append(str(res))
                continue
            o, d, _ = job
            for leg in res:
                if start <= leg.dep.date() <= end:
                    # дедуп: один и тот же рейс мог прийти из разных запросов
                    result[(o, d)][(leg.dep, leg.label, leg.price)] = leg
    print(file=sys.stderr)
    if errors and len(errors) == len(jobs):
        sys.exit(f"Все запросы завершились ошибкой, например: {errors[0]}")
    if errors:
        print(f"Предупреждение: {len(errors)} из {len(jobs)} запросов не удались "
              f"(например: {errors[0]})", file=sys.stderr)
    return {r: sorted(legs.values(), key=lambda l: l.dep) for r, legs in result.items()}


# ----------------------------------------------------------------------- логика


def combine(first_legs: list[Leg], second_legs: list[Leg], min_gap: timedelta,
            max_gap: timedelta, final_deadline: datetime) -> list[Combo]:
    """second_legs должен быть отсортирован по вылету."""
    deps = [l.dep for l in second_legs]
    combos = []
    for f in first_legs:
        lo = bisect_left(deps, f.arr + min_gap)
        hi = bisect_right(deps, f.arr + max_gap)
        for s in second_legs[lo:hi]:
            if s.arr <= final_deadline:
                combos.append(Combo(f, s))
    return combos


def default_deadline(today: date) -> date:
    d = date(today.year, 1, 7)
    return d if d >= today else date(today.year + 1, 1, 7)


def fmt_local(dt: datetime, iata: str) -> str:
    tz = timezone(timedelta(hours=UTC_OFFSET_H.get(iata, 0)))
    return dt.astimezone(tz).strftime("%d.%m %H:%M")


def fmt_hours(td: timedelta) -> str:
    m = int(td.total_seconds() // 60)
    return f"{m // 60}ч{m % 60:02d}м"


def print_top(combos: list[Combo], top: int, currency: str) -> None:
    if not combos:
        print("Подходящих комбинаций не найдено. Попробуйте --daily, "
              "увеличьте --max-layover или сдвиньте --start.")
        return
    cur = currency.upper()
    for i, c in enumerate(combos[:top], 1):
        f, s = c.first, c.second
        stops = lambda l: f" ({l.transfers} перес.)" if l.transfers else ""
        print(f"#{i:<2} {c.total:8.0f} {cur}   {f.origin} -> {f.dest} -> {s.dest}   "
              f"пересадка {fmt_hours(c.layover)}")
        print(f"    1) {fmt_local(f.dep, f.origin)} -> {fmt_local(f.arr, f.dest)}  "
              f"{f.label}{stops(f)}  {f.price:.0f} {cur}")
        print(f"       {f.link or '(нет ссылки)'}")
        print(f"    2) {fmt_local(s.dep, s.origin)} -> {fmt_local(s.arr, DESTINATION)}  "
              f"{s.label}{stops(s)}  {s.price:.0f} {cur}")
        print(f"       {s.link or '(нет ссылки)'}")
        print()
    print("Билеты отдельные: багаж не сквозной, при задержке 1-го рейса 2-й не "
          "компенсируется. Проверьте транзитные визы/правила хаба.")


def parse_args(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--token", default=os.environ.get("TRAVELPAYOUTS_TOKEN"),
                   help="токен Travelpayouts (или env TRAVELPAYOUTS_TOKEN)")
    p.add_argument("--marker", default=os.environ.get("TRAVELPAYOUTS_MARKER", ""),
                   help="партнёрский marker для ссылок (или env TRAVELPAYOUTS_MARKER)")
    p.add_argument("--start", type=date.fromisoformat, default=date.today(),
                   help="первая дата вылета, YYYY-MM-DD (по умолчанию сегодня)")
    p.add_argument("--deadline", type=date.fromisoformat, default=default_deadline(date.today()),
                   help="прилёт в IKT не позже этой даты (по умолчанию ближайшее 7 января)")
    p.add_argument("--min-layover", type=float, default=4, help="мин. пересадка, часы")
    p.add_argument("--max-layover", type=float, default=24, help="макс. пересадка, часы")
    p.add_argument("--top", type=int, default=10)
    p.add_argument("--currency", default="usd")
    p.add_argument("--daily", action="store_true",
                   help="отдельный запрос на каждую дату (дольше, но полнее)")
    p.add_argument("--workers", type=int, default=4)
    p.add_argument("--no-cache", action="store_true")
    args = p.parse_args(argv)
    if not args.token:
        p.error("нужен токен: --token или переменная TRAVELPAYOUTS_TOKEN")
    if args.start > args.deadline:
        p.error("--start позже --deadline")
    return args


def main(argv=None) -> None:
    args = parse_args(argv)
    cache = Cache(CACHE_FILE, enabled=not args.no_cache)
    min_gap = timedelta(hours=args.min_layover)
    max_gap = timedelta(hours=args.max_layover)
    # прилёт в Иркутск (UTC+8) не позже конца дня deadline
    final_deadline = datetime.combine(args.deadline + timedelta(days=1), datetime.min.time(),
                                      tzinfo=timezone(timedelta(hours=8)))

    routes = [(o, h) for o in ORIGINS for h in HUBS] + [(h, DESTINATION) for h in HUBS]
    print(f"Ищу {', '.join(ORIGINS)} -> [{', '.join(HUBS)}] -> {DESTINATION}, "
          f"вылет {args.start} .. {args.deadline}, пересадка {args.min_layover:g}-"
          f"{args.max_layover:g} ч", file=sys.stderr)
    legs = collect(routes, args.start, args.deadline, args, cache)
    cache.save()

    combos: list[Combo] = []
    for o in ORIGINS:
        for h in HUBS:
            combos += combine(legs[(o, h)], legs[(h, DESTINATION)], min_gap, max_gap,
                              final_deadline)
    combos.sort(key=lambda c: (c.total, c.first.dep))
    print_top(combos, args.top, args.currency)


if __name__ == "__main__":
    main()
