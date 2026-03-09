"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// 4 фотографии прайс-листа
const priceImages = [
    "/assets/photo_1_2026-01-20_16-03-09.jpg",
    "/assets/photo_2_2026-01-20_16-03-09.jpg",
    "/assets/photo_3_2026-01-20_16-03-09.jpg",
    "/assets/photo_2026-01-20_16-02-48.jpg",
];

export function PriceList() {
    return (
        <section id="pricing" className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-4">
                        Прайс
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Стоимость услуг и пакеты съёмок
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {priceImages.map((img, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10"
                        >
                            <Image
                                src={img}
                                alt={`Прайс-лист ${index + 1}`}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
