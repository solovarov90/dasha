"use client";

import { motion } from "framer-motion";
import { Send, Instagram, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Contact() {
    return (
        <section id="contact" className="py-24 px-4 bg-gradient-to-b from-black to-neutral-950">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-4">
                        Связаться со мной
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Готова обсудить вашу фотосессию
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col md:flex-row gap-8 justify-center items-center"
                >
                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg"
                    >
                        <a href="https://t.me/foxydy" target="_blank" rel="noopener noreferrer">
                            <Send className="w-5 h-5 mr-3" />
                            Написать в Telegram
                        </a>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-white/30 text-white hover:bg-white hover:text-black px-8 py-6 text-lg"
                    >
                        <a href="https://www.instagram.com/foto_foxydy" target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-5 h-5 mr-3" />
                            Instagram
                        </a>
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <div className="flex items-center justify-center gap-2 text-white/50">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Россия • Тайланд • Вьетнам</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export function Footer() {
    return (
        <footer className="py-8 px-4 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/40 text-sm">
                    © {new Date().getFullYear()} Дарья Первушина. Все права защищены.
                </p>
                <div className="flex gap-6">
                    <a
                        href="https://t.me/foxydy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </a>
                    <a
                        href="https://www.instagram.com/foto_foxydy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <Instagram className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
