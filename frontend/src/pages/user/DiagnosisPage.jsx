import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, ChevronRight, ChevronLeft, CheckCircle2,
  AlertCircle, Lightbulb, ArrowRight, RotateCcw,
  Activity, Stethoscope
} from "lucide-react";

import useDiagnosisStore from "@/store/useDiagnosisStore";
import { useAuthStore } from "@/store/useAuthStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import axios from "axios";

//Phase constants
const PHASE = { START: "start", QUIZ: "quiz", LOADING: "loading", RESULT: "result", ERROR: "error" };

const CONFIG_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/config`
  : "http://localhost:5151/api/config";

const GEJALA_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/gejala`
  : "http://localhost:5151/api/gejala";

function getBase64ImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
}

// Mapping warna
const LEVEL_STYLES = {
  "Tidak Nomophobia":  { color: "text-green-600",  bgColor: "bg-green-50",  borderColor: "border-green-200",  badgeColor: "bg-green-100 text-green-700",  barColor: "bg-green-500" },
  "Nomophobia Ringan": { color: "text-blue-600",   bgColor: "bg-blue-50",   borderColor: "border-blue-200",   badgeColor: "bg-blue-100 text-blue-700",   barColor: "bg-blue-500" },
  "Nomophobia Sedang": { color: "text-amber-600",  bgColor: "bg-amber-50",  borderColor: "border-amber-200",  badgeColor: "bg-amber-100 text-amber-700",  barColor: "bg-amber-500" },
  "Nomophobia Berat":  { color: "text-red-600",    bgColor: "bg-red-50",    borderColor: "border-red-200",    badgeColor: "bg-red-100 text-red-700",    barColor: "bg-red-500" },
  "Nomophobia Akut":   { color: "text-red-800",    bgColor: "bg-red-100",   borderColor: "border-red-300",   badgeColor: "bg-red-200 text-red-900",   barColor: "bg-red-700" },
};

const DEFAULT_STYLE = { color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200", badgeColor: "bg-slate-100 text-slate-700", barColor: "bg-slate-400" };

// Framer Motion Variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Loading Screen Component
function LoadingScreen() {
  const dots = [0, 1, 2];
  return (
    <Motion.div
      key="loading"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[420px] gap-8"
    >
      <div className="relative flex items-center justify-center">
        <Motion.div
          className="w-28 h-28 rounded-full border-4 border-blue-100"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ borderTopColor: "#3b82f6" }}
        />
        <Motion.div
          className="absolute w-20 h-20 rounded-full border-4 border-indigo-100"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ borderTopColor: "#6366f1" }}
        />
        <div className="absolute flex items-center justify-center">
          <Brain size={36} className="text-blue-600" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">Menganalisis Jawaban...</h3>
        <p className="text-slate-500 text-sm">Sistem pakar sedang menghitung nilai Certainty Factor di Server</p>
      </div>
      <div className="flex gap-2">
        {dots.map((i) => (
          <Motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-blue-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
    </Motion.div>
  );
}

// Start Screen Component
function StartScreen({ onStart, user }) {
  const isQuotaEmpty = user && user.role !== 'admin' && user.quota <= 0;

  return (
    <Motion.div
      key="start"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center text-center gap-8 py-8"
    >
      <Motion.div
        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Stethoscope size={44} className="text-white" />
      </Motion.div>
      <div className="space-y-3 max-w-lg">
        <span className="inline-flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Sistem Pakar · Certainty Factor · NMP-Q
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mulai Diagnosis Nomophobia</h2>
        <p className="text-slate-500 leading-relaxed">
          Kuesioner ini memanfaatkan alat <strong className="text-slate-700">NMP-Q</strong> yang dirancang untuk mengenali seberapa besar ketergantungan Anda pada Smartphone. Silakan memberikan jawaban yang sebenar-benarnya untuk mendapatkan hasil yang optimal.
        </p>
      </div>

      {isQuotaEmpty ? (
        <div className="bg-red-50 text-red-600 px-5 py-4 rounded-xl border border-red-200 max-w-md text-sm font-medium flex items-center gap-3">
          <AlertCircle size={24} className="shrink-0" />
          <p className="text-left">Maaf, kuota diagnosis Anda telah habis. Harap hubungi admin untuk mendapatkan kuota tambahan.</p>
        </div>
      ) : (
        <Motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            onClick={onStart}
            className="px-10 h-13 rounded-full text-base font-semibold shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
          >
            Mulai Diagnosis <ArrowRight size={18} className="ml-2" />
          </Button>
        </Motion.div>
      )}
    </Motion.div>
  );
}

// Question Progress Dots
function ProgressDots({ total, current, answered }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const isAnswered = answered.has(i);
        const isCurrent = i === current;
        return (
          <Motion.div
            key={i}
            animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
            className={`
              rounded-full transition-all duration-300
              ${isCurrent ? "w-5 h-5 border-2 border-blue-600 bg-blue-600" : ""}
              ${!isCurrent && isAnswered ? "w-5 h-5 bg-green-500" : ""}
              ${!isCurrent && !isAnswered ? "w-5 h-5 bg-slate-200" : ""}
            `}
          />
        );
      })}
    </div>
  );
}

// Result Screen Component
function ResultScreen({ result, onReset, levels, user, answers, gejalaList, cfOptions }) {
  const percentageFloat = parseFloat(result.persentase);
  const matchedLevel = (levels || []).find(
    (l) => percentageFloat >= l.batas_min && percentageFloat <= l.batas_max
  );
  const levelName = matchedLevel?.nama_tingkat || result.tingkat_keparahan?.nama_tingkat || "";
  const style = LEVEL_STYLES[levelName] || DEFAULT_STYLE;
  const pdfRef = useRef(null);

  const handleDownloadPDF = async () => {
    const loadingToast = toast.loading("Sedang menyiapkan dokumen PDF...");

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 15;

      const logoUrl = "https://ik.imagekit.io/2xthk8ud4/TA/Logo.png?updatedAt=1776489422811";
      try {
        const logoBase64 = await getBase64ImageFromURL(logoUrl);
        doc.addImage(logoBase64, 'PNG', 12, currentY - 3, 16, 16); 
      } catch (error) {
        console.error("Gagal memuat logo dari URL, menggunakan lingkaran default:", error);
        doc.setFillColor(200, 200, 200); 
        doc.circle(20, currentY + 5, 8, 'F'); 
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Sistem Pakar Deteksi Dini Nomophobia", pageWidth / 2, currentY + 7, { align: "center" });
      
      currentY += 15;
      
      doc.setLineWidth(0.5);
      doc.line(15, currentY, pageWidth - 15, currentY);

      currentY += 15;

      doc.setFontSize(14);
      doc.text("Laporan Hasil Diagnosis", pageWidth / 2, currentY, { align: "center" });

      currentY += 15;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const tanggalTes = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const namaLengkap = user?.name || "User Guest";
      
      const xLabel = 15; 
      const xTitikDua = 50; 
      const xNilai = 53; 
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      // Nama Lengkap
      doc.text("Nama Lengkap", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.text(`${namaLengkap}`, xNilai, currentY);
      currentY += 6;

      // Tanggal Tes
      doc.text("Tanggal Tes", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.text(`${tanggalTes}`, xNilai, currentY);
      currentY += 6;
      
      // Hasil Diagnosis
      doc.text("Hasil Diagnosis", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(`${levelName || "Tidak Diketahui"}`, xNilai, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 6;
      
      // Tingkat Keyakinan
      doc.text("Tingkat Keyakinan", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(`${result.persentase}`, xNilai, currentY);
      doc.setFont("helvetica", "normal");
      
      currentY += 10;

      const tableData = gejalaList.map((g, i) => {
        const val = answers[i];
        const cfLabel = cfOptions.find(opt => opt.value === val)?.label || "-";
        return [
          (i + 1).toString(),
          g.pernyataan,
          cfLabel
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Gejala', 'Jawaban Anda']],
        body: tableData,
        theme: 'grid',
        margin: { bottom: 30 },
        styles: {
          font: 'helvetica',
          fontSize: 10,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [240, 240, 240], 
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'left' },
          2: { halign: 'center', cellWidth: 35 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Solusi / Saran Penanganan:", 15, currentY);
      
      doc.setFont("helvetica", "normal");
      const solusiDetox = result.tingkat_keparahan?.solusi_detox || "Tidak ada saran spesifik.";
      const splitTeksSolusi = doc.splitTextToSize(solusiDetox, pageWidth - 30);
      doc.text(splitTeksSolusi, 15, currentY + 6);

      currentY += splitTeksSolusi.length * 5 + 10;

      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      const signatureX = pageWidth - 70;
      const tglCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      doc.text(`Jakarta, ${tglCetak}`, signatureX, currentY);
      doc.text("Mengetahui,", signatureX, currentY + 5);
      doc.text("Pakar / Konselor", signatureX, currentY + 10);
      
      doc.text("                                         ", signatureX, currentY + 35);
      const textWidth = doc.getTextWidth("                                         ");
      doc.setLineWidth(0.3);
      doc.line(signatureX, currentY + 36, signatureX + textWidth, currentY + 36);

      doc.save(`Hasil_Diagnosis_${namaLengkap.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF berhasil dicetak!", { id: loadingToast });

    } catch (err) {
      console.error(err);
      toast.error("Gagal mencetak PDF.", { id: loadingToast });
    }
  };

  return (
    <Motion.div
      key="result"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Wrapper for PDF Export */}
      <div ref={pdfRef} className="space-y-6 bg-white p-4 rounded-xl">
        {/* Header hasil */}
        <div className="text-center space-y-1 pb-2">
          <p className="text-sm text-slate-500 font-medium">Hasil Analisis Sistem Pakar</p>
          <h2 className="text-2xl font-extrabold text-slate-900">Diagnosis Selesai</h2>
        </div>

        {/* Card Hasil Utama */}
        <Card className={`border-2 ${style.borderColor} ${style.bgColor} overflow-hidden`}>
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              
              {/* Badge Tingkat Keparahan */}
              <div>
                <span className={`text-sm md:text-base font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full ${style.badgeColor}`}>
                  Tingkat: {levelName || "Tidak Diketahui"}
                </span>
              </div>
              
              {/* Score CF */}
              <div className="text-right shrink-0">
                <p className="text-3xl md:text-4xl font-black text-slate-900">{result.persentase}</p>
                <p className="text-xs md:text-sm text-slate-500 font-medium">CF Score</p>
              </div>

            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/70 rounded-full h-3 md:h-4 overflow-hidden mt-2">
              <Motion.div
                className={`h-full rounded-full ${style.barColor}`}
                initial={{ width: 0 }}
                animate={{ width: result.persentase }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Solusi & Detoks */}
        {result.tingkat_keparahan?.solusi_detox && (
          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 font-bold text-green-800">
                <Lightbulb size={18} /> Solusi & Detoks Digital
              </div>
              <p className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap">
                {result.tingkat_keparahan.solusi_detox}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Peringatan */}
        <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start sm:items-center gap-2.5 sm:gap-3">
          <AlertCircle className="text-slate-500 shrink-0 mt-0.5 sm:mt-0" size={18} />
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Sistem pakar ini memberikan indikasi awal. Untuk diagnosis medis dan penanganan lebih lanjut, silakan hubungi psikolog ahli.
          </p>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-col sm:flex-row justify-center pt-2 gap-4">
        <Button variant="outline" onClick={onReset} className="gap-2 rounded-full px-6 cursor-pointer">
          <RotateCcw size={16} /> Ulangi Diagnosis
        </Button>
        <Button onClick={handleDownloadPDF} className="gap-2 rounded-full px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
          Unduh Hasil (PDF)
        </Button>
      </div>
    </Motion.div>
  );
}

// Main DiagnosisPage
export default function DiagnosisPage() {
  const [phase, setPhase] = useState(PHASE.START);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [gejalaList, setGejalaList] = useState([]);
  const [cfOptions, setCfOptions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [gejalaLoading, setGejalaLoading] = useState(true);
  const [gejalaError, setGejalaError] = useState(false);

  const { submitDiagnosisToBackend, diagnosisResult, error, resetDiagnosis } = useDiagnosisStore();
  const { user, setUser } = useAuthStore();

  const topRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGejala = async () => {
      try {
        const res = await axios.get(GEJALA_API);
        if (isMounted) {
          const activeGejala = res.data.data.filter(g => g.isActive !== false);
          setGejalaList(activeGejala);
          setGejalaLoading(false);
        }
      } catch {
        if (isMounted) {
          setGejalaError(true);
          setGejalaLoading(false);
        }
      }
    };

    const fetchConfig = async () => {
      try {
        const res = await axios.get(CONFIG_API);
        if (isMounted) {
          setCfOptions(res.data.data.cfOptions);
          setLevels(res.data.data.levels);
        }
      } catch (error) {
        console.error("Gagal memuat data konfigurasi:", error);
      }
    };

    fetchGejala();
    fetchConfig();

    return () => { isMounted = false; };
  }, []);

  const total = gejalaList.length;
  const answeredSet = new Set(Object.keys(answers).map(Number));
  const answeredCount = answeredSet.size;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const handleStart = () => {
    setPhase(PHASE.QUIZ);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption(null);
    resetDiagnosis();
  };

  const handleReset = () => {
    setPhase(PHASE.START);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption(null);
    resetDiagnosis();
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOptionSelect = (value) => {
    setSelectedOption(value);
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const handleNext = async () => {
    if (selectedOption === null && answers[currentStep] === undefined) return;
    if (currentStep < total - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setSelectedOption(answers[nextStep] ?? null);
      scrollToTop();
    } else {
      setPhase(PHASE.LOADING);
      scrollToTop();

      const mappedAnswers = {};
      gejalaList.forEach((g, i) => {
        if (answers[i] !== undefined) mappedAnswers[g.kode_gejala] = answers[i];
      });

      const response = await submitDiagnosisToBackend(mappedAnswers);

      if (response) {
        setPhase(PHASE.RESULT);
        if (user && user.role !== 'admin' && response.sisa_kuota !== undefined) {
          setUser({ ...user, quota: response.sisa_kuota });
        }
      } else {
        setPhase(PHASE.ERROR);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setSelectedOption(answers[prev] ?? null);
      scrollToTop();
    }
  };

  const currentAnswer = answers[currentStep];
  const canGoNext = currentAnswer !== undefined || selectedOption !== null;
  const isLast = currentStep === total - 1;

  if (gejalaLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-blue-100 animate-spin" style={{ borderTopColor: "#3b82f6" }} />
        <p className="text-slate-500 text-sm">Memuat kuesioner...</p>
      </div>
    );
  }

  if (gejalaError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-slate-600 font-medium">Gagal memuat data kuesioner dari server.</p>
        <p className="text-slate-400 text-sm">Pastikan server backend berjalan dan coba muat ulang halaman.</p>
      </div>
    );
  }

  return (
    <div ref={topRef} className="container mx-auto max-w-2xl px-4 md:px-8 py-6 md:py-8 space-y-6">
      {/* Page Title */}
      {phase === PHASE.START && (
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Diagnosis Nomophobia</h1>
          <p className="text-slate-500 text-sm">
            Identifikasi tingkat ketergantungan terhadap smartphone menggunakan Certainty Factor dan NMP-Q.
          </p>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {phase === PHASE.START && <StartScreen key="start" onStart={handleStart} user={user} />}

        {phase === PHASE.LOADING && <LoadingScreen key="loading" />}

        {phase === PHASE.ERROR && (
            <Motion.div key="error" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center py-10 space-y-4">
              <AlertCircle size={48} className="mx-auto text-red-500" />
              <h3 className="text-xl font-bold text-slate-800">Diagnosis Gagal</h3>
              <p className="text-slate-500">{error || "Terjadi kesalahan saat menghubungi server."}</p>
              <Button onClick={handleReset} variant="outline" className="mt-4">Kembali ke Awal</Button>
            </Motion.div>
        )}

        {phase === PHASE.RESULT && diagnosisResult && (
          <ResultScreen key="result" result={diagnosisResult} onReset={handleReset} levels={levels} user={user} answers={answers} gejalaList={gejalaList} cfOptions={cfOptions} />
        )}

        {phase === PHASE.QUIZ && (
          <Motion.div
            key="quiz"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-5"
          >
            {/* Progress Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-slate-600">
                  Pertanyaan <span className="text-blue-600 font-bold">{currentStep + 1}</span> dari{" "}
                  <span className="font-bold">{total}</span>
                </span>
                <span className="text-slate-500">{answeredCount} terjawab · {progress}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <Motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              {/* Dots */}
              <ProgressDots total={total} current={currentStep} answered={answeredSet} />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <Motion.div
                key={currentStep}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="border border-slate-200 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    {/* Question */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-full text-white text-xs font-bold flex items-center justify-center">
                          {currentStep + 1}
                        </span>
                        <p className="text-white font-medium leading-relaxed text-base">
                          {gejalaList[currentStep]?.pernyataan}
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="p-4 md:p-5 space-y-2.5">
                      {cfOptions.length === 0 ? (
                        <div className="text-center text-sm text-slate-400 py-4 animate-pulse">
                          Menyiapkan pilihan jawaban...
                        </div>
                      ) : (
                        cfOptions.map((opt) => {
                          const active = (answers[currentStep] ?? selectedOption) === opt.value;
                          return (
                          <Motion.button
                            key={opt.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleOptionSelect(opt.value)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                              ${active
                                ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                              }
                            `}
                          >
                            <div className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${active ? "border-blue-500 bg-blue-500" : "border-slate-300"}
                            `}>
                              {active && (
                                <Motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 rounded-full bg-white"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold text-sm ${active ? "text-blue-700" : "text-slate-700"}`}>
                                {opt.label}
                              </p>
                              <p className={`text-xs ${active ? "text-blue-500" : "text-slate-400"}`}>
                                {opt.description}
                              </p>
                            </div>

                          </Motion.button>
                        );
                        })
                      )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex flex-row justify-between gap-2 px-4 md:px-5 pb-5 pt-1 border-t border-slate-100">
                      <Button
                        variant="outline"
                        className="w-auto gap-1 sm:gap-2 rounded-xl cursor-pointer"
                        disabled={currentStep === 0}
                        onClick={handlePrev}
                      >
                        <ChevronLeft size={16} /> <span className="hidden sm:inline">Sebelumnya</span><span className="sm:hidden">Kembali</span>
                      </Button>
                      
                      <Button
                        className={`w-auto gap-1 sm:gap-2 rounded-xl font-semibold cursor-pointer
                          ${isLast
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          }`}
                        disabled={!canGoNext}
                        onClick={handleNext}
                      >
                        {isLast ? (
                          <><CheckCircle2 size={16} /> <span className="hidden sm:inline">Selesai & Hitung</span><span className="sm:hidden">Selesai</span></>
                        ) : (
                          <>Selanjutnya <ChevronRight size={16} /></>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            </AnimatePresence>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}