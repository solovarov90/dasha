"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PortfolioItem {
    id: string;
    title: string;
    category: "individual" | "lovestory";
    coverImage: string;
    images: string[];
}

// Placeholder data - в будущем будет из БД/API
const portfolioItems: PortfolioItem[] = [
    {
        id: "1",
        title: "Портретная съемка",
        category: "individual",
        coverImage: "/assets/photo_1_2026-01-20_16-03-09.jpg",
        images: []
    },
    {
        id: "2",
        title: "Love Story в студии",
        category: "lovestory",
        coverImage: "/assets/photo_2_2026-01-20_16-03-09.jpg",
        images: []
    },
    {
        id: "3",
        title: "Прогулочная фотосессия",
        category: "individual",
        coverImage: "/assets/photo_3_2026-01-20_16-03-09.jpg",
        images: []
    },
    {
        id: "4",
        title: "Атмосферные кадры",
        category: "individual",
        coverImage: "/assets/photo_2026-01-20_16-02-48.jpg",
        images: []
    },
    {
        id: "5",
        title: "Черно-белое",
        category: "individual",
        coverImage: "/assets/IMG_2333.JPG",
        images: []
    },
    {
        id: "6",
        title: "Студийный свет",
        category: "individual",
        coverImage: "/assets/photo_1_2026-01-20_16-03-09.jpg",
        images: []
    }
];

const categories = [
    { id: "all", label: "Все работы" },
    { id: "individual", label: "Индивидуальные" },
    { id: "lovestory", label: "Love Story" },
];

interface PortfolioGridProps {
    items?: PortfolioItem[];
}

export function PortfolioGrid({ items = portfolioItems }: PortfolioGridProps) {
    return (
        <section id="portfolio" className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-4">
                        Портфолио
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Индивидуальные фотосессии и Love Story
                    </p>
                </motion.div>

                {/* Category filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center gap-4 mb-12 flex-wrap"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className="px-6 py-2 text-sm font-light border border-white/20 rounded-full
                       text-white/70 hover:text-white hover:border-white/50 transition-all"
                        >
                            {cat.label}
                        </button>
                    ))}
                </motion.div>

                {/* Grid */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group relative aspect-[3/4] overflow-hidden cursor-pointer"
                            >
                                <Image
                                    src={item.coverImage}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <h3 className="text-xl font-light text-white">{item.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center py-16 border border-white/10 rounded-lg"
                    >
                        <p className="text-white/40 text-lg">
                            Проекты скоро появятся
                        </p>
                        <p className="text-white/30 text-sm mt-2">
                            Добавьте проекты через админ-панель
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
