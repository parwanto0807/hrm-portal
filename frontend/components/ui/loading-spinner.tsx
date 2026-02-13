"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function LoadingSpinner() {
    return (
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
                {/* Rotating ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute h-16 w-16 rounded-full border-t-2 border-primary"
                />

                {/* Pulsing Axon Icon */}
                <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Image
                        src="/icons/axon-hrm-icon-192x192.png"
                        alt="Axon"
                        width={32}
                        height={32}
                        className="opacity-80"
                    />
                </motion.div>
            </div>
            <p className="text-[10px] font-black tracking-widest text-primary/40 uppercase animate-pulse">
                Synchronizing
            </p>
        </div>
    );
}