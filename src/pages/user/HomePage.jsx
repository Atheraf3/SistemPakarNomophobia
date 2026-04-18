import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Globe, MousePointerClick, Clock } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";

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
        <motion.div 
          className="space-y-6 max-w-4xl flex flex-col items-center"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge Label (Berdenyut konstan) */}
          <motion.div variants={itemFadeUp}>
            <motion.span 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="inline-flex items-center rounded-full bg-blue-100/80 px-4 py-1.5 text-sm font-semibold text-blue-700 border border-blue-200 backdrop-blur-sm shadow-sm"
            >
              Sistem Pakar Deteksi Dini
            </motion.span>
          </motion.div>

          {/* Main Title (Typewriter) */}
          <motion.div variants={itemFadeUp} className="min-h-[60px] md:min-h-[90px] flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
              <TypewriterText text="NOMOPHOBIA" />
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemFadeUp}>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mt-2">
              Lebih dari sekadar kebiasaan. Nomophobia (No Mobile Phone Phobia) adalah kondisi psikologis di mana seseorang mengalami kecemasan ekstrem saat terputus dari ponselnya.
            </p>
          </motion.div>

          {/* Call To Action Buttons */}
          <motion.div variants={itemFadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link to="/diagnosis">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-base px-8 h-14 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-shadow font-semibold">
                  Mulai Diagnosis Sekarang
                </Button>
              </motion.div>
            </Link>
            <Link to="/about">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="text-base px-8 h-14 rounded-full border-2 font-semibold bg-white/80 backdrop-blur-sm">
                  Pelajari Lebih Lanjut
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="w-full max-w-7xl px-6 lg:px-8 mt-4 md:mt-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Card 1 */}
          <motion.div variants={itemFadeUp}>
            <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/60 backdrop-blur-md">
              <CardContent className="flex flex-col items-center text-center p-8 h-full">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                  <Smartphone size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  <AnimatedCounter to={50} suffix=" Miliar" />
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">Jumlah telepon seluler di seluruh dunia.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemFadeUp}>
            <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/60 backdrop-blur-md">
              <CardContent className="flex flex-col items-center text-center p-8 h-full">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                  <Globe size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  <AnimatedCounter to={59} suffix="%" />
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">Dari populasi dunia kini memiliki akses internet.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemFadeUp}>
            <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/60 backdrop-blur-md">
              <CardContent className="flex flex-col items-center text-center p-8 h-full">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                  <MousePointerClick size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  <AnimatedCounter to={96} suffix=" Kali" />
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">Rata-rata orang memeriksa ponsel mereka setiap harinya.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemFadeUp}>
            <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/60 backdrop-blur-md">
              <CardContent className="flex flex-col items-center text-center p-8 h-full">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                  <Clock size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  <AnimatedCounter to={5} suffix=" Jam" />
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">Rata-rata waktu yang dihabiskan di layar ponsel per hari.</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
