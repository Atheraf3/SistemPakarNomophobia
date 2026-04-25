import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Globe, MousePointerClick, Clock, BookOpen, Activity, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { motion as Motion, useInView, animate } from "framer-motion";

// Komponen untuk animasi Angka (Counter) dari 0 ke target
function AnimatedCounter({ from = 0, to, suffix = "", duration = 2.5 }) {
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration: duration,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value) + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, inView, suffix, duration]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

// Komponen untuk efek ketik (Typewriter)
function TypewriterText({ text }) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < text.length) {
          setDisplayText(text.slice(0, displayText.length + 1));
        } else {
          // Tunggu sebentar sebelum mulai menghapus
          setTimeout(() => setIsDeleting(true), 3000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(text.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
        }
      }
    }, isDeleting ? 100 : 200); // Lebih cepat saat menghapus

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, text]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse border-r-4 border-slate-900 ml-1 opacity-70"></span>
    </span>
  );
}

export default function HomePage() {
  // Animasi untuk Container (mengatur staggering beruntun)
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Animasi per elemen (fade up)
  const itemFadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  // Animasi untuk Grid Statistik yang muncul setelah hero
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5, // Menunda hingga bagian pertama hero muncul
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-slate-50 to-white pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center text-center py-20 px-4 md:py-28">
        <Motion.div 
          className="space-y-6 max-w-4xl flex flex-col items-center"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge Label */}
          <Motion.div variants={itemFadeUp}>
            <Motion.span 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="inline-flex items-center rounded-full bg-blue-100/80 px-4 py-1.5 text-sm font-semibold text-blue-700 border border-blue-200 backdrop-blur-sm shadow-sm"
            >
              Sistem Pakar Deteksi Dini
            </Motion.span>
          </Motion.div>

          {/* Main Title */}
          <Motion.div variants={itemFadeUp} className="min-h-[60px] md:min-h-[90px] flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
              <TypewriterText text="NOMOPHOBIA" />
            </h1>
          </Motion.div>

          {/* Subtitle */}
          <Motion.div variants={itemFadeUp}>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mt-2">
              Lebih dari sekadar kebiasaan. Nomophobia (No Mobile Phone Phobia) adalah kondisi psikologis di mana seseorang mengalami kecemasan ekstrem saat terputus dari ponselnya.
            </p>
          </Motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-8 w-full max-w-5xl">
            {/* Feature 1 */}
            <Motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 backdrop-blur border border-slate-100 rounded-xl text-left cursor-default"
            >
              <div className="p-5 flex flex-col gap-3">
                <Motion.div
                  className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpen size={20} />
                </Motion.div>
                <h3 className="font-bold text-slate-900 text-base">Basis Pengetahuan</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Sistem pakar berbasis CF & NMPQ untuk menganalisis ketergantungan smartphone.
                </p>
              </div>
            </Motion.div>

            {/* Feature 2 */}
            <Motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 backdrop-blur border border-slate-100 rounded-xl text-left cursor-default"
            >
              <div className="p-5 flex flex-col gap-3">
                <Motion.div
                  className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Activity size={20} />
                </Motion.div>
                <h3 className="font-bold text-slate-900 text-base">Analisis Perilaku</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Menilai tingkat ketergantungan dari pola dan intensitas penggunaan smartphone harian.
                </p>
              </div>
            </Motion.div>

            {/* Feature 3 */}
            <Motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 backdrop-blur border border-slate-100 rounded-xl text-left cursor-default"
            >
              <div className="p-5 flex flex-col gap-3">
                <Motion.div
                  className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <ShieldCheck size={20} />
                </Motion.div>
                <h3 className="font-bold text-slate-900 text-base">Saran Pakar</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Rekomendasi penanganan dan detoks digital sesuai tingkat kecanduan.
                </p>
              </div>
            </Motion.div>
          </div>
        </Motion.div>
      </section>

      {/* Data Highlight Section  */}
      <section className="w-full relative py-12 md:py-16 -mt-8 md:-mt-16 overflow-hidden z-10">
        {/* Layer 1: Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        
        {/* Layer 2: Dark Overlay */}
        <div className="absolute inset-0 bg-[#0a1128]/85"></div>
        
        {/* Layer 3: Subtle Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8">
          <Motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-white/10"
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Stat 1 */}
            <Motion.div 
              variants={itemFadeUp} 
              className="flex flex-col items-center text-center px-4 py-6 group transition-transform duration-300 hover:-translate-y-1.5"
            >
              <Smartphone className="text-cyan-400 mb-5 opacity-90 group-hover:opacity-100 transition-opacity" size={28} strokeWidth={1.5} />
              <span className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">
                <AnimatedCounter to={50} suffix="Jt" />
              </span>
              <span className="text-sm md:text-base text-blue-100/60 font-medium leading-snug max-w-[160px]">
                Pengguna seluler di seluruh dunia
              </span>
            </Motion.div>

            {/* Stat 2 */}
            <Motion.div 
              variants={itemFadeUp} 
              className="flex flex-col items-center text-center px-4 py-6 group transition-transform duration-300 hover:-translate-y-1.5"
            >
              <Globe className="text-cyan-400 mb-5 opacity-90 group-hover:opacity-100 transition-opacity" size={28} strokeWidth={1.5} />
              <span className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">
                <AnimatedCounter to={59} suffix="%" />
              </span>
              <span className="text-sm md:text-base text-blue-100/60 font-medium leading-snug max-w-[160px]">
                Populasi global terhubung internet
              </span>
            </Motion.div>

            {/* Stat 3 */}
            <Motion.div 
              variants={itemFadeUp} 
              className="flex flex-col items-center text-center px-4 py-6 group transition-transform duration-300 hover:-translate-y-1.5"
            >
              <MousePointerClick className="text-cyan-400 mb-5 opacity-90 group-hover:opacity-100 transition-opacity" size={28} strokeWidth={1.5} />
              <span className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">
                <AnimatedCounter to={96} suffix="x" />
              </span>
              <span className="text-sm md:text-base text-blue-100/60 font-medium leading-snug max-w-[160px]">
                Rata-rata cek ponsel setiap hari
              </span>
            </Motion.div>

            {/* Stat 4 */}
            <Motion.div 
              variants={itemFadeUp} 
              className="flex flex-col items-center text-center px-4 py-6 group transition-transform duration-300 hover:-translate-y-1.5"
            >
              <Clock className="text-cyan-400 mb-5 opacity-90 group-hover:opacity-100 transition-opacity" size={28} strokeWidth={1.5} />
              <span className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">
                <AnimatedCounter to={5} suffix="Jam" />
              </span>
              <span className="text-sm md:text-base text-blue-100/60 font-medium leading-snug max-w-[160px]">
                Rata-rata screen time harian
              </span>
            </Motion.div>
          </Motion.div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="w-full max-w-5xl mx-auto px-4 lg:px-8 mt-12 md:mt-16 mb-8 relative z-10">
        <Motion.div variants={itemFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-2xl overflow-hidden rounded-3xl">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 justify-between relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>

              <div className="text-left space-y-4 md:w-2/3 z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Siap melakukan diagnosa?</h2>
                <p className="text-blue-100 text-base md:text-lg leading-relaxed max-w-xl">
                  Proses diagnosa ini akan memandu Anda melalui beberapa pertanyaan terkait aktivitas penggunaan handphone harian Anda.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 size={18} className="text-blue-200" />
                    <span>Estimasi waktu 3-5 menit saja</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 size={18} className="text-blue-200" />
                    <span>Jawab berdasarkan aktivitas riil Anda</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full md:w-auto z-10 shrink-0">
                <Link to="/diagnosis" className="w-full cursor-pointer">
                  <Motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
                    <Button size="lg" className="w-full text-blue-700 bg-white hover:bg-slate-50 px-8 h-14 rounded-full shadow-lg font-bold text-base cursor-pointer">
                      Mulai Diagnosis Sekarang <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Motion.div>
                </Link>
                <Link to="/about" className="w-full cursor-pointer">
                  <Motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
                    <Button variant="outline" size="lg" className="w-full text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white px-8 h-12 rounded-full font-semibold transition-all cursor-pointer">
                      Pelajari Lebih Lanjut
                    </Button>
                  </Motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Motion.div>
      </section>
    </div>
  );
}
