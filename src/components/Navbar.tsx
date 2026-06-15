import React, { useState } from 'react';
import { BookOpen, Shield, ChevronDown, User, Layers, Home, LayoutDashboard, QrCode } from 'lucide-react';
import { Student, ActivePage } from '../types';

interface NavbarProps {
  students: Student[];
  currentStudent: Student;
  onStudentChange: (student: Student) => void;
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
}

export default function Navbar({
  students,
  currentStudent,
  onStudentChange,
  activePage,
  onPageChange
}: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/10 glass bg-dark-bg/80">
      {/* Brand logo */}
      <div 
        onClick={() => onPageChange('hero')} 
        className="flex items-center gap-3 cursor-pointer group"
        id="navbar-brand"
      >
        <div className="w-10 h-10 bg-electric-blue rounded-xl flex items-center justify-center shadow-electric transition-transform group-hover:rotate-12 duration-300">
          <BookOpen className="text-white w-5.5 h-5.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter text-white font-display">
            IDN <span className="text-neon-green">SMART_LIB</span>
          </span>
          <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">
            SOLO CAMPUS v12.0
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => onPageChange('hero')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activePage === 'hero' 
              ? 'bg-electric-blue text-white font-black' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
          id="nav-hero-btn"
        >
          Overview
        </button>
        <button
          onClick={() => onPageChange('dashboard')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activePage === 'dashboard' 
              ? 'bg-electric-blue text-white font-black' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
          id="nav-dashboard-btn"
        >
          Dashboard Siswa
        </button>
        <button
          onClick={() => onPageChange('scan')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activePage === 'scan' || activePage === 'confirm' || activePage === 'return-view'
              ? 'bg-neon-green text-black font-black shadow-neon-sm' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
          id="nav-scan-btn"
        >
          Scan QR Buku
        </button>
      </div>

      {/* System Node Indicator & Login Selector */}
      <div className="flex items-center gap-4">
        {/* Network indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            IDN-NET LIVE
          </span>
        </div>

        {/* User Account / Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-2xl border border-white/10 transition-all cursor-pointer"
            id="student-selector-btn"
          >
            <img 
              src={currentStudent.avatar} 
              alt={currentStudent.name} 
              className="w-7 h-7 rounded-lg border border-white/10 object-cover" 
            />
            <div className="text-left hidden sm:block">
              <p className="text-[9px] text-white/50 leading-none font-bold tracking-widest font-mono uppercase">
                {currentStudent.class}
              </p>
              <p className="text-xs font-black tracking-tight text-white flex items-center gap-1 font-display mt-0.5">
                {currentStudent.name}
              </p>
            </div>
            <ChevronDown size={14} className={`text-white/60 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-accent shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <p className="text-[10px] font-mono font-bold text-neon-green uppercase tracking-widest">
                  SIMULATION TERMINAL
                </p>
                <p className="text-xs text-white/50"> ganti akun untuk simulasi peminjaman </p>
              </div>
              <div className="space-y-1">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      onStudentChange(student);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                      currentStudent.id === student.id 
                        ? 'bg-electric-blue/30 border border-electric-blue/50 text-white font-bold' 
                        : 'hover:bg-white/5 text-white/70 hover:text-white'
                    }`}
                  >
                    <img 
                      src={student.avatar} 
                      alt={student.name} 
                      className="w-8 h-8 rounded-lg object-cover" 
                    />
                    <div>
                      <p className="text-xs font-bold leading-tight">{student.name}</p>
                      <p className="text-[10px] text-white/50 font-mono">{student.class} • {student.nis}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Reset simulator database trigger */}
              <div className="mt-2 pt-2 border-t border-white/10 text-center">
                <p className="text-[9px] text-white/30 font-mono">IDN Boarding School Solo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* Responsive floating bottom navigation dock for touch devices */}
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md p-1.5 rounded-2xl glass-accent bg-dark-bg/90 border border-white/10 flex justify-around items-center backdrop-blur-lg md:hidden z-50 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(13,71,255,0.15)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={() => onPageChange('hero')}
        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
          activePage === 'hero'
            ? 'text-neon-green font-black scale-103'
            : 'text-white/40 hover:text-white'
        }`}
        id="mobile-nav-hero-btn"
      >
        <Home size={18} className={activePage === 'hero' ? 'text-neon-green' : 'text-white/40'} />
        <span className="text-[10px] font-mono tracking-wider mt-1 uppercase font-bold">Overview</span>
      </button>

      <button
        onClick={() => onPageChange('dashboard')}
        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
          activePage === 'dashboard'
            ? 'text-neon-green font-black scale-103'
            : 'text-white/40 hover:text-white'
        }`}
        id="mobile-nav-dashboard-btn"
      >
        <LayoutDashboard size={18} className={activePage === 'dashboard' ? 'text-neon-green' : 'text-white/40'} />
        <span className="text-[10px] font-mono tracking-wider mt-1 uppercase font-bold">Siswa</span>
      </button>

      <button
        onClick={() => onPageChange('scan')}
        className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
          activePage === 'scan' || activePage === 'confirm' || activePage === 'return-view'
            ? 'text-black font-black bg-neon-green rounded-xl shadow-neon-sm scale-105'
            : 'text-white/40 hover:text-white'
        }`}
        id="mobile-nav-scan-btn"
      >
        <QrCode size={18} className={activePage === 'scan' || activePage === 'confirm' || activePage === 'return-view' ? 'text-black' : 'text-white/40'} />
        <span className="text-[10px] font-mono tracking-wider mt-1 uppercase font-bold">Scan QR</span>
      </button>
    </div>
    </>
  );
}
