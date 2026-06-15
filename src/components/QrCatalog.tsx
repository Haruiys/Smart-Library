import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Download, Printer, CheckCircle2, Copy, Search, 
  Sparkles, Sliders, ExternalLink, RefreshCw, Camera, Eye
} from 'lucide-react';
import { Book } from '../types';
import { GET_BOOK_GRADIENT } from '../data';

interface QrCatalogProps {
  books: Book[];
  onSimulateScan: (bookId: string) => void;
}

export default function QrCatalog({ books, onSimulateScan }: QrCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book>(books[0] || null);
  const [qrColor, setQrColor] = useState('0d47ff'); // default electric-blue hex (no '#' for api)
  const [qrBgColor, setQrBgColor] = useState('050505'); // dark bg hex
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter books list
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Color preset options for the Web3 futuristic style
  const colorPresets = [
    { name: 'Electric Blue', hex: '0d47ff', class: 'bg-[#0D47FF]' },
    { name: 'Neon Green', hex: 'd7ff00', class: 'bg-[#D7FF00]' },
    { name: 'Hot Crimson', hex: 'ff0d55', class: 'bg-[#FF0D55]' },
    { name: 'Quantum Cyan', hex: '00f0ff', class: 'bg-[#00F0FF]' },
    { name: 'Pure Snow', hex: 'ffffff', class: 'bg-white' },
  ];

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate the high-quality QR code URL from the stable qrserver API
  const getQrUrl = (bookId: string, color: string, bg: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=${color}&bgcolor=${bg}&qzone=2&data=${encodeURIComponent(bookId)}`;
  };

  const handleDownloadQr = async (book: Book) => {
    const url = getQrUrl(book.id, qrColor, qrBgColor);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_PASS_${book.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download QR code image:', err);
      // Fallback redirect
      window.open(url, '_blank');
    }
  };

  const handlePrintSingle = (book: Book) => {
    const qrUrl = getQrUrl(book.id, '000000', 'ffffff'); // force black/white for print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR Pass - IDN Smart Library</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; text-align: center; padding: 40px; color: #111; }
            .badge { border: 2px solid #000; display: inline-block; padding: 25px; border-radius: 12px; margin-top: 50px; }
            h2 { margin: 15px 0 5px 0; font-size: 22px; text-transform: uppercase; }
            p { margin: 0; font-size: 14px; opacity: 0.7; }
            .uuid { font-weight: bold; background: #eee; padding: 4px 10px; font-size: 11px; margin-top: 10px; display: inline-block; border-radius: 4px; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="badge">
            <img src="${qrUrl}" width="220" height="220" />
            <h2>${book.title}</h2>
            <p>Penulis: ${book.author}</p>
            <p class="uuid">UUID: ${book.id}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 text-left" id="qr-catalog-root">
      
      {/* Title */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-black italic tracking-tighter text-white font-display flex items-center gap-2">
          <QrCode className="text-neon-green" />
          MINT & DOWNLOAD BOOK QR PASSES
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Katalog label QR Code pintar untuk dipindai atau ditempel di belakang buku IDN Boarding School Solo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: LIST OF BOOKS WITH QUICK FILTER */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari buku berdasarkan judul, penulis, kategori atau kode UUID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/4 border border-white/5 rounded-2xl py-3 px-11 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-neon-green/30 focus:ring-1 focus:ring-neon-green/10 transition-all font-mono"
              id="qr-catalog-search-input"
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {filteredBooks.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/30 italic glass rounded-2xl border border-white/5">
                Tidak ada buku yang sesuai dengan pencarian Anda.
              </div>
            ) : (
              filteredBooks.map((book) => {
                const isSelected = selectedBook?.id === book.id;
                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setTimeout(() => {
                        document.getElementById('qr-preview-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }, 50);
                    }}
                    className={`p-4 rounded-2xl transition-all duration-200 cursor-pointer text-left border flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-electric-blue/15 border-electric-blue/40 shadow-electric' 
                        : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* CSS Styled mini book preview */}
                      <div className={`w-11 h-14 rounded-lg bg-gradient-to-br ${GET_BOOK_GRADIENT(book.id)} border border-white/10 flex flex-col justify-between p-1.5 shrink-0`}>
                        <span className="text-[6px] font-bold text-white/50 font-mono">IDN</span>
                        <span className="text-[8px] font-black italic text-white truncate leading-none uppercase shrink-0">{book.title}</span>
                      </div>

                      <div className="min-w-0 text-left">
                        <span className="text-[10px] font-mono font-bold text-neon-green tracking-wider uppercase">
                          {book.category}
                        </span>
                        <h4 className="text-sm font-black italic tracking-tight text-white group-hover:text-neon-green transition-colors mt-0.5 truncate uppercase">
                          {book.title}
                        </h4>
                        <p className="text-xs text-white/40 italic font-mono truncate">
                          Code: {book.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSimulateScan(book.id);
                        }}
                        className="p-2 bg-white/5 hover:bg-neon-green hover:text-black rounded-xl border border-white/10 transition-colors text-white"
                        title="Simulasi kamera scan langsung"
                      >
                        <Camera size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BIG PREVIEW AND COSTUMIZER */}
        <div className="lg:col-span-5" id="qr-preview-card">
          <AnimatePresence mode="wait">
            {selectedBook ? (
              <motion.div
                key={selectedBook.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-[2.5rem] bg-gradient-to-tr from-electric-blue/5 to-white/3 border border-white/10 relative overflow-hidden text-center shadow-2xl h-full"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-electric-blue/5 rounded-full blur-[60px] pointer-events-none"></div>

                {/* Subtitle indicators */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[9px] font-mono font-black text-neon-green tracking-[0.2em] uppercase flex items-center gap-1">
                    <Sparkles size={11} className="text-neon-green" />
                    VEGAS QR ENGINE PRO
                  </span>
                  <span className="text-[10px] text-white/50 font-mono">Active</span>
                </div>

                {/* The QR Code Render Stage with Glassmorphism */}
                <div className="relative inline-block p-6 rounded-[2rem] bg-black/60 border border-white/10 shadow-inner group mb-6">
                  {/* Subtle vector scanning laser corners */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D7FF00] rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D7FF00] rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D7FF00] rounded-bl-lg"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D7FF00] rounded-br-lg"></div>

                  <img 
                    src={getQrUrl(selectedBook.id, qrColor, qrBgColor)}
                    alt={`QR Code ${selectedBook.title}`}
                    width={220}
                    height={220}
                    referrerPolicy="no-referrer"
                    className="rounded-xl w-[200px] h-[200px] object-cover bg-dark-bg select-all border border-white/5"
                  />
                </div>

                {/* Book Details info card */}
                <div className="text-left space-y-4 mb-6">
                  <div>
                    <span className="text-[9px] bg-electric-blue/20 text-electric-blue font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">
                      {selectedBook.category}
                    </span>
                    <h3 className="text-xl font-black italic text-white tracking-tight leading-none mt-2 font-display uppercase">
                      {selectedBook.title}
                    </h3>
                    <p className="text-xs text-white/50 italic mt-0.5">by {selectedBook.author}</p>
                  </div>

                  {/* UUID matrix display with copy button */}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/4 border border-white/5 font-mono text-xs">
                    <span className="text-white/40 uppercase tracking-widest text-[9px] font-bold">QR UUID DATA</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{selectedBook.id}</span>
                      <button
                        onClick={() => handleCopyId(selectedBook.id)}
                        className="text-white/40 hover:text-white transition-colors p-1 rounded-md"
                        title="Copy QR Book Code UUID"
                      >
                        {copiedId === selectedBook.id ? (
                          <CheckCircle2 size={13} className="text-neon-green" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-time Web3 Designer Tools */}
                <div className="border-t border-white/5 pt-5 text-left space-y-4 mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-white/50 font-bold uppercase tracking-wider">
                    <Sliders size={12} className="text-neon-green" />
                    Atur Warna QR Code
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.hex}
                        onClick={() => setQrColor(preset.hex)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 border transition-all ${
                          qrColor === preset.hex
                            ? 'border-neon-green/40 text-white bg-white/10'
                            : 'border-white/5 hover:border-white/20 text-white/60'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${preset.class} inline-block shrink-0`} />
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Dark-mode vs Light-mode QR background switcher */}
                  <div className="flex justify-between items-center text-xs font-mono pt-1 text-white/60">
                    <span>Warna Background:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setQrBgColor('050505')}
                        className={`px-2 py-1 rounded text-[10px] transition-all border ${
                          qrBgColor === '050505' ? 'border-[#0D47FF] bg-[#0D47FF]/10 text-white' : 'border-white/5 text-white/40'
                        }`}
                      >
                        Dark (Default)
                      </button>
                      <button
                        onClick={() => setQrBgColor('ffffff')}
                        className={`px-2 py-1 rounded text-[10px] transition-all border ${
                          qrBgColor === 'ffffff' ? 'border-[#0D47FF] bg-white text-black' : 'border-white/5 text-white/40'
                        }`}
                      >
                        White (Standard)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ultimate utility buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDownloadQr(selectedBook)}
                    className="py-3 px-4 rounded-xl font-bold text-xs uppercase bg-[#D7FF00] hover:bg-[#D7FF00]/90 text-black flex items-center justify-center gap-2 hover:scale-103 active:scale-97 cursor-pointer transition-all shadow-neon-sm"
                    id="download-selected-qr-btn"
                  >
                    <Download size={13} />
                    SIMPAN GAMBAR
                  </button>

                  <button
                    onClick={() => handlePrintSingle(selectedBook)}
                    className="py-3 px-4 rounded-xl font-bold text-xs uppercase bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-2 border border-white/5 transition-all outline-none"
                    id="print-selected-qr-btn"
                  >
                    <Printer size={13} />
                    CETAK LABEL
                  </button>
                </div>

                {/* Bottom Simulator shortcut button */}
                <button
                  onClick={() => onSimulateScan(selectedBook.id)}
                  className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-xs uppercase bg-[#0D47FF] hover:bg-[#0D47FF]/90 text-white flex items-center justify-center gap-2 transition-all hover:scale-103 active:scale-97 cursor-pointer border border-[#0D47FF]/30"
                  id="simulate-from-catalog-btn"
                >
                  <Camera size={13} className="animate-pulse" />
                  SIMULASIKAN KAMERA SCAN BUKU INI
                </button>

              </motion.div>
            ) : (
              <div className="py-20 text-center text-xs text-white/30 italic rounded-2xl bg-white/2 border border-white/5 h-full flex flex-col items-center justify-center">
                Pilih buku di sebelah kiri untuk melihat QR Code Passnya.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
