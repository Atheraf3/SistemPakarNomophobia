import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const [shareData, setShareData] = useState(true);

  const historyData = [
    { id: "H01", tanggal: "2026-04-10", hasil: "Nomophobia Sedang", cfScore: "65.4%" },
    { id: "H02", tanggal: "2026-04-15", hasil: "Nomophobia Berat", cfScore: "82.1%" },
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Diagnosis</h2>
          <p className="text-slate-500 mt-1">Daftar riwayat tes Nomophobia Anda sebelumnya.</p>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Izin Akses Data</h3>
            <p className="text-sm text-blue-800">
              Apakah Anda bersedia data riwayat diagnosis ini dilihat oleh Admin untuk keperluan penelitian?
            </p>
          </div>
          <Button 
            variant={shareData ? "default" : "outline"}
            onClick={() => setShareData(!shareData)}
            className={shareData ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {shareData ? "Bersedia (Publik)" : "Tidak Bersedia (Privat)"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tersimpan</CardTitle>
          <CardDescription>
            Menampilkan hasil dan skor probabilitas menggunakan Certainty Factor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tingkat (Konklusi)</TableHead>
                  <TableHead>Nilai CF (%)</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.tanggal}</TableCell>
                    <TableCell className="font-medium text-slate-900">{item.hasil}</TableCell>
                    <TableCell>{item.cfScore}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm">Lihat Detail</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-slate-500">
              Belum ada riwayat diagnosis.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
