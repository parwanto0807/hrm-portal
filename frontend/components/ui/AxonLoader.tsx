"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AxonLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
                {/* Outer rotating ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute h-24 w-24 md:h-32 md:w-32 rounded-full border-t-2 border-b-2 border-primary/30"
                />

                {/* Inner pulsing ring */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute h-16 w-16 md:h-24 md:w-24 rounded-full bg-primary/10"
                />

                {/* Axon Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                >
                    <Image
                        src="/icons/axon-hrm-icon-512x512.png"
                        alt="Axon HRM"
                        width={60}
                        height={60}
                        className="md:w-[80px] md:h-[80px] drop-shadow-2xl"
                    />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-col items-center gap-1"
            >
                <h2 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                    Axon <span className="text-primary not-italic">HRM</span>
                </h2>
                <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                    Sistem Manajemen SDM
                </p>

                {/* Loading progress bar indicator */}
                <div className="mt-4 h-[2px] w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <motion.div
                        animate={{ x: [-128, 128] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-24 bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                </div>
            </motion.div>
        </div>
    );
}
