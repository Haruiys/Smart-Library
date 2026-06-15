import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, CheckCircle, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { Book, Loan } from '../types';
import { GET_BOOK_GRADIENT } from '../data';

interface ReturningProps {
  loan: Loan;
  book: Book;
  onConfirmReturn: () => void;
  onCancel: () => void;
}

export default function Returning({
  loan,
  book,
  onConfirmReturn,
  onCancel
}: ReturningProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left" id="returning-wrapper">
      
      {/* Title */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white font-display">
            PENGEMBALIAN BUKU
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Verifikasi data transaksi pengembalian buku dan konfirmasi ke sistem perpustakaan.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition-all font-mono"
          id="returning-back-btn"
        >
          Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Borrow Photo Proof & Student Pass */}
        <div className="space-y-6">
          <div className="p-6 rounded-[2.5rem] glass hover:border-white/10 transition-all flex flex-col items-center relative overflow-hidden">
            <h3 className="font-black italic text-sm tracking-widest text-[#0D47FF] font-display uppercase mb-4 flex items-center gap-2">
              <UserCheck size={16} />
              FOTO BUKTI PEMINJAMAN
            </h3>

            {/* Displaying the historic taken selfie proof */}
            <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-black border border-white/10 relative shadow-2xl">
              {loan.selfieProof ? (
                <img 
                  src={loan.selfieProof} 
                  alt="Historic borrow face verification selfie" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 italic">
                  Tidak ada data selfie terlampir.
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

              {/* Watermark label */}
              <div className="absolute bottom-4 left-4 text-left font-mono text-[9px] text-white/50 space-y-0.5 leading-none z-10">
                <p>NAMA: <span className="text-white font-bold">{loan.studentName}</span></p>
                <p>NIS: <span className="text-neon-green font-bold">{loan.studentNis}</span></p>
                <p>LEVEL: <span className="text-white font-bold">{loan.studentClass}</span></p>
              </div>
            </div>

            <p className="text-[10px] text-white/40 text-center mt-3 italic max-w-xs">
              Foto bukti di atas diambil otomatis ketika siswa memproses aktivasi peminjaman buku.
            </p>
          </div>
        </div>

        {/* Right: Book details, Dates & Kembalikan Buku submit Button */}
        <div className="flex flex-col justify-between p-8 rounded-[2.5rem] bg-white/3 border border-indigo-500/10 backdrop-blur-xl relative shadow-2xl h-full">
          
          <div className="space-y-6">
            <span className="text-[9px] font-mono font-black text-neon-green tracking-[0.2em] uppercase bg-neon-green/10 border border-neon-green/20 px-3 py-1 rounded-full">
              SECURE RECORD VERIFICATION
            </span>

            {/* Book Metadata details */}
            <div className="flex gap-4 items-center pt-2">
              <div className={`w-14 h-20 rounded-xl bg-gradient-to-tr ${GET_BOOK_GRADIENT(book.id)} border border-white/20 flex flex-col justify-between p-2 shrink-0 shadow-lg`}>
                <span className="text-[7px] font-mono text-white/40">IDN</span>
                <span className="text-[8px] font-mono font-black italic uppercase text-neon-green truncate">
                  {book.title.split(' ')[0]}
                </span>
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{book.category}</p>
                <h3 className="text-xl font-black italic tracking-tight text-white uppercase font-display leading-tight mt-1 truncate">
                  {book.title}
                </h3>
                <p className="text-white/50 text-xs italic">by {book.author}</p>
              </div>
            </div>

            {/* Time parameters matrix */}
            <div className="space-y-3 pt-6 border-t border-white/15 font-mono text-xs">
              
              <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                <span className="text-white/40 uppercase tracking-wider">PEMINJAM RESPONDEN</span>
                <span className="text-white font-black italic font-sans text-sm">{loan.studentName}</span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                <span className="text-white/40 uppercase tracking-wider">TANGGAL PINJAM</span>
                <span className="text-white font-bold">{loan.leaseDate}</span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                <span className="text-[#0D47FF] uppercase tracking-wider font-bold">BATAS PENGEMBALIAN</span>
                <span className="text-white font-bold">{loan.returnDeadline}</span>
              </div>

              {/* Status Indicator */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/40 uppercase tracking-wider">DURASI PINJAM</span>
                <span className="text-neon-green font-black italic flex items-center gap-1">
                  <Clock size={12} />
                  7 HARI MAKSIMAL
                </span>
              </div>

            </div>
          </div>

          <div className="pt-8 border-t border-white/5 mt-8 space-y-4">
            {/* The main: "Kembalikan Buku" action button */}
            <button
              onClick={onConfirmReturn}
              className="w-full py-4 px-6 bg-electric-blue hover:shadow-[0_0_35px_rgba(13,71,255,0.45)] hover:scale-105 active:scale-95 text-white font-black italic tracking-tighter uppercase rounded-2xl transition-all font-display text-center cursor-pointer"
              id="returning-submit-btn"
            >
              KEMBALIKAN BUKU SEKARANG
            </button>
            <p className="text-[10px] text-center text-white/30 font-mono">
              Status buku akan diperbarui seketika menjadi "Tersedia" di server IDN.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
