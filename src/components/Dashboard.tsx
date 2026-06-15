import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, CheckCircle, Clock, AlertTriangle, History, ArrowRight, QrCode, 
  Search, RefreshCw, Send, HardDrive, Cloud, CloudOff, CloudLightning, 
  ExternalLink, Loader2, LogOut, FileText, Image as ImageIcon
} from 'lucide-react';
import { Book, Loan, Student } from '../types';
import { GET_BOOK_GRADIENT } from '../data';

interface DashboardProps {
  currentStudent: Student;
  books: Book[];
  loans: Loan[];
  onTriggerReturn: (loan: Loan) => void;
  onSimulateScan: (bookId: string) => void;
  onResetDatabase?: () => void;
  isDriveConnected: boolean;
  googleUser: any;
  onConnectDrive: () => void;
  onDisconnectDrive: () => void;
  driveFiles: any[];
  isDriveSyncing: boolean;
  onSyncLedger: () => Promise<void>;
}

export default function Dashboard({
  currentStudent,
  books,
  loans,
  onTriggerReturn,
  onSimulateScan,
  isDriveConnected,
  googleUser,
  onConnectDrive,
  onDisconnectDrive,
  driveFiles,
  isDriveSyncing,
  onSyncLedger
}: DashboardProps) {
  // Filter loans for the current student
  const studentLoans = loans.filter(l => l.studentId === currentStudent.id);
  const activeLoans = studentLoans.filter(l => l.status === 'active');
  const finishedLoans = studentLoans.filter(l => l.status === 'returned');

  // Overdue calculation
  const today = new Date('2026-06-14'); // System date specified in current initial metadata
  const overdueLoans = activeLoans.filter(l => {
    const deadline = new Date(l.returnDeadline);
    return deadline < today;
  });

  // Closest return limit
  const sortedUpcomingLoans = [...activeLoans].sort((a, b) => {
    return new Date(a.returnDeadline).getTime() - new Date(b.returnDeadline).getTime();
  });
  const closestReturn = sortedUpcomingLoans[0] || null;

  // Total available books in library catalog
  const availableBooks = books.filter(b => b.status === 'available');

  const stats = [
    {
      title: "Buku Dipinjam",
      value: activeLoans.length.toString().padStart(2, '0'),
      sub: "Status Aktif",
      icon: <BookOpen className="text-neon-green w-6 h-6" />,
      color: "neon"
    },
    {
      title: "Buku Tersedia",
      value: availableBooks.length.toString().padStart(2, '0'),
      sub: `Dari total ${books.length} koleksi`,
      icon: <CheckCircle className="text-electric-blue w-6 h-6" />,
      color: "blue"
    },
    {
      title: "Buku Terlambat",
      value: overdueLoans.length.toString().padStart(2, '0'),
      sub: overdueLoans.length > 0 ? "Harap segera kembalikan" : "Bebas denda",
      icon: <AlertTriangle className={overdueLoans.length > 0 ? "text-red-500 w-6 h-6 animate-pulse" : "text-white/40 w-6 h-6"} />,
      color: overdueLoans.length > 0 ? "red" : "gray"
    }
  ];

  return (
    <div className="space-y-12 text-left" id="dashboard-view-wrapper">
      {/* Visual background accents */}
      <div className="absolute top-12 left-1/3 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Greeting info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white font-display">
            STUDENT DASHBOARD
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Simulasi terminal perpustakaan pintar untuk siswa <span className="text-neon-green font-bold">{currentStudent.name}</span>
          </p>
        </div>
        <div className="text-right font-mono text-xs">
          <p className="text-white/40">NIS PINJAMAN: <span className="text-white font-bold">{currentStudent.nis}</span></p>
          <p className="text-white/40">KAFALAH KELAS: <span className="text-white font-bold">{currentStudent.class}</span></p>
        </div>
      </div>

      {/* 1. Stat Cards with Soft shadow, Glassmorphism, Hover animation, and Neon green accents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-8 rounded-[2.25rem] glass hover:border-neon-green/30 relative overflow-hidden group shadow-2xl"
          >
            {/* Glow circle overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-neon-green/10 transition-all duration-300"></div>
            
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/40 italic">
                {s.title}
              </p>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-neon-green/20 transition-all">
                {s.icon}
              </div>
            </div>

            <div className="text-5xl font-black italic tracking-tighter font-display mb-2 text-white">
              {s.value}
            </div>

            <p className="text-xs text-white/50 italic flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.color === 'neon' ? 'bg-neon-green' : s.color === 'blue' ? 'bg-electric-blue' : s.color === 'red' ? 'bg-red-500' : 'bg-white/30'}`}></span>
              {s.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Closest loan limit alerting block */}
      {closestReturn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-stretch md:items-center p-6 bg-electric-blue/10 border border-electric-blue/20 rounded-[2rem] gap-4"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center shrink-0">
              <Clock className="text-electric-blue w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-black text-electric-blue uppercase tracking-widest">
                BATAS PENGEMBALIAN TERDEKAT
              </p>
              <p className="text-base font-bold italic tracking-tight text-white font-display mt-0.5">
                "{closestReturn.bookTitle}" - {closestReturn.bookAuthor}
              </p>
              <p className="text-xs text-white/50">
                Wajib dikembalikan sebelum: <span className="text-neon-green font-mono font-bold">{closestReturn.returnDeadline}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onTriggerReturn(closestReturn)}
            className="px-6 py-3 bg-[#0D47FF] hover:bg-[#0D47FF]/80 text-white font-black italic text-xs tracking-wider uppercase rounded-xl transition-all hover:scale-105"
          >
            KEMBALIKAN SEKARANG
          </button>
        </motion.div>
      )}

      {/* GOOGLE DRIVE SYNC HUB PORTAL PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-[2.25rem] glass relative overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-neon-green/3 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-electric-blue/15 rounded-2xl flex items-center justify-center border border-electric-blue/30 shrink-0">
              {isDriveConnected ? (
                <CloudLightning className="text-neon-green w-6 h-6 animate-pulse" />
              ) : (
                <Cloud className="text-white/40 w-6 h-6" />
              )}
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono font-black text-neon-green tracking-[0.25em] uppercase">
                CLOUD_STORAGE MODULE v2.0
              </span>
              <h3 className="text-2xl font-black italic tracking-tighter text-white font-display mt-0.5 uppercase">
                Integrasi Cloud Google Drive
              </h3>
              <p className="text-xs text-white/50 max-w-2xl mt-1 leading-relaxed">
                Sinkronisasikan riwayat bukti peminjaman, asetat backup ledger, dan snapshot selfie KYC secara digital pada folder <span className="text-white font-bold font-mono">IDN Smart Library Receipts</span> di Google Drive pribadi Anda.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto flex justify-end">
            {!isDriveConnected ? (
              <button
                onClick={onConnectDrive}
                className="w-full lg:w-auto px-6 py-3 bg-[#D7FF00] hover:bg-[#D7FF00]/90 text-black font-black italic text-xs tracking-wider uppercase rounded-xl transition-all shadow-neon hover:scale-102 flex items-center justify-center gap-2"
                id="connect-drive-dashboard-btn"
              >
                <Cloud className="w-4 h-4 text-black" />
                HUBUNGKAN GOOGLE DRIVE
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                  {googleUser?.photoURL ? (
                    <img src={googleUser.photoURL} alt="Google Profil" className="w-6 h-6 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-electric-blue flex items-center justify-center text-[10px] font-black">G</div>
                  )}
                  <div className="text-left">
                    <p className="text-[10px] font-mono leading-none text-neon-green font-bold">TERKONEKSI</p>
                    <p className="text-xs font-bold text-white mt-0.5 truncate max-w-[150px]">{googleUser?.email || "Google Drive"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onSyncLedger}
                    disabled={isDriveSyncing}
                    className="flex-1 sm:flex-none px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-2"
                    title="Simpan ledger peminjaman ke Drive"
                    id="sync-ledger-dashboard-btn"
                  >
                    {isDriveSyncing ? (
                      <Loader2 size={13} className="animate-spin text-neon-green" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    BACKUP LEDGER
                  </button>

                  <button
                    onClick={onDisconnectDrive}
                    className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/25 rounded-xl transition-all flex items-center justify-center"
                    title="Putuskan koneksi Google Drive"
                    id="disconnect-drive-dashboard-btn"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DRIVE RECEPTIONS ARCHIVE SHELF */}
        <div className="mt-6 relative z-10 text-left">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-white/50 uppercase flex items-center gap-2">
              <HardDrive size={13} className="text-neon-green" />
              ARSIP SYNC DI GOOGLE DRIVE ({driveFiles.length})
            </h4>
            {isDriveConnected && (
              <span className="text-[9px] font-mono text-neon-green/80 uppercase font-black tracking-wide">
                Synced Folder: "IDN Smart Library Receipts"
              </span>
            )}
          </div>

          {!isDriveConnected ? (
            <div className="py-6 text-center text-xs text-white/30 italic rounded-2xl bg-white/1 border border-white/5">
              Hubungkan akun Google Drive Anda untuk melihat feed sinkronisasi berkas otomatis secara langsung di sini.
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="py-8 text-center rounded-2xl bg-white/2 border border-dashed border-white/5 flex flex-col items-center justify-center gap-2">
              <CloudOff className="text-white/20 w-8 h-8 animate-bounce" />
              <p className="text-xs font-bold text-white/40 italic">Folder Google Drive Anda kosong.</p>
              <p className="text-[10px] text-white/30 max-w-sm">Daftar file arsip akan terisi secara otomatis ketika Anda meminjam buku berikutnya di Smart Library IDN.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {driveFiles.map((file) => {
                const isJson = file.name.endsWith('.json');
                return (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-neon-green/20 transition-all flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        {isJson ? (
                          <FileText className="text-orange-400 w-5 h-5" />
                        ) : (
                          <ImageIcon className="text-emerald-400 w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate font-mono uppercase group-hover:text-neon-green transition-colors">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">
                          Upload: {new Date(file.createdTime).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 hover:bg-neon-green hover:text-black rounded-lg border border-white/10 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                      title="Buka file aslinya di Google Drive"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Two columns: Interactive Actions & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Peminjaman Aktif & Pinjaman Terakhir (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Loans List */}
          <div className="p-6 rounded-[2.5rem] glass">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black italic text-lg tracking-tight text-white font-display flex items-center gap-2">
                <BookOpen size={18} className="text-neon-green" />
                PEMINJAMAN AKTIF ({activeLoans.length})
              </h3>
              <span className="text-[10px] font-mono text-white/30 uppercase">LIVE TRACKING</span>
            </div>

            {activeLoans.length === 0 ? (
              <div className="py-12 text-center rounded-[1.5rem] bg-white/2 pt-10 border border-dashed border-white/5">
                <BookOpen className="text-white/25 w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-bold text-white/50 italic">Tidak ada peminjaman buku aktif.</p>
                <button 
                  onClick={() => onSimulateScan('QR-BOOK-001')}
                  className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold font-mono text-[#D7FF00]"
                >
                  + Pinjam Buku Sekarang (Demo QR-BOOK-001)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeLoans.map((loan) => {
                  const gradient = GET_BOOK_GRADIENT(loan.bookId);
                  const isOverdue = new Date(loan.returnDeadline) < today;

                  return (
                    <div 
                      key={loan.id}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-white/3 border transition-all ${isOverdue ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 hover:border-white/10'}`}
                    >
                      <div className="flex gap-4">
                        {/* Styled mini Cover */}
                        <div className={`w-12 h-16 shrink-0 rounded-lg bg-gradient-to-tr ${gradient} border border-white/15 flex flex-col justify-between p-1.5`}>
                          <span className="text-[6px] font-mono font-bold truncate tracking-tighter text-white/70">IDN</span>
                          <span className="text-[6px] font-mono font-black italic uppercase leading-none truncate text-neon-green">
                            {loan.bookTitle.split(' ')[0]}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm tracking-tight text-white mb-0.5">{loan.bookTitle}</p>
                          <p className="text-[10px] text-white/50 italic leading-none">{loan.bookAuthor}</p>
                          <p className="text-[11px] font-mono text-white/40 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span>Pinjam: <span className="text-white/60">{loan.leaseDate}</span></span>
                            <span>•</span>
                            <span>Batas: <span className={isOverdue ? "text-red-400 font-bold" : "text-white/60"}>{loan.returnDeadline}</span></span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                        {loan.selfieProof && (
                          <div className="relative group">
                            <img 
                              src={loan.selfieProof} 
                              alt="bukti selfie" 
                              className="w-10 h-10 rounded-lg object-cover border border-white/20 hover:scale-150 transition-all duration-300 z-10 hover:z-50" 
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                              <span className="text-[8px] font-mono text-white">Bukti</span>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => onTriggerReturn(loan)}
                          className={`px-4 py-2 rounded-xl text-xs font-black italic uppercase transition-transform hover:scale-105 italic tracking-tighter cursor-pointer ${
                            isOverdue 
                              ? 'bg-red-500 text-white shadow-lg' 
                              : 'bg-electric-blue text-white shadow-md hover:bg-electric-blue/80'
                          }`}
                        >
                          Kembalikan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Riwayat Peminjaman (History Logs) */}
          <div className="p-6 rounded-[2.5rem] glass">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black italic text-lg tracking-tight text-white font-display flex items-center gap-2">
                <History size={18} className="text-electric-blue" />
                RIWAYAT PENJURNALAN ({finishedLoans.length})
              </h3>
              <span className="text-[10px] font-mono text-white/30 uppercase">TRANSACTION LOGS</span>
            </div>

            {finishedLoans.length === 0 ? (
              <p className="py-8 text-center text-xs font-mono text-white/30 italic">Belum ada riwayat pengembalian buku di sistem ini.</p>
            ) : (
              <div className="space-y-3">
                {finishedLoans.map((loan) => {
                  return (
                    <div 
                      key={loan.id}
                      className="flex justify-between items-center p-3.5 rounded-xl bg-white/2 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                          <CheckCircle className="text-emerald-400 w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-white tracking-tight leading-tight">{loan.bookTitle}</p>
                          <p className="text-[10px] text-white/40 leading-none mt-0.5">Dikembalikan pada {loan.returnedAt}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/15 rounded-full uppercase">
                        SUCCESSFUL
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Katalog Buku Simulator (Quick Demo Launchers) */}
        <div className="space-y-6">
          <div className="p-6 rounded-[2.5rem] glass hover:border-white/10 transition-all duration-300">
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="font-black italic text-lg tracking-tight text-white font-display flex items-center gap-2 uppercase">
                <QrCode size={18} className="text-neon-green" />
                Daftar Buku (RFID/QR Simulator)
              </h3>
              <p className="text-xs text-white/40">Klik buku di bawah untuk melakukan simulasi scan tanpa memegang buku fisik.</p>
            </div>

            <div className="space-y-3">
              {books.map((book) => {
                const gradient = GET_BOOK_GRADIENT(book.id);

                return (
                  <div 
                    key={book.id}
                    className="p-3 rounded-2xl bg-white/2 border border-white/5 hover:border-neon-green/30 transition-all flex justify-between items-center group text-left"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      {/* Interactive Mini Cover representation */}
                      <div className={`w-9 h-12 rounded bg-gradient-to-tr ${gradient} border border-white/15 flex flex-col justify-between p-1 shrink-0`}>
                        <span className="text-[5px] font-mono font-bold leading-none text-white/60">IDN</span>
                        <span className="text-[5px] font-mono font-black italic uppercase leading-none truncate text-neon-green">
                          {book.title.split(' ')[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-neon-green transition-colors">{book.title}</p>
                        <p className="text-[10px] text-white/50 truncate italic leading-none mt-0.5">{book.author}</p>
                        <span className="inline-block text-[8px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 bg-white/5 text-white/50">
                          {book.category}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {book.status === 'available' ? (
                        <button
                          onClick={() => onSimulateScan(book.id)}
                          className="p-2 rounded-xl bg-neon-green/10 group-hover:bg-neon-green text-neon-green group-hover:text-black border border-neon-green/20 transition-all cursor-pointer"
                          title="Simulasikan Scan Buku"
                          id={`simulate-scan-${book.id}`}
                        >
                          <Send size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      ) : (
                        <span className="text-[8.5px] font-mono text-white/30 tracking-wider uppercase font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                          Dipinjam
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
