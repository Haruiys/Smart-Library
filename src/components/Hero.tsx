import React from 'react';
import { motion } from 'motion/react';
import { QrCode, BookOpen, Layers, CheckCircle, Smartphone, Award, Compass, Zap } from 'lucide-react';
import { Student } from '../types';
import { GET_BOOK_GRADIENT } from '../data';

interface HeroProps {
  currentStudent: Student;
  onStartScanning: () => void;
  onViewStats: () => void;
  totalBooksCount: number;
  availableBooksCount: number;
}

export default function Hero({
  currentStudent,
  onStartScanning,
  onViewStats,
  totalBooksCount,
  availableBooksCount
}: HeroProps) {
  return (
    <section className="relative min-h-[80vh] flex flex-col lg:flex-row items-center justify-between gap-12 py-12 md:py-20" id="hero-section">
      {/* Absolute glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-72 h-72 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Left Column: Heading and Info */}
      <div className="flex-1 text-left space-y-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
        >
          <Zap className="text-neon-green w-4 h-4 animate-bounce" />
          <span className="text-[10px] font-black font-mono tracking-[0.25em] text-neon-green uppercase">
            WEB3 TECH STARTUP INTERFACE
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter italic leading-[0.9] text-white font-display">
            SMART <br />
            <span className="inline-block pl-2 pr-6 text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-cyan-400 to-neon-green">
              LIBRARY
            </span> <br />
            SYSTEM
          </h1>
          <p className="text-white/60 text-lg sm:text-xl font-medium tracking-tight max-w-xl">
            Digitalisasi Peminjaman dan Pengembalian Buku di{' '}
            <span className="text-white font-black underline decoration-neon-green decoration-2 underline-offset-4">
              IDN Boarding School Solo
            </span>
            . Sistem digital terenkripsi instan & mandiri.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-wrap gap-4 pt-4"
        >
          <button
            onClick={onStartScanning}
            className="group relative px-8 py-4 bg-neon-green text-black font-black italic tracking-tighter uppercase rounded-2xl shadow-neon hover:shadow-[0_0_40px_rgba(215,255,0,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-3"
            id="hero-scan-cta"
          >
            <QrCode className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            MULAI PINJAM SEKARANG
          </button>
          
          <button
            onClick={onViewStats}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black italic tracking-tighter uppercase rounded-2xl border border-white/10 transition-all duration-200 cursor-pointer"
            id="hero-stats-cta"
          >
            LIHAT STATISTIK
          </button>
        </motion.div>

        {/* Technical metadata parameters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 max-w-md font-mono"
        >
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none">PROTOCOL</p>
            <p className="text-sm font-bold text-neon-green mt-1">SECURE SCAN</p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none">DURATION</p>
            <p className="text-sm font-bold text-white mt-1">7 DAYS FIXED</p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none">LOCATION</p>
            <p className="text-sm font-bold text-white mt-1">SOLO CAMPUS</p>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Web3 Styled Mockups (Buku 3D, Reader Card, Scanner preview) */}
      <div className="flex-1 w-full flex items-center justify-center z-10">
        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
          
          {/* Circular sci-fi wireframe rotation background */}
          <div className="absolute inset-0 border border-white/5 rounded-full scale-100 pointer-events-none animate-spin" style={{ animationDuration: '40s' }}></div>
          <div className="absolute inset-4 border border-dashed border-electric-blue/15 rounded-full scale-105 pointer-events-none animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>

          {/* 1. KARTU PELAJAR DIGITAL (Digital Student Card overlay) */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="absolute top-0 left-4 w-64 glass-accent p-4 rounded-2xl shadow-electric shadow-lg z-20"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1.5 bg-electric-blue/40 border border-electric-blue/60 px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest uppercase">
                IDN STUDENT PASS
              </div>
              <Smartphone size={14} className="text-electric-blue" />
            </div>
            
            <div className="flex items-center gap-3">
              <img 
                src={currentStudent.avatar} 
                alt={currentStudent.name} 
                className="w-10 h-10 rounded-lg object-cover border border-white/20" 
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-black tracking-tight text-white mb-0.5 truncate">{currentStudent.name}</p>
                <p className="text-[10px] text-white/40 font-mono leading-none">{currentStudent.nis} • {currentStudent.class}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-widest">● VERIFIED ID</span>
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">IDN SOLO v12</span>
            </div>
          </motion.div>

          {/* 2. BUKU 3D INTERACTIVE HIGHLIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ y: -10, rotate: 1 }}
            className="absolute -bottom-4 right-4 w-60 glass p-4 rounded-[2rem] border-white/10 shadow-2xl z-25"
          >
            <div className="aspect-[3/4] rounded-2xl bg-gradient-to-tr from-purple-600 to-electric-blue overflow-hidden relative shadow-lg mb-4 flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <span className="text-[8px] text-white/80 font-mono bg-black/40 px-2 py-0.5 rounded uppercase tracking-wider">
                  HOT DECENTRALIZED SPEC
                </span>
                <span className="w-2 h-2 rounded-full bg-neon-green shadow-neon-sm"></span>
              </div>
              <div className="text-left">
                <p className="text-xs font-mono text-neon-green font-bold">BLOCKCHAIN</p>
                <h3 className="text-lg font-black tracking-tight leading-none italic text-white uppercase font-display mt-0.5">
                  Rust Web3 Node
                </h3>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-left">
              <div>
                <p className="text-[9px] font-mono text-white/40 uppercase">STATUS BUKU</p>
                <p className="text-xs font-black text-neon-green tracking-tight font-display mt-0.5">TERSEDIA - READY</p>
              </div>
              <Compass className="text-[#D7FF00] w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </motion.div>

          {/* 3. FLOATING STAT CLOUD (Floating Card) */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: -40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            whileHover={{ y: -5 }}
            className="absolute top-12 right-0 w-44 glass p-4 rounded-2xl border-white/10 shadow-2xl z-10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-neon-green/20 flex items-center justify-center">
                <Award className="text-neon-green w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest font-bold">TOTAL KOLEKSI</span>
            </div>
            <p className="text-2xl font-black italic text-white font-display text-left">
              {totalBooksCount} <span className="text-xs text-neon-green font-mono not-italic font-medium">BUKU</span>
            </p>
            <p className="text-[9px] font-mono text-emerald-400 text-left mt-1 uppercase tracking-wider font-bold">
              ✔ {availableBooksCount} AVAILABLE NOW
            </p>
          </motion.div>

          {/* 4. QR CODE SCANNER FLOATER */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-[25%] rounded-[3rem] border border-dashed border-neon-green/30 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 bg-neon-green/5 border border-neon-green/20 rounded-2xl flex items-center justify-center">
              <QrCode className="text-neon-green w-8 h-8 opacity-40 animate-pulse" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
