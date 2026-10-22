import type { Question } from "../src/lib/scoring";
export const domains = [
  ["behaviorisme", "Behaviorisme", "Bagaimana pengalaman dan lingkungan membentuk perilaku.", "blue"],
  ["kognitif", "Psikologi Kognitif", "Proses perhatian, memori, dan cara manusia berpikir.", "violet"],
  ["perkembangan", "Psikologi Perkembangan", "Perubahan dan keberlanjutan sepanjang kehidupan.", "green"],
  ["sosial", "Psikologi Sosial", "Individu dalam hubungan, kelompok, dan konteks sosial.", "orange"],
  ["kepribadian", "Psikologi Kepribadian", "Pola perbedaan individual dan dinamika kepribadian.", "violet"],
  ["klinis", "Psikologi Klinis", "Landasan ilmiah untuk memahami kesejahteraan psikologis.", "green"],
  ["pendidikan", "Psikologi Pendidikan", "Proses belajar, motivasi, dan lingkungan pendidikan.", "blue"],
  ["industri", "Psikologi Industri & Organisasi", "Perilaku manusia, pekerjaan, dan kehidupan organisasi.", "orange"],
  ["komunitas", "Psikologi Komunitas", "Relasi individu, komunitas, dan perubahan sosial.", "green"],
  ["biologis", "Biopsikologi & Neurosains", "Hubungan proses biologis dengan pengalaman dan perilaku.", "violet"],
  ["metode", "Metode Penelitian & Pengukuran", "Pengetahuan psikologi melalui bukti dan pengukuran.", "blue"]
].map(([slug, name, description, color]) => ({ slug, name, description, color }));
export const sources = [
  { id: "openstax", title: "Psychology 2e", author: "Rose M. Spielman, William J. Jenkins, Marilyn D. Lovett", year: "2020", version: "Edisi kedua", jurisdiction: "Referensi akademik; bukan hukum", kind: "Buku ajar", url: "https://openstax.org/details/books/psychology-2e", note: "Rujukan awal konsep dasar. Parafrase dan lokasi bab perlu ditinjau pengajar; tidak menyalin teks buku." },
  { id: "himpsi", title: "Kode Etik Psikologi Indonesia", author: "Himpunan Psikologi Indonesia (HIMPSI)", year: "2010", version: "Edisi rujukan 2010; cek pembaruan", jurisdiction: "Indonesia · pedoman etik profesi", kind: "Kode etik", url: "https://himpsi.or.id", note: "Dokumen resmi belum disediakan. Versi berlaku dan bagian relevan belum diverifikasi; tidak ada kutipan atau nomor pasal yang direkonstruksi." },
  { id: "apa", title: "Ethical Principles of Psychologists and Code of Conduct", author: "American Psychological Association", year: "2002", version: "Rujukan amendemen 2010 dan 2016; cek versi terbaru", jurisdiction: "Amerika Serikat · bukan hukum Indonesia", kind: "Kode etik", url: "https://www.apa.org/ethics/code", note: "Untuk perbandingan lintas kerangka. Status versi terbaru dan pemetaan bagian perlu diverifikasi sebelum penggunaan kurikuler." },
  { id: "aps", title: "Code of Ethics", author: "Australian Psychological Society", year: "2007", version: "Rujukan awal 2007; status penerapan perlu dicek", jurisdiction: "Australia · bukan hukum Indonesia", kind: "Kode etik", url: "https://psychology.org.au", note: "Sumber pembanding yang belum ditelaah. Jangan menganggap versi ini masih berlaku tanpa verifikasi sumber resmi." },
  { id: "uu-plp", title: "UU Nomor 23 Tahun 2022 tentang Pendidikan dan Layanan Psikologi", author: "Republik Indonesia", year: "2022", version: "Nomor 23 Tahun 2022", jurisdiction: "Indonesia · peraturan perundang-undangan", kind: "Undang-undang", url: "https://peraturan.bpk.go.id", note: "Cari judul dan nomor pada portal resmi. Naskah, status hukum, dan bagian yang berlaku belum ditelaah; latihan ini bukan interpretasi hukum." }
].map(source => ({ ...source, status: "PENDING" }));
type Section = { heading: string; text: string };
export const articles: { slug: string; title: string; summary: string; domainSlug: string; minutes: number; body: Section[]; locator: string }[] = [
  { slug: "pengondisian-operan", title: "Pengondisian operan", summary: "Mengapa konsekuensi dapat mengubah kemungkinan munculnya suatu perilaku?", domainSlug: "behaviorisme", minutes: 6, locator: "Topik pembelajaran; lokasi bagian belum diverifikasi", body: [
    { heading: "Perilaku dan konsekuensinya", text: "Pengondisian operan menjelaskan perubahan kemungkinan suatu perilaku dalam hubungannya dengan konsekuensi yang mengikuti perilaku tersebut. B. F. Skinner mengembangkan pendekatan eksperimental ini dengan menekankan hubungan fungsional antara perilaku dan lingkungan." },
    { heading: "Penguatan bukan sekadar hadiah", text: "Suatu konsekuensi disebut penguat bila meningkatkan kemungkinan perilaku dalam kondisi yang relevan. Sesuatu yang dimaksudkan sebagai hadiah belum tentu berfungsi sebagai penguat. Penilaian bergantung pada perubahan perilaku, bukan hanya niat pemberinya." },
    { heading: "Contoh dalam pembelajaran", text: "Seorang mahasiswa semakin sering menyusun pertanyaan sebelum diskusi setelah mendapatkan umpan balik yang membantu. Hubungan ini dapat menjadi hipotesis penguatan, tetapi pengamatan sistematis diperlukan untuk membedakannya dari faktor lain." },
    { heading: "Kekeliruan yang umum", text: "Penguatan negatif bukan hukuman. Negatif merujuk pada penghilangan stimulus; penguatan tetap berarti peningkatan kemungkinan perilaku. Konteks dan riwayat belajar perlu dipertimbangkan." },
    { heading: "Batas dan penerapan", text: "Prinsip ini dapat membantu merancang lingkungan belajar, tetapi tidak menjelaskan seluruh pengalaman manusia. Penerapan profesional juga memerlukan persetujuan, kompetensi, dan perhatian terhadap kesejahteraan individu." }
  ] },
  { slug: "pengondisian-klasik", title: "Pengondisian klasik", summary: "Bagaimana hubungan antarrangsangan dapat membentuk respons yang dipelajari?", domainSlug: "behaviorisme", minutes: 5, locator: "Topik pembelajaran; lokasi bagian belum diverifikasi", body: [
    { heading: "Belajar melalui hubungan", text: "Pengondisian klasik berkaitan dengan pembelajaran hubungan antara stimulus. Dalam kondisi tertentu, stimulus yang sebelumnya netral dapat memunculkan respons terkondisi setelah berhubungan dengan stimulus yang sudah memiliki fungsi tertentu." },
    { heading: "Konteks historis", text: "Penelitian Ivan Pavlov tentang respons pencernaan menjadi salah satu landasan pembahasan proses ini. Temuannya berkembang menjadi program penelitian tentang pembelajaran asosiatif, bukan teori tunggal untuk semua perilaku." },
    { heading: "Contoh dan batas penjelasan", text: "Bunyi tertentu dapat menjadi isyarat bahwa aktivitas akan segera dimulai. Perubahan respons manusia tidak boleh langsung disimpulkan sebagai pengondisian tanpa mempertimbangkan ekspektasi, instruksi, dan konteks." },
    { heading: "Bedakan dua pertanyaan", text: "Pengondisian klasik menyoroti hubungan antarrangsangan, sedangkan pengondisian operan menyoroti hubungan perilaku dengan konsekuensinya. Keduanya dapat berperan dalam situasi yang sama." }
  ] },
  { slug: "memori-kerja", title: "Memori kerja", summary: "Ruang kerja mental untuk mempertahankan dan mengolah informasi sementara.", domainSlug: "kognitif", minutes: 7, locator: "Topik memori; lokasi bagian belum diverifikasi", body: [
    { heading: "Lebih dari penyimpanan sementara", text: "Memori kerja merujuk pada proses mempertahankan dan mengolah informasi untuk aktivitas seperti memahami bacaan, bernalar, dan mengikuti instruksi. Beragam model menawarkan penjelasan berbeda mengenai organisasi proses tersebut." },
    { heading: "Tokoh dan perkembangan teori", text: "Alan Baddeley dan Graham Hitch mengusulkan model multikomponen yang berpengaruh. Model ini bukan satu-satunya pendekatan; perbedaan model perlu diperhatikan ketika membaca penelitian." },
    { heading: "Contoh penerapan", text: "Saat membandingkan dua penjelasan kasus, mahasiswa mempertahankan informasi penting sambil menilai hubungannya. Memecah instruksi menjadi bagian yang jelas dapat mengurangi tuntutan tugas; manfaatnya perlu dinilai sesuai konteks." },
    { heading: "Hindari kesimpulan berlebihan", text: "Kesulitan mengingat instruksi dalam satu situasi bukan diagnosis atau bukti kompetensi rendah. Kelelahan, gangguan perhatian, kompleksitas materi, dan pengalaman sebelumnya dapat berpengaruh." }
  ] },
  { slug: "perkembangan-sepanjang-hayat", title: "Perkembangan sepanjang hayat", summary: "Perubahan manusia sebagai proses yang berlangsung dalam konteks kehidupan.", domainSlug: "perkembangan", minutes: 5, locator: "Topik perkembangan; lokasi bagian belum diverifikasi", body: [
    { heading: "Perubahan dan keberlanjutan", text: "Psikologi perkembangan mempelajari perubahan dan keberlanjutan dalam berbagai ranah kehidupan. Perkembangan dipengaruhi proses biologis, pengalaman, relasi sosial, dan konteks budaya." },
    { heading: "Membaca teori secara kritis", text: "Jean Piaget dan Erik Erikson merupakan tokoh penting dalam sejarah teori perkembangan. Teori tahap membantu mengorganisasi pertanyaan, tetapi tidak boleh digunakan sebagai jadwal universal yang mengabaikan keragaman pengalaman." },
    { heading: "Contoh dan miskonsepsi", text: "Dua mahasiswa dengan usia sama dapat menghadapi tuntutan hidup yang berbeda. Perbedaan tersebut tidak otomatis menunjukkan salah satunya tertinggal. Gunakan bukti yang sesuai sebelum menilai pola perkembangan." }
  ] },
  { slug: "pengaruh-sosial", title: "Pengaruh sosial", summary: "Bagaimana kehadiran orang lain dan norma kelompok memengaruhi tindakan?", domainSlug: "sosial", minutes: 6, locator: "Topik psikologi sosial; lokasi bagian belum diverifikasi", body: [
    { heading: "Individu dalam konteks", text: "Pengaruh sosial mencakup perubahan penilaian atau perilaku yang berkaitan dengan orang lain dan norma sosial. Konformitas, kepatuhan, dan persuasi adalah konsep yang berhubungan, tetapi tidak identik." },
    { heading: "Sejarah dan evaluasi bukti", text: "Penelitian Solomon Asch menjadi salah satu rujukan historis tentang konformitas. Generalisasi hasil perlu mempertimbangkan situasi penelitian, karakteristik peserta, dan konteks budaya." },
    { heading: "Contoh dalam diskusi kasus", text: "Seorang mahasiswa mungkin mengikuti kesimpulan mayoritas meskipun memiliki keraguan. Mengundang alasan alternatif dan memberi waktu refleksi dapat membantu diskusi, tanpa menjamin kelompok selalu menghasilkan keputusan terbaik." }
  ] },
  { slug: "validitas-pengukuran", title: "Validitas pengukuran", summary: "Menilai dukungan bukti bagi interpretasi dan penggunaan hasil pengukuran.", domainSlug: "metode", minutes: 6, locator: "Topik penelitian dan pengukuran; lokasi bagian belum diverifikasi", body: [
    { heading: "Validitas sebagai argumen berbasis bukti", text: "Validitas berfokus pada sejauh mana bukti dan teori mendukung interpretasi skor untuk penggunaan tertentu. Menyebut suatu alat valid tanpa menyatakan populasi, tujuan, dan interpretasi dapat menyesatkan." },
    { heading: "Hubungan dengan reliabilitas", text: "Konsistensi hasil merupakan pertimbangan penting, tetapi tidak dengan sendirinya membuktikan bahwa interpretasi yang diinginkan tepat. Alat yang konsisten masih dapat tidak sesuai dengan tujuan penggunaan." },
    { heading: "Contoh pada SI JANI", text: "Skor latihan menunjukkan respons pada materi latihan tertentu. Skor tersebut bukan ukuran kompetensi profesional, kelayakan praktik, atau kondisi psikologis seseorang. Kesimpulan yang lebih luas memerlukan bukti yang berbeda." }
  ] }
];
export const scenario = {
  slug: "kerahasiaan-dalam-supervisi", blockSlug: "etik-hukum", title: "Ketika laporan diminta untuk diskusi",
  description: "Menimbang tujuan belajar, kerahasiaan, dan batas kewenangan dalam supervisi.",
  narrative: "Anda adalah mahasiswa dalam kegiatan belajar yang disupervisi. Seorang rekan meminta salinan laporan berisi rincian pengalaman dan identitas seorang peserta layanan untuk bahan diskusi kelas. Ia mengatakan bahwa menghapus nama sudah cukup. Anda belum mengetahui cakupan persetujuan peserta, siapa yang akan mengakses materi, dan kebijakan institusi tentang penggunaan laporan. Penyelia belum dikonsultasikan.",
  sources: ["himpsi", "apa", "uu-plp"], version: 1
};
export const questions: Question[] = [
  { id: "langkah-awal", type: "single", title: "Apa langkah awal yang paling dapat dipertanggungjawabkan?", instruction: "Pilih satu jawaban terbaik berdasarkan informasi yang tersedia.", options: [
    { id: "share", label: "Bagikan laporan setelah menghapus nama peserta." },
    { id: "clarify", label: "Tunda pembagian; klarifikasi tujuan, persetujuan, dan kewenangan bersama penyelia." },
    { id: "refuse", label: "Tolak seluruh penggunaan kasus untuk pembelajaran dalam semua keadaan." }
  ], correct: "clarify", explanation: "Informasi penting belum tersedia. Menunda pembagian untuk klarifikasi menjaga ruang bagi keputusan yang proporsional. Menghapus nama saja belum menyingkirkan risiko identifikasi ulang; penolakan mutlak juga tidak mempertimbangkan alternatif yang mungkin sah.", sourceIds: ["himpsi", "apa"] },
  { id: "informasi", type: "multiple", title: "Informasi apa yang perlu Anda klarifikasi?", instruction: "Pilih semua yang relevan. Pilihan tepat mendapat kredit; pilihan tidak tepat mengurangi kredit, minimal nol.", options: [
    { id: "consent", label: "Tujuan dan cakupan persetujuan peserta." },
    { id: "access", label: "Siapa penerima materi dan bagaimana aksesnya dibatasi." },
    { id: "policy", label: "Kebijakan institusi serta kewenangan mahasiswa dan penyelia." },
    { id: "popular", label: "Apakah cerita tersebut cukup menarik untuk dibagikan di media sosial." }
  ], correct: ["consent", "access", "policy"], explanation: "Tujuan, persetujuan, penerima, kebijakan, dan kewenangan berhubungan langsung dengan penggunaan informasi. Daya tarik cerita bukan dasar untuk membagikan informasi pribadi.", sourceIds: ["himpsi", "uu-plp"] },
  { id: "prinsip", type: "matching", title: "Hubungkan pertimbangan dengan konsep yang sesuai", instruction: "Gunakan setiap konsep satu kali. Setiap pasangan tepat mendapat kredit yang sama.", prompts: [
    { id: "p1", label: "Membatasi pengungkapan informasi peserta." },
    { id: "p2", label: "Memastikan pemahaman dan pilihan atas tujuan penggunaan." },
    { id: "p3", label: "Bertindak sesuai kemampuan dan peran yang disupervisi." }
  ], options: [{ id: "privacy", label: "Kerahasiaan" }, { id: "consent", label: "Informed consent" }, { id: "competence", label: "Kompetensi dan kewenangan" }], correct: { p1: "privacy", p2: "consent", p3: "competence" }, explanation: "Konsep-konsep ini saling berkaitan. Pasangan membantu membedakan fokus pertimbangan; satu tindakan dapat melibatkan lebih dari satu prinsip.", sourceIds: ["himpsi", "apa"] },
  { id: "alur", type: "sequence", title: "Susun alur kerja untuk latihan ini", instruction: "Alur latihan: pahami situasi, konsultasikan, pilih alternatif, lalu catat alasan. Ini alat bantu belajar, bukan urutan universal dalam praktik. Kredit diberikan untuk urutan lengkap.", options: [
    { id: "document", label: "Catat keputusan, alasan, dan batas kesimpulan." },
    { id: "consult", label: "Konsultasikan dilema dan batas kewenangan dengan penyelia." },
    { id: "clarify", label: "Identifikasi tujuan, fakta, dan informasi yang belum diketahui." },
    { id: "choose", label: "Pilih alternatif yang proporsional berdasarkan hasil klarifikasi." }
  ], correct: ["clarify", "consult", "choose", "document"], explanation: "Dalam kerangka latihan ini, pemetaan informasi mendahului konsultasi dan pemilihan alternatif, lalu alasan didokumentasikan. Kasus nyata mungkin memerlukan langkah berulang atau respons segera sesuai situasi.", sourceIds: ["himpsi"] },
  { id: "lanjutan", type: "multipart", title: "Situasi berkembang. Apa pertimbangan Anda?", instruction: "Jawab setiap bagian secara terpisah; setiap bagian memiliki bobot yang sama.", prompts: [
    { id: "unique", label: "Nama dihapus, tetapi pekerjaan dan peristiwa unik masih tercantum. Apakah risiko identifikasi ulang perlu diperiksa?" },
    { id: "foreign", label: "Rekan menyebut kode etik luar negeri. Apakah kode itu otomatis menggantikan hukum Indonesia?" }
  ], options: [{ id: "yes", label: "Ya" }, { id: "no", label: "Tidak" }], correct: { unique: "yes", foreign: "no" }, explanation: "Identifikasi ulang dapat terjadi melalui kombinasi informasi. Pedoman luar negeri dapat memperkaya diskusi, tetapi statusnya berbeda dari hukum dan aturan profesi di Indonesia.", sourceIds: ["apa", "uu-plp"] }
];
