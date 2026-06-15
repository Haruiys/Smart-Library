import { Book, Student, Loan } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-1",
    name: "Office Library Account",
    nis: "2024001",
    class: "XII RPL A",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "std-2",
    name: "Muhammad Raihan",
    nis: "2024005",
    class: "XII RPL B",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "std-3",
    name: "Yusuf Al-Fatih",
    nis: "2024012",
    class: "XI TKJ A",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: "QR-BOOK-001",
    title: "Rust for Web3 Infrastructure",
    author: "Satoshi Tanaka",
    category: "Web3 & Blockchain",
    coverUrl: "", // We can generate gorgeous CSS-styled cover mockups on-the-fly dynamically with SVG/gradients to look clean and futuristic!
    status: "available",
    isbn: "978-3-16-148410-0",
    year: "2025",
    description: "Panduan lengkap membangun protokol ter-desentralisasi yang aman, berkinerja tinggi, dan scalable menggunakan bahasa pemrograman Rust."
  },
  {
    id: "QR-BOOK-002",
    title: "Refactoring: Improving Code Design",
    author: "Martin Fowler",
    category: "Software Engineering",
    coverUrl: "",
    status: "available",
    isbn: "978-0-13-475759-9",
    year: "2024",
    description: "Karya legendaris tentang merestrukturisasi kode tanpa mengubah perilaku eksternal untuk melahirkan arsitektur software yang bersih."
  },
  {
    id: "QR-BOOK-003",
    title: "Supervised Learning in Neural Nets",
    author: "Dr. Adrian Vance",
    category: "Artificial Intelligence",
    coverUrl: "",
    status: "borrowed", // Pre-borrowed
    isbn: "978-1-59-327950-9",
    year: "2026",
    description: "Eksplorasi mendalam algoritma convolutional neural network untuk pengolahan citra digital tingkat lanjut pada industri otomotif."
  },
  {
    id: "QR-BOOK-004",
    title: "Ethereum Smart Contracts & Solidity",
    author: "Vitalik McCreery",
    category: "Web3 & Blockchain",
    coverUrl: "",
    status: "available",
    isbn: "978-1-49-205107-7",
    year: "2025",
    description: "Panduan praktis perancangan smart contract yang tahan sensor, efisien biaya gas fee, dan diaudit secara optimal dari celah keamanan."
  },
  {
    id: "QR-BOOK-005",
    title: "Zero Trust Network Security Architecture",
    author: "Sarah Jenkins & Leon Wu",
    category: "Cyber Security",
    coverUrl: "",
    status: "available",
    isbn: "978-0-59-652068-7",
    year: "2026",
    description: "Melindungi infrastruktur server sekolah, cloud, dan IoT dengan paradigma 'Never Trust, Always Verify' di era ancaman siber modern."
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: "loan-prev-1",
    studentId: "std-1",
    studentName: "Office Library Account",
    studentNis: "2024001",
    studentClass: "XII RPL A",
    bookId: "QR-BOOK-003",
    bookTitle: "Supervised Learning in Neural Nets",
    bookAuthor: "Dr. Adrian Vance",
    bookCover: "",
    selfieProof: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300", // Pre-made mock selfie
    leaseDate: "2026-06-12",
    returnDeadline: "2026-06-19",
    returnedAt: null,
    status: "active"
  }
];

// Aesthetic gradients generator for custom Web3 covers
export const GET_BOOK_GRADIENT = (id: string) => {
  const gradients = [
    "from-indigo-600 to-electric-blue",
    "from-cyan-500 to-electric-blue",
    "from-purple-600 to-indigo-900",
    "from-slate-800 to-slate-900",
    "from-[#0D47FF] to-pink-600",
  ];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return gradients[sum % gradients.length];
};
