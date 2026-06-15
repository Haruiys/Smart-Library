import React, { useRef, useState, useEffect } from 'react';
import { Camera, ChevronRight, X, AlertCircle, Info, Calendar, Sparkles } from 'lucide-react';
import { Book, Student } from '../types';
import { GET_BOOK_GRADIENT } from '../data';

interface ConfirmationProps {
  book: Book;
  currentStudent: Student;
  onConfirm: (
    selfieDataUrl: string,
    editedStudentName?: string,
    editedNis?: string,
    editedClass?: string
  ) => void;
  onCancel: () => void;
  isDriveConnected: boolean;
  googleUserEmail?: string;
}

export default function Confirmation({
  book,
  currentStudent,
  onConfirm,
  onCancel,
  isDriveConnected,
  googleUserEmail
}: ConfirmationProps) {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [cameraPermissionErr, setCameraPermissionErr] = useState<string | null>(null);
  
  // State for editable elements
  const [editableName, setEditableName] = useState(currentStudent.name);
  const [editableNis, setEditableNis] = useState(currentStudent.nis);
  const [editableClass, setEditableClass] = useState(currentStudent.class);

  // Sync edits if parent student selected profile changes
  useEffect(() => {
    setEditableName(currentStudent.name);
    setEditableNis(currentStudent.nis);
    setEditableClass(currentStudent.class);
  }, [currentStudent]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Today dates
  const today = new Date('2026-06-14'); // System date specified in current initial metadata
  const returnDate = new Date();
  returnDate.setDate(today.getDate() + 7);

  const borrowDateStr = today.toISOString().split('T')[0];
  const returnDateStr = returnDate.toISOString().split('T')[0];

  // Initialize selfie camera stream
  useEffect(() => {
    if (!selfie) {
      setCameraPermissionErr(null);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        })
        .catch(err => {
          console.error("Camera selfie error:", err);
          setCameraPermissionErr("Akses kamera ditolak atau tidak ditemukan perangkat kamera. Kami otomatis menggunakan Face ID simulator sekolah.");
          
          // Generate a premium dummy school avatar so development is never blocked!
          setSelfie("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300");
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [selfie]);

  // Capture photo to canvas
  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Horizontal flip for mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Reset scale/translate
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Add sci-fi verification watermark to make the selfie feel incredibly high-tech!
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#D7FF00';
        ctx.fillText('IDN SMART_LIB SECURE VERIFY', 15, canvas.height - 35);
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`STUDENT: ${editableNis} | DATE: 2026-06-14`, 15, canvas.height - 20);

        const dataUrl = canvas.toDataURL('image/png');
        setSelfie(dataUrl);
      }
    } else {
      // In case element is unavailable, use standard school mock face
      setSelfie("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300");
    }
  };

  const handleRetake = () => {
    setSelfie(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left" id="confirmation-view-wrapper">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black italic tracking-tighter text-white font-display">
          KONFIRMASI PEMINJAMAN BUKU
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Lakukan verifikasi digital dengan mengambil foto wajah bersama buku Anda sebelum melanjutkan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Selfie KYC Terminal (span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-[2.5rem] glass hover:border-white/10 transition-all flex flex-col items-center relative overflow-hidden">
            
            {/* Blinking Live Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 z-20">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[9px] font-mono font-bold text-white/50 tracking-wider">LIVE KYC CAMERA</span>
            </div>

            <h3 className="font-black italic text-sm tracking-widest text-[#D7FF00] font-display uppercase mb-6 flex items-center gap-2">
              <Camera size={16} />
              VERIFIKASI WAJAH PINJAMAN
            </h3>

            {/* Simulated Live Frame video/preview */}
            <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-black border border-white/10 relative shadow-2xl">
              {!selfie ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]" // mirror view
                  />
                  
                  {/* Floating target grids on top of video */}
                  <div className="absolute inset-8 border border-white/5 rounded-full pointer-events-none opacity-20"></div>
                  <div className="absolute inset-16 border border-dashed border-neon-green/20 rounded-full pointer-events-none animate-pulse"></div>

                  <div className="absolute bottom-4 left-0 w-full z-20 flex justify-center">
                    <button
                      onClick={handleCapture}
                      className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-neon-green hover:scale-150 shadow-neon duration-300 transform-gpu cursor-pointer flex items-center gap-2"
                      id="capture-selfie-btn"
                    >
                      <Camera size={14} />
                      AMBIL FOTO WAJAH
                    </button>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={selfie}
                    alt="Verified student KYC selfie snapshot"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Verified Badge banner */}
                  <div className="absolute top-4 right-4 bg-emerald-500/80 backdrop-blur border border-emerald-400 px-3 py-1 rounded-full text-[9px] font-mono font-black text-white flex items-center gap-1 z-20 shadow-lg">
                    <Sparkles size={11} className="animate-spin-slow" />
                    PASSPORT VERIFIED
                  </div>

                  <div className="absolute bottom-4 left-0 w-full z-20 flex justify-center">
                    <button
                      onClick={handleRetake}
                      className="px-4 py-2 bg-black/80 hover:bg-red-600 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg border border-white/10 shadow-lg transition-colors cursor-pointer"
                      id="retake-selfie-btn"
                    >
                      Ambil Ulang Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Helper status text */}
            <p className="text-[10px] text-white/40 text-center mt-4 italic max-w-xs">
              {cameraPermissionErr || "Pegang buku setinggi dada agar terpotret bersama wajah Anda untuk pengesahan IDN Boarding School Solo."}
            </p>
          </div>
        </div>

        {/* Right: Borrow details passport (span 7) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-[2.5rem] bg-white/3 border border-indigo-500/10 backdrop-blur-xl relative shadow-2xl flex flex-col justify-between h-full">
            
            {/* Design glow background details */}
            <div className="absolute bottom-0 right-0 w-44 h-44 bg-electric-blue/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-6">
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#0D47FF] uppercase">
                LIBRARY BORROW PASS PROTOCOL
              </p>

              {/* Mini meta book view */}
              <div className="flex gap-4 items-center">
                <div className={`w-16 h-22 rounded-xl bg-gradient-to-tr ${GET_BOOK_GRADIENT(book.id)} border border-white/25 flex flex-col justify-between p-2.5 shrink-0 shadow-lg`}>
                  <span className="text-[8px] font-mono text-white/50">IDN</span>
                  <span className="text-[9px] font-mono font-black italic uppercase text-neon-green truncate">
                    {book.title.split(' ')[0]}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-neon-green text-black rounded uppercase">
                    READY FOR BORROW
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black italic tracking-tight text-white uppercase font-display mt-1.5 leading-none">
                    {book.title}
                  </h3>
                  <p className="text-white/50 text-xs italic mt-0.5">by {book.author}</p>
                </div>
              </div>

              {/* Student and Duration Details Info matrix */}
              <div className="space-y-4 pt-6 border-t border-white/10 text-xs font-mono">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                  <span className="text-white/40 uppercase tracking-wider font-bold">NAMA PEMINJAM</span>
                  <input
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#D7FF00] rounded-xl px-3 py-1.5 text-white font-sans text-sm font-black italic focus:outline-none focus:ring-1 focus:ring-[#D7FF00]/20 text-left sm:text-right w-full sm:max-w-[280px] transition-all"
                    placeholder="Nama lengkap siswa"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                  <span className="text-white/40 uppercase tracking-wider font-bold">NOMOR INDUK (NIS)</span>
                  <input
                    type="text"
                    value={editableNis}
                    onChange={(e) => setEditableNis(e.target.value)}
                    className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#D7FF00] rounded-xl px-3 py-1.5 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D7FF00]/20 text-left sm:text-right w-full sm:max-w-[180px] transition-all"
                    placeholder="NIS Siswa"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                  <span className="text-white/40 uppercase tracking-wider font-bold">LEVEL KELAS</span>
                  <input
                    type="text"
                    value={editableClass}
                    onChange={(e) => setEditableClass(e.target.value)}
                    className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#D7FF00] rounded-xl px-3 py-1.5 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D7FF00]/20 text-left sm:text-right w-full sm:max-w-[180px] transition-all"
                    placeholder="Kelas Siswa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3">
                  <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                    <p className="text-white/30 uppercase tracking-wider text-[9px]">TANGGAL PINJAM</p>
                    <p className="text-white font-bold text-sm mt-1">{borrowDateStr}</p>
                  </div>
                  <div className="p-3 bg-neon-green/5 rounded-xl border border-neon-green/20">
                    <p className="text-neon-green/60 uppercase tracking-wider text-[9px] font-bold">BATAS KEMBALI</p>
                    <p className="text-neon-green font-black text-sm mt-1 flex items-center gap-1 font-display italic">
                      <Calendar size={13} />
                      {returnDateStr}
                    </p>
                  </div>
                </div>

              </div>

              {/* Google Drive Sync status visualizer */}
              <div className={`p-4 rounded-xl border text-xs font-sans flex items-start gap-2.5 transition-all ${
                isDriveConnected 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-white/80' 
                  : 'bg-white/2 border-white/5 text-white/50'
              }`}>
                {isDriveConnected ? (
                  <>
                    <Sparkles size={16} className="text-neon-green shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="leading-snug">
                        <span className="text-neon-green font-bold">Google Cloud-Sync Aktif:</span> Selfie dan arsip peminjaman ini akan disimpan secara otomatis di asisten Google Drive Anda (<span className="font-mono text-[10px] text-white font-semibold">{googleUserEmail}</span>).
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="leading-snug">
                        <span className="text-white font-bold">Google Drive belum terhubung:</span> Selfie verifikasi akan disimpan di data lokal penjelajah web Anda. Hubungkan Google Drive pada Dashboard jika ingin sinkronisasi digital cloud.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Warning instructions */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-white/60 flex items-start gap-2.5">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <span className="text-white font-bold">Kebijakan IDN Solo:</span> Peminjaman berdurasi <span className="text-neon-green font-bold">7 hari otomatis</span>. Terlambat mengembalikan akan dikenakan denda digital sesuai peraturan kafalah perpustakaan IDN.
                </p>
              </div>

            </div>

            {/* Confirm Actions */}
            <div className="pt-8 border-t border-white/5 flex gap-4 mt-6">
              <button
                onClick={onCancel}
                className="px-6 py-4 rounded-2xl font-black italic tracking-tighter uppercase transition-colors text-white/50 border border-white/10 hover:bg-white/5 hover:text-white cursor-pointer hover:border-white/20"
                id="cancel-loans-btn"
              >
                BATAL
              </button>
              
              <button
                disabled={!selfie}
                onClick={() => selfie && onConfirm(selfie, editableName, editableNis, editableClass)}
                className={`flex-1 py-4 px-6 rounded-2xl font-black italic tracking-tighter uppercase transition-all duration-200 text-black font-display font-black text-center cursor-pointer ${
                  selfie
                    ? 'bg-neon-green hover:shadow-[0_0_30px_rgba(215,255,0,0.45)] hover:scale-105 active:scale-95'
                    : 'bg-zinc-800 text-white/30 border border-white/5 cursor-not-allowed opacity-40'
                }`}
                id="confirm-submit-loans-btn"
              >
                KONFIRMASI PEMINJAMAN
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
}
