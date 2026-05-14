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
import html2pdf from "html2pdf.js";
import axios from "axios";

//Phase constants
const PHASE = { START: "start", QUIZ: "quiz", LOADING: "loading", RESULT: "result", ERROR: "error" };

const CONFIG_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/config`
  : "http://localhost:5151/api/config";

const GEJALA_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/gejala`
  : "http://localhost:5151/api/gejala";

// Mapping warna berdasarkan nama_tingkat dari database
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
function StartScreen({ onStart }) {
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
        <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          <Activity size={12} /> Sistem Pakar · Certainty Factor · NMP-Q
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mulai Diagnosis Nomophobia</h2>
        <p className="text-slate-500 leading-relaxed">
          Kuesioner ini memanfaatkan alat <strong className="text-slate-700">NMP-Q</strong> yang dirancang untuk mengenali seberapa besar ketergantungan Anda pada Smartphone. Silakan memberikan jawaban yang sebenar-benarnya untuk mendapatkan hasil yang optimal.
        </p>
      </div>

      <Motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Button
          size="lg"
          onClick={onStart}
          className="px-10 h-13 rounded-full text-base font-semibold shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
        >
          Mulai Diagnosis <ArrowRight size={18} className="ml-2" />
        </Button>
      </Motion.div>
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
function ResultScreen({ result, onReset, levels }) {
  const percentageFloat = parseFloat(result.persentase);
  // Cari tingkat dari data database berdasarkan batas_min & batas_max
  const matchedLevel = (levels || []).find(
    (l) => percentageFloat >= l.batas_min && percentageFloat <= l.batas_max
  );
  // Ambil warna dari mapping Frontend berdasarkan nama_tingkat
  const levelName = matchedLevel?.nama_tingkat || result.tingkat_keparahan?.nama_tingkat || "";
  const style = LEVEL_STYLES[levelName] || DEFAULT_STYLE;
  const pdfRef = useRef(null);

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin:       10,
      filename:     'Hasil_Diagnosis_Nomophobia.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
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
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badgeColor}`}>
                  Tingkat: {levelName || "Tidak Diketahui"}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">{levelName || "Tidak Diketahui"}</h3>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-black text-slate-900">{result.persentase}</p>
                <p className="text-xs text-slate-500">CF Score</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/70 rounded-full h-3 overflow-hidden">
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

        {/* Teks Statis Psikolog */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-slate-600 font-medium">Untuk konsultasi lebih lanjut, silakan hubungi psikolog ahli.</p>
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

  // Ambil actions dari store
  const { submitDiagnosisToBackend, diagnosisResult, error, resetDiagnosis } = useDiagnosisStore();

  const topRef = useRef(null);

  // Fetch gejala dan config dari API secara bersamaan
  useEffect(() => {
    let isMounted = true;

    async function initData() {
      try {
        const [resGejala, resConfig] = await Promise.all([
          axios.get(GEJALA_API),
          axios.get(CONFIG_API)
        ]);
        if (isMounted) {
          setGejalaList(resGejala.data.data);
          setCfOptions(resConfig.data.data.cfOptions);
          setLevels(resConfig.data.data.levels);
          setGejalaLoading(false);
        }
      } catch {
        if (isMounted) {
          setGejalaError(true);
          setGejalaLoading(false);
        }
      }
    }

    initData();
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
      // Submit ke Backend
      setPhase(PHASE.LOADING);
      scrollToTop();

      // Build answers map: { gejalaId: cfValue }
      const mappedAnswers = {};
      gejalaList.forEach((g, i) => {
        if (answers[i] !== undefined) mappedAnswers[g.kode_gejala] = answers[i];
      });

      const response = await submitDiagnosisToBackend(mappedAnswers);

      if (response) {
        setPhase(PHASE.RESULT);
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

  // Jika gejala masih loading tampilkan skeleton
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
        {phase === PHASE.START && <StartScreen key="start" onStart={handleStart} />}

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
          <ResultScreen key="result" result={diagnosisResult} onReset={handleReset} levels={levels} />
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
                      {cfOptions.map((opt) => {
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
                      })}
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 px-4 md:px-5 pb-5 pt-1 border-t border-slate-100">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto gap-2 rounded-xl cursor-pointer"
                        disabled={currentStep === 0}
                        onClick={handlePrev}
                      >
                        <ChevronLeft size={16} /> Sebelumnya
                      </Button>
                      <Button
                        className={`w-full sm:w-auto gap-2 rounded-xl flex-1 sm:flex-none font-semibold cursor-pointer
                          ${isLast
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          }`}
                        disabled={!canGoNext}
                        onClick={handleNext}
                      >
                        {isLast ? (
                          <><CheckCircle2 size={16} /> Selesai & Hitung</>
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