"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AppPortal() {
  return (
    <AnimatePresence>
      <motion.div
        key="app-portal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-white via-sky-50 to-emerald-50 flex items-center justify-center font-sans p-4"
      >

        {/* --- BACKGROUND GRID PATTERN (Hanya di Desktop) --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="hidden md:block absolute inset-0 z-0"
        >
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px),
                              linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        </motion.div>

        {/* --- GLOWING ORB DECORATIONS --- */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Mobile: hanya satu orb kecil */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{
              duration: 1.5,
              delay: 0.3,
              ease: [0.22, 0.61, 0.36, 1]
            }}
            className="md:hidden absolute top-1/4 right-4 w-40 h-40 bg-gradient-to-r from-sky-100 to-emerald-100 rounded-full blur-2xl"
          />

          {/* Desktop: orbs full */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{
              duration: 1.8,
              delay: 0.4,
              ease: [0.22, 0.61, 0.36, 1]
            }}
            className="hidden md:block absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-sky-300 to-emerald-300 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.25 }}
            transition={{
              duration: 1.8,
              delay: 0.6,
              ease: [0.22, 0.61, 0.36, 1]
            }}
            className="hidden md:block absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-emerald-200 to-sky-200 rounded-full blur-3xl"
          />
        </div>

        {/* --- FLOATING PARTICLES (Mobile) --- */}
        <div className="md:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-sky-400/30"
              style={{
                left: `${(i * 20 + 10)}%`,
                top: `${(i * 15 + 20)}%`,
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* --- MAIN PORTAL CARD --- */}
        <div className="relative z-10 w-full max-w-sm md:max-w-lg lg:max-w-xl px-3">
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 0.61, 0.36, 1]
            }}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/80 bg-white/95 backdrop-blur-sm md:backdrop-blur-lg shadow-lg md:shadow-2xl shadow-sky-200/30 md:shadow-sky-200/50 p-5 md:p-10 text-center"
          >

            {/* --- COMPANY LOGO SECTION --- */}
            <div className="mb-6 md:mb-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4
                }}
                className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-sky-600 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-md md:shadow-xl shadow-sky-300/30 mb-4 relative"
              >
                {/* Animated ring around logo */}
                <motion.div
                  className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-emerald-300/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.8,
                    ease: [0.22, 0.61, 0.36, 1]
                  }}
                />

                <motion.svg
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.7,
                    ease: [0.22, 0.61, 0.36, 1]
                  }}
                  className="w-8 h-8 md:w-12 md:h-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </motion.svg>

                {/* Animated dot on logo */}
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 1,
                    type: "spring",
                    stiffness: 300,
                    damping: 10
                  }}
                />
              </motion.div>

              {/* Animated title with underline */}
              <div className="relative">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.9,
                    ease: [0.22, 0.61, 0.36, 1]
                  }}
                  className="text-xl font-bold text-gray-900 mb-2"
                >
                  HR Management System
                </motion.h1>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 1.1,
                    ease: [0.22, 0.61, 0.36, 1]
                  }}
                  className="h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent w-3/4 mx-auto"
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 1.2,
                  ease: [0.22, 0.61, 0.36, 1]
                }}
                className="text-sky-700 text-sm font-medium mt-3 uppercase"
              >
                PT. Grafindo Mitrasemesta
              </motion.p>
            </div>

            {/* --- SYSTEM INFO --- */}
            <div className="mb-6 md:mb-10 space-y-4 md:space-y-5">
              {/* Mobile: animated status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.3,
                  ease: [0.22, 0.61, 0.36, 1]
                }}
                className="md:hidden flex items-center justify-center gap-2 text-xs text-sky-800"
              >
                {/* <div className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 rounded-full">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, type: "spring" }}
                    className="w-2 h-2 rounded-full bg-green-500"
                  />
                  <span>System Ready</span>
                </div> */}
              </motion.div>

              {/* Desktop: full badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.3,
                  ease: [0.22, 0.61, 0.36, 1]
                }}
                className="flex flex-row-reverse items-center justify-center gap-3 text-xs md:text-sm text-sky-800"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="font-medium">Secure Access</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="font-medium">Fully Integrated</span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 1.5,
                  ease: [0.22, 0.61, 0.36, 1]
                }}
                className="text-gray-700 text-xs md:text-sm leading-relaxed max-w-md mx-auto px-2"
              >
                Sistem terintegrasi untuk pengelolaan data Karyawan
              </motion.p>
            </div>

            {/* --- LOGIN BUTTON --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 1.6,
                ease: [0.22, 0.61, 0.36, 1]
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/auth/google"
                className="group relative flex items-center justify-center w-full py-3.5 md:py-5 px-4 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 rounded-xl md:rounded-2xl text-white font-semibold text-base md:text-lg overflow-hidden transition-all duration-300"
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                <span className="flex items-center gap-2 md:gap-3 relative z-10">
                  <motion.svg
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 1.8,
                      ease: [0.22, 0.61, 0.36, 1]
                    }}
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </motion.svg>

                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 1.9,
                      ease: [0.22, 0.61, 0.36, 1]
                    }}
                  >
                    Access Portal
                  </motion.span>

                  <motion.svg
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 2.0,
                      ease: [0.22, 0.61, 0.36, 1]
                    }}
                    className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1 md:group-hover:translate-x-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </span>
              </Link>
            </motion.div>

            {/* --- FOOTER LINKS (Mobile & Desktop) --- */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 2.2,
                ease: [0.22, 0.61, 0.36, 1]
              }}
              className="mt-5 md:mt-8 pt-3 md:pt-6 border-t border-sky-100"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs text-sky-600">
                {['Security', 'Privacy', 'Support'].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 2.3 + index * 0.1,
                      ease: [0.22, 0.61, 0.36, 1]
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <a
                      href="#"
                      className="hover:text-emerald-600 transition-colors"
                    >
                      {item}
                    </a>
                    {index < 2 && (
                      <div className="w-1 h-1 rounded-full bg-sky-300 inline-block mx-2" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* --- VERSION BADGE (Hanya di Desktop) --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 2.4,
              ease: [0.22, 0.61, 0.36, 1]
            }}
            className="flex mt-6 flex-col items-center gap-3"
          >
            <div className="text-center text-sky-500/80 text-sm tracking-widest uppercase font-medium">
              Grafindo HRM v3.2
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-0.5 overflow-hidden rounded-full">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{
                    x: ['-100%', '100%', '-100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                    delay: 2.6
                  }}
                  className="h-full w-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #0ea5e9, transparent)',
                  }}
                />
              </div>
              <div className="text-xs text-sky-600/70">© 2025</div>
              <div className="w-20 h-0.5 overflow-hidden rounded-full">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{
                    x: ['100%', '-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                    delay: 2.6
                  }}
                  className="h-full w-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #264cd6ff, transparent)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}