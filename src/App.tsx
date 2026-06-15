import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, BookOpen, QrCode, Sparkles, Layers, ShieldCheck, RefreshCw, Zap
} from 'lucide-react';
import { User } from 'firebase/auth';

// Import datasets & types
import { Book, Loan, Student, ActivePage } from './types';
import { INITIAL_STUDENTS, INITIAL_BOOKS, INITIAL_LOANS } from './data';

// Import layouts/views
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Confirmation from './components/Confirmation';
import Returning from './components/Returning';
import QrCatalog from './components/QrCatalog';

// Google integration imports
import { initAuth, googleSignIn, logout as googleLogout } from './lib/firebase';
import { listDriveFiles, uploadSelfieReceiptToDrive, syncLoansJsonToDrive } from './lib/googleDrive';

export default function App() {
  // --- STATE PERSISTENCE ---
  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentStudent, setCurrentStudent] = useState<Student>(INITIAL_STUDENTS[0]);

  const [books, setBooks] = useState<Book[]>(() => {
    const local = localStorage.getItem('idn_smart_lib_books');
    if (local) {
      try { return JSON.parse(local); } catch (e) { console.error(e); }
    }
    return INITIAL_BOOKS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const local = localStorage.getItem('idn_smart_lib_loans');
    if (local) {
      try { return JSON.parse(local); } catch (e) { console.error(e); }
    }
    return INITIAL_LOANS;
  });

  const [activePage, setActivePage] = useState<ActivePage>('hero');
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  
  // Return transaction focus
  const [activeLoanToReturn, setActiveLoanToReturn] = useState<Loan | null>(null);
  const [successMode, setSuccessMode] = useState<'borrow' | 'return'>('borrow');

  // --- GOOGLE DRIVE AUTH & SYNC STATES ---
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);

  const loadDriveFiles = async (token: string) => {
    try {
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (e) {
      console.error("Gagal memuat arsip Google Drive:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        loadDriveFiles(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleConnect = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        loadDriveFiles(res.accessToken);
      }
    } catch (error) {
      console.error("Connect Google Drive error:", error);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      setGoogleToken(null);
      setDriveFiles([]);
    } catch (error) {
      console.error("Disconnect Google Drive error:", error);
    }
  };

  const handleSyncLedger = async () => {
    if (!googleToken) return;
    setIsDriveSyncing(true);
    try {
      await syncLoansJsonToDrive(googleToken, loans);
      await loadDriveFiles(googleToken);
      alert("Ledger peminjaman berhasil disinkronisasi ke folder Google Drive!");
    } catch (error) {
      console.error("Sync ledger error:", error);
      alert("Gagal sinkronisasi ledger.");
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // Trigger browser sync on books/loans changes
  useEffect(() => {
    localStorage.setItem('idn_smart_lib_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('idn_smart_lib_loans', JSON.stringify(loans));
  }, [loans]);

  // Handle student profile switch
  const handleStudentChange = (student: Student) => {
    setCurrentStudent(student);
    // Reset scanner / confirmation to avoid cross-borrowing states
    setScannedBook(null);
    setActiveLoanToReturn(null);
    // Move to dashboard or hero
    setActivePage('dashboard');
  };

  // Trigger quick demo book simulation click
  const handleSimulateScan = (bookId: string) => {
    const targetBook = books.find(b => b.id === bookId);
    if (targetBook) {
      setScannedBook(targetBook);
      setActivePage('scan');
    }
  };

  // Initiate actions
  const handleInitiateBorrow = () => {
    setActivePage('confirm');
  };

  const handleInitiateReturn = () => {
    if (!scannedBook) return;
    // Find if there is an active loan of this book for ANY user (or prioritize current student)
    let loan = loans.find(l => l.bookId === scannedBook.id && l.status === 'active' && l.studentId === currentStudent.id);
    if (!loan) {
      loan = loans.find(l => l.bookId === scannedBook.id && l.status === 'active');
    }

    if (loan) {
      setActiveLoanToReturn(loan);
      setActivePage('return-view');
    } else {
      // If no active loan exists for this book, simulate borrowing standard behavior
      alert("Buku ini tidak berada dalam status dipinjam oleh siapapun di database sekarang.");
    }
  };

  const handleTriggerReturnDirect = (loan: Loan) => {
    const correspondingBook = books.find(b => b.id === loan.bookId);
    if (correspondingBook) {
      setActiveLoanToReturn(loan);
      setScannedBook(correspondingBook);
      setActivePage('return-view');
    }
  };

  // Confirm and record borrow transaction
  const handleConfirmBorrow = async (
    selfieDataUrl: string, 
    editedStudentName?: string, 
    editedNis?: string, 
    editedClass?: string
  ) => {
    if (!scannedBook) return;

    const today = '2026-06-14';
    const limitDate = '2026-06-21'; // Simple YYYY-MM-DD +7 days matching specs

    const finalStudentName = editedStudentName || currentStudent.name;
    const finalStudentNis = editedNis || currentStudent.nis;
    const finalStudentClass = editedClass || currentStudent.class;

    setIsDriveSyncing(true);
    if (googleToken) {
      try {
        console.log("Uploading selfie directly to Google Drive folder...");
        await uploadSelfieReceiptToDrive(googleToken, selfieDataUrl, {
          bookTitle: scannedBook.title,
          studentName: finalStudentName,
          studentNis: finalStudentNis,
          leaseDate: today
        });
      } catch (err) {
        console.error("Gagal mengunggah foto kyc ke Google Drive:", err);
      }
    }

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: finalStudentName,
      studentNis: finalStudentNis,
      studentClass: finalStudentClass,
      bookId: scannedBook.id,
      bookTitle: scannedBook.title,
      bookAuthor: scannedBook.author,
      bookCover: scannedBook.coverUrl,
      selfieProof: selfieDataUrl,
      leaseDate: today,
      returnDeadline: limitDate,
      returnedAt: null,
      status: 'active'
    };

    const updatedLoans = [newLoan, ...loans];
    // Update book status
    setBooks(prev => prev.map(b => b.id === scannedBook.id ? { ...b, status: 'borrowed' } : b));
    setLoans(updatedLoans);

    if (googleToken) {
      try {
        await syncLoansJsonToDrive(googleToken, updatedLoans);
        await loadDriveFiles(googleToken);
      } catch (err) {
        console.error("Gagal sinkronisasi otomatis ledger ke Google Drive:", err);
      }
    }

    setIsDriveSyncing(false);
    setSuccessMode('borrow');
    setActivePage('success');
  };

  // Confirm and resolve return transaction
  const handleConfirmReturn = async () => {
    if (!activeLoanToReturn) return;

    const todayStr = '2026-06-14';

    const updatedLoans = loans.map(l => l.id === activeLoanToReturn.id ? { ...l, status: 'returned', returnedAt: todayStr } : l);

    // Update loan status to returned
    setLoans(updatedLoans);
    // Update book status to available
    setBooks(prev => prev.map(b => b.id === activeLoanToReturn.bookId ? { ...b, status: 'available' } : b));

    if (googleToken) {
      setIsDriveSyncing(true);
      try {
        await syncLoansJsonToDrive(googleToken, updatedLoans);
        await loadDriveFiles(googleToken);
      } catch (err) {
        console.error("Gagal sinkronisasi otomatis ledger (ret) ke Google Drive:", err);
      } finally {
        setIsDriveSyncing(false);
      }
    }

    setSuccessMode('return');
    setActivePage('success');
  };

  // Reset database simulator back to default arrays
  const handleResetDatabase = () => {
    if (window.confirm("Apakah Anda yakin ingin mengatur ulang data simulasi Smart Library ke setting awal?")) {
      localStorage.removeItem('idn_smart_lib_books');
      localStorage.removeItem('idn_smart_lib_loans');
      setBooks(INITIAL_BOOKS);
      setLoans(INITIAL_LOANS);
      setScannedBook(null);
      setActiveLoanToReturn(null);
      setActivePage('hero');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans overflow-x-hidden selection:bg-neon-green selection:text-black pb-12 relative bg-grid-pattern">
      
      {/* Decorative cyber ambient circles */}
      <div className="fixed top-0 left-0 w-full h-full bg-grid-pattern pointer-events-none opacity-40 z-0"></div>
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-[-10%] w-[500px] h-[500px] bg-neon-green/3 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Primary Top Navigation bar */}
      <Navbar 
        students={students}
        currentStudent={currentStudent}
        onStudentChange={handleStudentChange}
        activePage={activePage}
        onPageChange={(page) => {
          if (page === 'qr-catalog') {
            setActivePage('hero');
            setTimeout(() => {
              document.getElementById('qr-catalog-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          } else {
            setActivePage(page);
            if (page === 'scan') {
              setScannedBook(null); // Clear scanning target when clicking fresh tab
            }
          }
        }}
      />

      {/* Main app sandbox container */}
      <main className="relative pt-24 sm:pt-28 pb-32 md:pb-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto z-10">
        
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: HERO OVERVIEW */}
          {activePage === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-16"
            >
              <Hero 
                currentStudent={currentStudent}
                onStartScanning={() => {
                  setScannedBook(null);
                  setActivePage('scan');
                }}
                onViewStats={() => setActivePage('dashboard')}
                totalBooksCount={books.length}
                availableBooksCount={books.filter(b => b.status === 'available').length}
              />

              {/* QR catalog integrated directly below the main hero overview */}
              <div className="border-t border-white/5 pt-12">
                <QrCatalog 
                  books={books}
                  onSimulateScan={handleSimulateScan}
                />
              </div>
            </motion.div>
          )}

          {/* VIEW 2: STUDENT STATISTICS DASHBOARD */}
          {activePage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <Dashboard 
                currentStudent={currentStudent}
                books={books}
                loans={loans}
                onTriggerReturn={handleTriggerReturnDirect}
                onSimulateScan={handleSimulateScan}
                isDriveConnected={!!googleToken}
                googleUser={googleUser}
                onConnectDrive={handleGoogleConnect}
                onDisconnectDrive={handleGoogleDisconnect}
                driveFiles={driveFiles}
                isDriveSyncing={isDriveSyncing}
                onSyncLedger={handleSyncLedger}
              />
            </motion.div>
          )}

          {/* VIEW 3: SCAN QR BOOK PAGE */}
          {activePage === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <Scanner 
                books={books}
                loans={loans}
                currentStudent={currentStudent}
                scannedBook={scannedBook}
                onBookScanned={setScannedBook}
                onInitiateBorrow={handleInitiateBorrow}
                onInitiateReturn={handleInitiateReturn}
              />
            </motion.div>
          )}

          {/* VIEW 3.5: BOOK QR CODE PASSES CATALOG */}
          {activePage === 'qr-catalog' && (
            <motion.div
              key="qr-catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <QrCatalog 
                books={books}
                onSimulateScan={handleSimulateScan}
              />
            </motion.div>
          )}

          {/* VIEW 4: BORROW VERIFICATION & SELFIE CONFIRMATION */}
          {activePage === 'confirm' && scannedBook && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <Confirmation 
                book={scannedBook}
                currentStudent={currentStudent}
                onConfirm={handleConfirmBorrow}
                onCancel={() => {
                  setScannedBook(null);
                  setActivePage('scan');
                }}
                isDriveConnected={!!googleToken}
                googleUserEmail={googleUser?.email || undefined}
              />
            </motion.div>
          )}

          {/* VIEW 5: PENGEMBALIAN BUKU ENTRY */}
          {activePage === 'return-view' && activeLoanToReturn && scannedBook && (
            <motion.div
              key="return-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <Returning 
                loan={activeLoanToReturn}
                book={scannedBook}
                onConfirmReturn={handleConfirmReturn}
                onCancel={() => {
                  setActiveLoanToReturn(null);
                  setActivePage('dashboard');
                }}
              />
            </motion.div>
          )}

          {/* VIEW 6: SUCCESS ANIMATION STATE SCREEN */}
          {activePage === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto text-center py-16 space-y-8"
              id="success-view-wrapper"
            >
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-neon-green/30 rounded-full blur-xl animate-pulse"></div>
                <div className="w-32 h-32 bg-neon-green rounded-full flex items-center justify-center shadow-neon">
                  <CheckCircle2 size={72} className="text-black" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white font-display">
                  {successMode === 'borrow' ? "PINJAMAN DISETUJUI!" : "BUKU DIKEMBALIKAN!"}
                </h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  {successMode === 'borrow' 
                    ? `Transaksi peminjaman buku "${scannedBook?.title}" berhasil disahkan dalam sistem IDN Boarding School` 
                    : `Data inventaris server telah disinkronkan. Terimakasih telah membaca tepat waktu.`
                  }
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-success text-xs font-mono text-neon-green inline-block uppercase tracking-widest font-bold">
                🔒 TRANSACTION BLOCK DIGITALLY SIGNED SYNCED
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setScannedBook(null);
                    setActiveLoanToReturn(null);
                    setActivePage('dashboard');
                  }}
                  className="px-8 py-4 bg-neon-green text-black font-black italic tracking-tighter uppercase rounded-2xl hover:scale-105 active:scale-95 shadow-neon transition-all cursor-pointer"
                  id="success-home-btn"
                >
                  KEMBALI KE DASHBOARD
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Cyberpunk status bar footer */}
      <footer className="mt-12 text-center text-white/20 font-mono text-[9px] tracking-widest max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center bg-transparent gap-4 pt-6 border-t border-white/5 relative z-10 mb-6">
        <p>© 2026 IDN BOARDING SCHOOL SOLO. ALL SECURE PROTOCOLS APPLIED.</p>
        <div className="flex gap-4">
          <button 
            onClick={handleResetDatabase}
            className="text-white/25 hover:text-red-400 font-bold tracking-normal underline underline-offset-2 transition-colors cursor-pointer"
            id="reset-db-btn"
          >
            Reset Database Simulasi
          </button>
          <span>|</span>
          <span>NODE STATE: SECURE-LIVE</span>
        </div>
      </footer>
    </div>
  );
}
