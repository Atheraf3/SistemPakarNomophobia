import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-8 py-6 md:py-8 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Tentang Sistem Pakar</h2>
        <p className="text-lg text-slate-500">
          Penjelasan mendalam mengenai Nomophobia dan Metode AI yang digunakan.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-700">Apa itu Nomophobia?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700 leading-relaxed font-medium">
            <p>
              <strong>No Mobile Phone Phobia (Nomophobia)</strong> adalah ketakutan psikologis 
              yang berlebihan ketika seseorang kehilangan akses ke smartphone atau konektivitas jaringan.
            </p>
            <p>
              Gejala umum meliputi kecemasan, keringat dingin, detak jantung cepat, dan merasa "hilang arah"
              jika menjauh dari perangkat genggam mereka. Pengukuran tingkat fobia ini menggunakan standar kuesioner NMPQ.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-green-700">Certainty Factor (CF)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700 leading-relaxed font-medium">
            <p>
              <strong>Metode Certainty Factor</strong> diperkenalkan oleh Shortliffe Buchanan dalam pembuatan MYCIN. 
              Berfungsi memberikan tingkat kepastian (skor hipotesis) terhadap suatu fakta yang tidak pasti.
            </p>
            <p>
              Berbeda dengan Forward/Backward Chaining yang memerlukan pohon keputusan berbasis aturan (IF-THEN), 
              CF murni menghitung nilai Measure of Belief (MB) dan Measure of Disbelief (MD) pakar, digabungkan 
              dengan input bobot keyakinan dari pengguna (User CF).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
