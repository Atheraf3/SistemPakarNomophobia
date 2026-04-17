import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ManageSolutionsPage() {
  const solusiData = [
    { id: "S1", tingkat: "T1", saran: "Coba batasi penggunaan ponsel saat sebelum tidur." },
    { id: "S2", tingkat: "T2", saran: "Matikan notifikasi yang tidak penting dan buat jadwal puasa gadget." },
    { id: "S3", tingkat: "T3", saran: "Lakukan detox digital penuh selama akhir pekan dan konsultasikan dengan tenaga profesional/psikolog." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Kelola Solusi / Anjuran</h2>
        <Button>Tambah Solusi</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Solusi per Tingkatan</CardTitle>
          <CardDescription>
            Saran penanganan yang akan ditampilkan kepada pengguna sesuai hasil konklusi akhir CF (Tingkat Keparahan).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID Tingkat</TableHead>
                <TableHead>Solusi / Saran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solusiData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.tingkat}</TableCell>
                  <TableCell>{item.saran}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Hapus</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
