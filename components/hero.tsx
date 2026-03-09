"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Instagram, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />

            {/* Main photo background */}
            <div className="absolute inset-0">
                <Image
                    src="/assets/IMG_2333.JPG"
                    alt="Дарья Первушина"
                    fill
                    className="object-cover object-top"
                    priority
                    quality={90}
                />
            </div>

            {/* Content */}
            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className="text-5xl md:text-7xl font-light tracking-wider mb-4 text-white">
                        Дарья Первушина
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <p className="text-xl md:text-2xl font-light text-white/80 mb-6 tracking-wide">
                        Фотограф с модельным опытом
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-base md:text-lg text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                    <p>
                        Со школы занимаюсь модельным бизнесом, но последние 3 года встала по другую сторону камеры.
                    </p>
                    <p className="mt-2">
                        Работала в <span className="text-white/90">России</span>, <span className="text-white/90">Тайланде</span> и <span className="text-white/90">Вьетнаме</span>
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex gap-4 justify-center"
                >
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="bg-transparent border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                        <a href="https://t.me/foxydy" target="_blank" rel="noopener noreferrer">
                            <Send className="w-5 h-5 mr-2" />
                            Telegram
                        </a>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="bg-transparent border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                        <a href="https://www.instagram.com/foto_foxydy" target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-5 h-5 mr-2" />
                            Instagram
                        </a>
                    </Button>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
                >
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1 h-2 bg-white/60 rounded-full mt-2"
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}
