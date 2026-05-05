import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Informasi Sistem Pakar
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Sistem Pakar Deteksi Dini Nomophobia dengan Algoritma Certainty Factor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Tentang Sistem Pakar */}
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Tentang Sistem Pakar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 leading-relaxed text-justify space-y-3">
            <p>
              Sistem pakar merupakan cabang dari kecerdasan buatan (AI) yang dirancang untuk meniru kemampuan pengambilan keputusan dari seorang pakar manusia.
            </p>
            <p>
              Aplikasi berbasis web ini dikembangkan secara khusus untuk mendeteksi dini indikasi <strong>nomophobia</strong>, sehingga dapat diakses oleh pengguna kapan saja dan di mana saja.
            </p>
            <p className="text-sm italic text-slate-500 border-l-4 border-blue-200 pl-3">
              Catatan: Sistem ini berfungsi sebagai alat skrining awal dan bukan merupakan pengganti diagnosis dari psikolog atau psikiater profesional.
            </p>
          </CardContent>
        </Card>

        {/* 2. Apa itu Nomophobia */}
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Apa itu Nomophobia?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 leading-relaxed text-justify space-y-3">
            <p>
              <strong>Nomophobia</strong> (<em>No Mobile Phone Phobia</em>) didefinisikan sebagai rasa takut atau kecemasan yang berlebihan ketika seseorang kehilangan akses ke <em>smartphone</em> atau konektivitas digital.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Penyebab:</strong> Ketergantungan yang tinggi pada teknologi dan konektivitas digital yang terus-menerus.</li>
              <li><strong>Gejala:</strong> Perasaan cemas, panik, detak jantung meningkat, dan kehilangan fokus saat tidak memegang perangkat.</li>
              <li><strong>Dampak:</strong> Penurunan produktivitas, gangguan kualitas tidur, serta dampak negatif pada kesehatan mental.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3. Instrumen NMPQ */}
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Instrumen NMPQ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 leading-relaxed text-justify space-y-3">
            <p>
              Sistem ini menggunakan kuesioner standar <strong>NMPQ</strong> (<em>Nomophobia Questionnaire</em>) yang terdiri dari <strong>20 item pernyataan</strong>. Instrumen ini dikembangkan oleh Yildirim & Correia (2015).
            </p>
            <p>Penilaian mencakup 4 dimensi utama:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tidak dapat berkomunikasi</li>
              <li>Tidak dapat mengakses informasi</li>
              <li>Ketidakmampuan mengakses <em>smartphone</em></li>
              <li>Ketidakpastian tanpa <em>smartphone</em></li>
            </ul>
            <p className="text-sm">Pengguna memberikan respons menggunakan skala persetujuan untuk setiap pernyataan.</p>
          </CardContent>
        </Card>

        {/* 4. Metode Certainty Factor (CF) */}
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Metode Certainty Factor (CF)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 leading-relaxed text-justify space-y-3">
            <p>
              <strong>Certainty Factor (CF)</strong> adalah metode dalam sistem pakar yang dirancang untuk menangani ketidakpastian. Secara sederhana, metode ini digunakan untuk mengukur tingkat kepercayaan terhadap hasil suatu diagnosis.
            </p>
            
            <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-center font-mono text-sm">
              CF(H,E) = MB(H,E) - MD(H,E)
            </div>
            
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>MB:</strong> Tingkat kepercayaan (<em>Measure of Belief</em>).</li>
              <li><strong>MD:</strong> Tingkat ketidakpercayaan (<em>Measure of Disbelief</em>).</li>
              <li><strong>CF:</strong> Hasil kepastian (<em>Certainty Factor</em>).</li>
            </ul>

            <p className="text-sm pt-1">
              Dalam sistem ini, nilai <strong>MD</strong> adalah <strong>0</strong> karena semua pertanyaan pada instrumen NMPQ dirancang untuk mendukung hipotesis <strong>Nomophobia</strong>. Oleh karena itu, hasil <strong>CF</strong> didasarkan secara langsung pada gabungan nilai <strong>MB</strong> dari pakar dan masukan pengguna.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 5. Cara Kerja Sistem */}
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Cara Kerja Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 leading-relaxed text-justify">
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Daftar Dan Masuk :</strong> Daftar jika belum memiliki akun. Lalu, pengguna masuk ke dalam sistem dengan akun yang valid.</li>
              <li><strong>Isi Kuesioner:</strong> Pengguna mengisi kuesioner NMPQ sesuai dengan kondisi yang dialami.</li>
              <li><strong>Kalkulasi Komputasi:</strong> Sistem menghitung nilai CF berdasarkan jawaban pengguna dan basis pengetahuan pakar.</li>
              <li><strong>Penentuan Diagnosis:</strong> Sistem menentukan tingkat diagnosis nomophobia berdasarkan hasil kalkulasi.</li>
              <li><strong>Penyajian Hasil:</strong> Sistem menampilkan hasil diagnosis beserta rekomendasi penanganan.</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. Hasil Diagnosis */}
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
              Hasil Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 leading-relaxed text-justify">
            <p className="mb-3">Sistem menghasilkan output persentase kepastian dan mengkategorikan hasil ke dalam 5 tingkatan:</p>
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold text-emerald-600">Tidak Nomophobia:</span> Penggunaan smartphone normal tanpa indikasi ketergantungan.</li>
              <li><span className="font-semibold text-blue-500">Ringan:</span> Ketergantungan awal yang masih dalam batas wajar.</li>
              <li><span className="font-semibold text-yellow-600">Sedang:</span> Mulai muncul gejala kecemasan ringan jika terpisah dari perangkat.</li>
              <li><span className="font-semibold text-orange-500">Berat:</span> Ketergantungan tinggi yang mulai memengaruhi rutinitas harian.</li>
              <li><span className="font-semibold text-red-600">Akut:</span> Gejala kecemasan ekstrem yang membutuhkan intervensi serius.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 7. Rekomendasi */}
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">7</span>
              Rekomendasi
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 leading-relaxed text-justify">
            <p className="mb-3">Langkah-langkah yang dapat ditindaklanjuti untuk mengurangi gejala:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Kurangi waktu layar secara bertahap.</li>
              <li>Gunakan mode fokus pada jam-jam tertentu.</li>
              <li>Batasi notifikasi dari aplikasi yang tidak esensial.</li>
              <li>Lakukan aktivitas offline (luring) secara rutin.</li>
              <li><strong>Cari bantuan profesional medis atau psikolog jika gejala berada pada tingkat berat atau akut.</strong></li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 8. Penafian */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-8 shadow-sm">
        <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2 text-lg">
          <span className="bg-amber-100 text-amber-800 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">8</span>
          Disclaimer
        </h3>
        <p className="text-amber-900 text-justify">
          Sistem ini hanya digunakan sebagai alat bantu deteksi dini dan <strong>tidak menggantikan diagnosis profesional</strong> dari ahli.
        </p>
      </div>

    </div>
  );
}
