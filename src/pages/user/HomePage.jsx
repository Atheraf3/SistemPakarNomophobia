import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Deteksi Tingkat <span className="text-blue-600">Nomophobia</span>
        </h1>
        <p className="text-lg text-slate-600">
          Identifikasi tingkat kecemasan Anda saat jauh dari smartphone menggunakan 
          metode Certainty Factor berbasis pakar.
        </p>
      </div>

      <div className="flex gap-4">
        <Link to="/diagnosis">
          <Button size="lg" className="text-lg px-8">
            Mulai Diagnosis
          </Button>
        </Link>
        <Link to="/about">
          <Button variant="outline" size="lg" className="text-lg px-8">
            Pelajari Lebih Lanjut
          </Button>
        </Link>
      </div>
    </div>
  );
}
