"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface BeforeAfterProps {
    beforeImage: string;
    afterImage: string;
    title?: string;
}

export function BeforeAfter({ beforeImage, afterImage, title }: BeforeAfterProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", () => setIsDragging(false));
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", () => setIsDragging(false));
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", () => setIsDragging(false));
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", () => setIsDragging(false));
        };
    }, [isDragging]);

    return (
        <div className="relative">
            {title && (
                <h4 className="text-center text-white/60 text-sm mb-4">{title}</h4>
            )}
            <div
                ref={containerRef}
                className="relative aspect-[3/4] overflow-hidden cursor-ew-resize select-none rounded-lg"
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
            >
                {/* After image (full) */}
                <Image
                    src={afterImage}
                    alt="После обработки"
                    fill
                    className="object-cover"
                    draggable={false}
                />

                {/* Before image (clipped) */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                >
                    <Image
                        src={beforeImage}
                        alt="До обработки"
                        fill
                        className="object-cover"
                        style={{ maxWidth: "none", width: containerRef.current?.offsetWidth }}
                        draggable={false}
                    />
                </div>

                {/* Slider line */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                    style={{ left: `${sliderPosition}%` }}
                >
                    {/* Slider handle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 12H16M8 12L11 9M8 12L11 15M16 12L13 9M16 12L13 15" />
                        </svg>
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-xs text-white/80">
                    До
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-xs text-white/80">
                    После
                </div>
            </div>
        </div>
    );
}

export function ProcessingSection() {
    // Placeholder - в будущем из админки
    const examples = [
        // { before: "/assets/before1.jpg", after: "/assets/after1.jpg", title: "Портрет" },
    ];

    return (
        <section id="processing" className="py-24 px-4 bg-gradient-to-b from-black via-neutral-950 to-black">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-4">
                        Обработка
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Примеры до/после — профессиональная ретушь и цветокоррекция
                    </p>
                </motion.div>

                {examples.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {examples.map((example, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <BeforeAfter
                                    beforeImage={example.before}
                                    afterImage={example.after}
                                    title={example.title}
                                />
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
                            Примеры обработки скоро появятся
                        </p>
                        <p className="text-white/30 text-sm mt-2">
                            Загрузите примеры до/после через админ-панель
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
