import { useState, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, ChevronRight, ChevronLeft, CheckCircle2,
  AlertCircle, Lightbulb, Phone, ArrowRight, RotateCcw,
  Activity, Stethoscope, Info
} from "lucide-react";
import { symptoms, cfOptions } from "@/services/knowledgeBase";
import { runCFInference, interpretCFLevel } from "@/services/cfEngine";

// --- Phase constants ---
const PHASE = { START: "start", QUIZ: "quiz", LOADING: "loading", RESULT: "result" };

// --- Framer Motion Variants ---
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
        <p className="text-slate-500 text-sm">Sistem pakar sedang menghitung nilai Certainty Factor</p>
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
          <Activity size={12} /> Sistem Pakar · Certainty Factor
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mulai Diagnosis Nomophobia</h2>
        <p className="text-slate-500 leading-relaxed">
          Kuesioner ini terdiri dari <strong className="text-slate-700">{symptoms.length} pertanyaan</strong> yang
          akan membantu mengidentifikasi tingkat ketergantungan Anda terhadap smartphone.
          Jawablah dengan jujur untuk hasil terbaik.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-sm">
        {[
          { icon: CheckCircle2, color: "text-green-600 bg-green-50", text: `${symptoms.length} pertanyaan` },
          { icon: Brain, color: "text-blue-600 bg-blue-50", text: "Metode CF" },
          { icon: AlertCircle, color: "text-amber-600 bg-amber-50", text: "Jawab dengan jujur" },
        ].map(({ icon: Icon, color, text }, i) => ( // eslint-disable-line no-unused-vars
          <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <div className={`p-1.5 rounded-lg ${color}`}><Icon size={16} /></div>
            <span className="font-medium text-slate-700">{text}</span>
          </div>
        ))}
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
function ResultScreen({ results, onReset }) {
  const primary = results[0];
  const level = interpretCFLevel(primary.percentage);
  const others = results.slice(1);

  return (
    <Motion.div
      key="result"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header hasil */}
      <div className="text-center space-y-1 pb-2">
        <p className="text-sm text-slate-500 font-medium">Hasil Analisis Sistem Pakar</p>
        <h2 className="text-2xl font-extrabold text-slate-900">Diagnosis Selesai</h2>
      </div>

      {/* Card Hasil Utama */}
      <Card className={`border-2 ${level.borderColor} ${level.bgColor} overflow-hidden`}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${level.badgeColor}`}>
                Tingkat Keyakinan: {level.label}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">{primary.name}</h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-black text-slate-900">{primary.percentage}%</p>
              <p className="text-xs text-slate-500">CF Score</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/70 rounded-full h-3 overflow-hidden">
            <Motion.div
              className={`h-full rounded-full ${level.barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${primary.percentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          {/* Penjelasan */}
          <div className="flex gap-3 bg-white/60 rounded-xl p-4 border border-white">
            <Info size={18} className={`${level.color} shrink-0 mt-0.5`} />
            <p className="text-sm text-slate-700 leading-relaxed">{primary.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan Penyebab */}
      <Card className="border border-amber-200 bg-amber-50">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertCircle size={18} /> Ringkasan Penyebab Utama
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">{primary.mainCause}</p>
        </CardContent>
      </Card>

      {/* Solusi & Detoks */}
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-green-800">
            <Lightbulb size={18} /> Solusi & Detoks Digital — {primary.solution.title}
          </div>
          <ol className="space-y-2">
            {primary.solution.steps.map((step, i) => (
              <Motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="flex gap-3 text-sm text-green-900 leading-relaxed"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 text-green-800 font-bold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </Motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Skor lainnya */}
      {others.some(r => r.percentage > 0) && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Perbandingan Skor</p>
          <div className="grid gap-2">
            {others.filter(r => r.percentage > 0).map((r) => {
              const lvl = interpretCFLevel(r.percentage);
              return (
                <div key={r.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700 w-40 shrink-0">{r.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <Motion.div
                      className={`h-full rounded-full ${lvl.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${r.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 w-10 text-right">{r.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Konsultasi Psikolog */}
      <Card className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-5 flex gap-4 items-start">
          <div className="p-2.5 bg-blue-100 rounded-xl shrink-0">
            <Phone size={20} className="text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-blue-900 text-sm">Konsultasi Lebih Lanjut</p>
            <p className="text-sm text-blue-800 leading-relaxed">
              Hasil ini bersifat informatif dan bukan pengganti diagnosis klinis. Untuk penanganan lebih
              lanjut, silakan hubungi <strong>psikolog atau ahli kesehatan mental</strong> terdekat Anda.
              Layanan konseling tersedia di Puskesmas, RS Jiwa, atau platform konseling online.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tombol Ulangi */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onReset} className="gap-2 rounded-full px-6 cursor-pointer">
          <RotateCcw size={16} /> Ulangi Diagnosis
        </Button>
      </div>
    </Motion.div>
  );
}

// Main DiagnosisPage
export default function DiagnosisPage() {
  const [phase, setPhase] = useState(PHASE.START);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: cfValue }
  const [selectedOption, setSelectedOption] = useState(null);
  const [results, setResults] = useState(null);
  const topRef = useRef(null);

  const total = symptoms.length;
  const answeredSet = new Set(Object.keys(answers).map(Number));
  const answeredCount = answeredSet.size;
  const progress = Math.round((answeredCount / total) * 100);

  const handleStart = () => {
    setPhase(PHASE.QUIZ);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption(null);
  };

  const handleReset = () => {
    setPhase(PHASE.START);
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption(null);
    setResults(null);
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOptionSelect = (value) => {
    setSelectedOption(value);
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const handleNext = () => {
    if (selectedOption === null && answers[currentStep] === undefined) return;
    if (currentStep < total - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setSelectedOption(answers[nextStep] ?? null);
      scrollToTop();
    } else {
      // Submit
      setPhase(PHASE.LOADING);
      setTimeout(() => {
        // Build answers map: { symptomId: cfValue }
        const mapped = {};
        symptoms.forEach((s, i) => {
          if (answers[i] !== undefined) mapped[s.id] = answers[i];
        });
        const inferenceResults = runCFInference(mapped);
        setResults(inferenceResults);
        setPhase(PHASE.RESULT);
        scrollToTop();
      }, 2800);
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

  return (
    <div ref={topRef} className="container mx-auto max-w-2xl px-4 md:px-8 py-6 md:py-8 space-y-6">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Diagnosis Nomophobia</h1>
        <p className="text-slate-500 text-sm">
          Identifikasi tingkat ketergantungan terhadap smartphone menggunakan metode Certainty Factor.
        </p>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {phase === PHASE.START && <StartScreen key="start" onStart={handleStart} />}

        {phase === PHASE.LOADING && <LoadingScreen key="loading" />}

        {phase === PHASE.RESULT && results && (
          <ResultScreen key="result" results={results} onReset={handleReset} />
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
                          {symptoms[currentStep].text}
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
                            {opt.value > 0 && (
                              <span className={`text-xs font-bold tabular-nums ${active ? "text-blue-500" : "text-slate-400"}`}>
                                {opt.value.toFixed(1)}
                              </span>
                            )}
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
