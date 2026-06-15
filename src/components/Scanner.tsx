import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, QrCode, Clipboard, AlertCircle, Info, BookOpen, Loader2, ArrowLeft, RotateCcw } from 'lucide-react';
import { Book, Loan, Student } from '../types';
import { GET_BOOK_GRADIENT } from '../data';

interface ScannerProps {
  books: Book[];
  loans: Loan[];
  currentStudent: Student;
  scannedBook: Book | null;
  onBookScanned: (book: Book | null) => void;
  onInitiateBorrow: () => void;
  onInitiateReturn: () => void;
}

export default function Scanner({
  books,
  loans,
  currentStudent,
  scannedBook,
  onBookScanned,
  onInitiateBorrow,
  onInitiateReturn
}: ScannerProps) {
  const [useWebcam, setUseWebcam] = useState(true);
  const [cameraPermissionErr, setCameraPermissionErr] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [radarScanning, setRadarScanning] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize native webcam
  useEffect(() => {
    if (useWebcam && !scannedBook) {
      setCameraPermissionErr(null);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        })
        .catch(err => {
          console.error("Camera access error:", err);
          setCameraPermissionErr("Akses kamera ditolak atau tidak ditemukan perangkat kamera. Silakan pakai simulator scan cepat.");
          setUseWebcam(false);
        });
    }

    return () => {
      // Cleanup video stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [useWebcam, scannedBook]);

  // Simulate scanning code manually
  const handleManualScan = (code: string) => {
    const foundBook = books.find(b => b.id.toLowerCase() === code.trim().toLowerCase());
    if (foundBook) {
      onBookScanned(foundBook);
    } else {
      alert("Kode QR Buku tidak valid. Silakan coba kode: QR-BOOK-001, QR-BOOK-002, QR-BOOK-003, QR-BOOK-004, QR-BOOK-005");
    }
  };

  const handleResetScanner = () => {
    onBookScanned(null);
  };

  // Find if this book is currently borrowed by the student to suggest correct action or show state
  const isCurrentlyBorrowedByMe = loans.some(l => l.bookId === scannedBook?.id && l.studentId === currentStudent.id && l.status === 'active');
  const isBorrowedByOthers = loans.some(l => l.bookId === scannedBook?.id && l.studentId !== currentStudent.id && l.status === 'active');

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-left" id="scanner-view-wrapper">
      
      {/* Title */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-black italic tracking-tighter text-white font-display">
          SCAN QR CODE BUKU
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Arahkan kamera ke kode QR di belakang buku, atau gunakan Simulator Kode Cepat di bawah.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!scannedBook ? (
          /* SCANNER RADAR / WEBCAM INPUT PANEL */
          <motion.div
            key="scanning-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* The main webcam / radar target simulator container */}
            <div className="relative aspect-square md:aspect-video rounded-[2.5rem] border-4 border-electric-blue overflow-hidden shadow-electric bg-dark-bg glass-accent">
              
              {/* Outer boundary guides */}
              <div className="absolute inset-0 z-10 border-[30px] sm:border-[40px] border-black/50 pointer-events-none"></div>
              
              {/* Pulsing neon target scanner markers */}
              <div className="absolute inset-[15%] sm:inset-[20%] border-2 border-dashed border-neon-green/30 rounded-[2rem] pointer-events-none flex items-center justify-center">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-neon-green rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neon-green rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neon-green rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-neon-green rounded-br-xl"></div>
              </div>

              {/* Laser line scanning down and up */}
              <div className="absolute left-[15%] right-[15%] h-[2px] bg-neon-green/70 shadow-neon animate-scan z-10"></div>

              {/* Central QR watermark scanner target icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <QrCode className="w-16 h-16 text-neon-green/10 animate-pulse mt-4" />
              </div>

              {/* Native video webcam frame stream or visual animation */}
              {useWebcam && !cameraPermissionErr ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-[2rem] scale-105"
                />
              ) : (
                /* Fallback Graphic Radar Simulator if camera is disabled or fails */
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/90 relative p-6">
                  {/* Rotating radial scan graphic */}
                  <div className="absolute w-44 h-44 rounded-full border border-neon-green/10 flex items-center justify-center animate-spin-slow">
                    <div className="w-2 rounded-full h-22 bg-neon-green/30 origin-bottom"></div>
                  </div>
                  <Camera className="w-12 h-12 text-neon-green/30 mb-2" />
                  <p className="text-xs font-mono text-neon-green font-bold tracking-widest uppercase">
                    SIMULATOR SCAN AKTIF
                  </p>
                  <p className="text-[11px] text-white/40 text-center max-w-sm mt-1 italic">
                    {cameraPermissionErr || "Menggunakan sensor virtual untuk deteksi kode IDN Book."}
                  </p>
                </div>
              )}

              {/* Bottom Quick Test Trigger overlay buttons */}
              <div className="absolute bottom-6 left-0 w-full z-20 flex flex-wrap justify-center gap-2 px-6">
                {books.slice(0, 3).map((book) => {
                  return (
                    <button
                      key={book.id}
                      onClick={() => onBookScanned(book)}
                      className="px-3.5 py-1.5 bg-black/80 hover:bg-neon-green hover:text-black hover:scale-105 text-[10px] font-mono text-white/90 font-bold border border-white/10 rounded-xl transition-all cursor-pointer shadow-lg"
                      id={`simulate-scan-onair-${book.id}`}
                    >
                      Scan {book.title.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick manual entry or webcam switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 pl-2">
                <Info size={16} className="text-neon-green shrink-0" />
                <p className="text-xs text-white/60">
                  {useWebcam ? "Webcam aktif." : "Simulator RFID/QR manual aktif."}{' '}
                  <button 
                    onClick={() => setUseWebcam(!useWebcam)}
                    className="text-neon-green font-bold underline hover:text-white transition-colors"
                  >
                    {useWebcam ? "Matikan kamera" : "Aktifkan kamera"}
                  </button>
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik Kode QR (contoh: QR-BOOK-001)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualScan(manualCode)}
                  className="bg-black/40 border border-white/15 px-4 py-2 rounded-xl text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-neon-green/50 w-full sm:w-56"
                  id="manual-qr-input"
                />
                <button
                  onClick={() => handleManualScan(manualCode)}
                  className="px-4 py-2 bg-electric-blue text-white font-bold rounded-xl text-xs hover:bg-electric-blue/80 transition-all font-mono"
                  id="manual-qr-submit"
                >
                  LOAD
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* QR CODE SUCCESS DETECTED CARD VIEW */
          <motion.div
            key="scanned-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-1 rounded-[2.5rem] bg-gradient-to-tr from-electric-blue/30 via-neon-green/30 to-transparent p-[1.5px] shadow-2xl"
          >
            <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#050505] space-y-8">
              
              {/* Scanned head badge */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <span className="text-[10px] font-mono font-black text-neon-green tracking-[0.25em] uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-green animate-ping"></span>
                  QR SCREENING DETECTED SUCCESSFUL
                </span>
                <button
                  onClick={handleResetScanner}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white font-mono font-bold"
                  id="scanner-back-btn"
                >
                  <RotateCcw size={13} />
                  Scan Buku Lain
                </button>
              </div>

              {/* Big Book Card details with beautiful styling */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Simulated cover card with futuristic gradients & dynamic styling */}
                <div 
                  className={`w-full md:w-48 aspect-[3/4] rounded-3xl bg-gradient-to-br ${GET_BOOK_GRADIENT(scannedBook.id)} shadow-electric shrink-0 flex flex-col justify-between p-6 relative overflow-hidden group border border-white/20`}
                >
                  {/* Subtle matrix design over cover */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-20 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="z-10 flex justify-between items-start">
                    <span className="text-[9px] font-mono tracking-wider text-white/80 uppercase font-black bg-black/40 px-2 py-0.5 rounded">
                      IDN BOOKPASS
                    </span>
                    <span className="text-xs text-white/40 font-mono">0.0.1</span>
                  </div>

                  <div className="z-10 text-left">
                    <p className="text-[10px] font-mono text-neon-green tracking-widest font-black uppercase">
                      {scannedBook.category}
                    </p>
                    <h3 className="text-2xl font-black tracking-tight leading-none italic text-white uppercase font-display mt-1">
                      {scannedBook.title}
                    </h3>
                    <p className="text-[11px] text-white/70 italic font-medium mt-1">
                      by {scannedBook.author}
                    </p>
                  </div>
                </div>

                {/* Details Table */}
                <div className="flex-1 space-y-6 text-left w-full">
                  <div>
                    <span className="text-xs bg-electric-blue/20 text-electric-blue font-bold tracking-widest font-mono uppercase px-3 py-1 rounded-full border border-electric-blue/30 inline-block">
                      {scannedBook.category}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white font-display mt-3 uppercase">
                      {scannedBook.title}
                    </h2>
                    <p className="text-white/50 text-base italic mt-1">
                      Karya ilmiah oleh <span className="text-white font-bold">{scannedBook.author}</span> ({scannedBook.year})
                    </p>
                  </div>

                  {/* Informational description */}
                  {scannedBook.description && (
                    <p className="text-xs text-white/60 leading-relaxed font-sans italic border-l-2 border-neon-green pl-3">
                      {scannedBook.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 font-mono text-xs">
                    <div>
                      <p className="text-white/40 uppercase tracking-wider">BOOK UUID CODE</p>
                      <p className="text-white font-bold mt-1 text-sm">{scannedBook.id}</p>
                    </div>
                    <div>
                      <p className="text-white/40 uppercase tracking-wider">STATUS KOLEKSI</p>
                      {scannedBook.status === 'available' ? (
                        <p className="text-neon-green font-black mt-1 text-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-green"></span>
                          TERSEDIA (AVAILABLE)
                        </p>
                      ) : (
                        <p className="text-white/40 font-bold mt-1 text-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                          SEDANG DIPINJAM
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action buttons: neon green for borrow, blue for return */}
              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                {/* 1. Pinjam Buku Button - Neon Green */}
                <button
                  disabled={scannedBook.status !== 'available'}
                  onClick={onInitiateBorrow}
                  className={`flex-1 py-4 px-6 rounded-2xl font-black italic tracking-tighter uppercase transition-all duration-200 text-black font-display cursor-pointer ${
                    scannedBook.status === 'available'
                      ? 'bg-neon-green hover:shadow-[0_0_30px_rgba(215,255,0,0.4)] hover:scale-105 active:scale-95'
                      : 'bg-zinc-800 text-white/30 border border-white/5 cursor-not-allowed opacity-40'
                  }`}
                  id="scanner-confirm-borrow-btn"
                >
                  {scannedBook.status === 'available' ? 'PINJAM BUKU SEKARANG' : 'BUKU SEDANG DIPINJAM'}
                </button>

                {/* 2. Kembalikan Buku Button - Blue */}
                <button
                  onClick={onInitiateReturn}
                  className="flex-1 py-4 px-6 rounded-2xl font-black italic tracking-tighter uppercase transition-all duration-200 text-white font-display cursor-pointer bg-electric-blue hover:shadow-[0_0_30px_rgba(13,71,255,0.4)] hover:scale-105 active:scale-95 border border-electric-blue/30"
                  id="scanner-confirm-return-btn"
                >
                  KEMBALIKAN BUKU INI
                </button>
              </div>

              {/* Conditional Alert Messages */}
              {isCurrentlyBorrowedByMe && (
                <div className="bg-electric-blue/10 border border-electric-blue/20 p-4 rounded-xl text-xs text-white/80 flex items-center gap-2">
                  <Info size={16} className="text-electric-blue" />
                  <p>Anda sedang meminjam buku ini. Tekan tombol <span className="text-white font-bold">Kembalikan Buku Ini</span> jika ingin menyudahi.</p>
                </div>
              )}

              {isBorrowedByOthers && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-white/80 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400" />
                  <p>Buku ini dipinjam siswa lain. Siswa berwenang dapat menekan <span className="text-white font-bold">Kembalikan</span> untuk memasukkan kembali buku ke rak.</p>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
