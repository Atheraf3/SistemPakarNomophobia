import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DiagnosisPage() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Dummy gejala
  const questions = [
    { id: "G01", text: "Saya merasa tidak nyaman tanpa akses konstan ke informasi di smartphone." },
    { id: "G02", text: "Saya merasa terganggu jika tidak bisa mencari informasi di smartphone saat saya ingin." },
    { id: "G03", text: "Saya akan merasa cemas jika tidak bisa mendapat berita terkini lewat smartphone." },
  ];

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Kuesioner Selesai. Lanjut ke proses perhitungan CF!");
      // Logic ke halaman result
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kuesioner Diagnosis</h2>
        <p className="text-sm md:text-base text-slate-500">Pilih tingkat keyakinan Anda terhadap pernyataan berikut.</p>
        <Progress value={progress} className="h-2 mt-4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pertanyaan {currentStep + 1} dari {questions.length}</CardTitle>
          <CardDescription className="text-base text-slate-800 mt-4 leading-relaxed font-medium">
            "{questions[currentStep].text}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="0" className="space-y-3 mt-4">
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="1" id="q-1" />
              <Label htmlFor="q-1" className="flex-1 cursor-pointer">Sangat Yakin (1.0)</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="0.8" id="q-2" />
              <Label htmlFor="q-2" className="flex-1 cursor-pointer">Yakin (0.8)</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="0.6" id="q-3" />
              <Label htmlFor="q-3" className="flex-1 cursor-pointer">Cukup Yakin (0.6)</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="0.4" id="q-4" />
              <Label htmlFor="q-4" className="flex-1 cursor-pointer">Kurang Yakin (0.4)</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="0.2" id="q-5" />
              <Label htmlFor="q-5" className="flex-1 cursor-pointer">Tidak Tahu / Ragu-ragu (0.2)</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
              <RadioGroupItem value="0" id="q-6" />
              <Label htmlFor="q-6" className="flex-1 cursor-pointer">Tidak Yakin (0.0)</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-3 border-t p-4 md:p-6 mt-2">
          <Button 
            variant="outline" 
            className="w-full md:w-auto"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Sebelumnya
          </Button>
          <Button onClick={handleNext} className="w-full md:w-auto">
            {currentStep === questions.length - 1 ? "Selesai & Hitung" : "Selanjutnya"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
