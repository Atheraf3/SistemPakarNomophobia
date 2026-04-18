import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ManagePenyakitPage() {
  const tingkatData = [
    { id: "T1", nama: "Nomophobia Ringan", deskripsi: "Tingkat kecemasan rendah saat jauh dari ponsel." },
    { id: "T2", nama: "Nomophobia Sedang", deskripsi: "Mulai mengganggu aktivitas harian jika tidak ada ponsel." },
    { id: "T3", nama: "Nomophobia Berat", deskripsi: "Kecemasan ekstrem, keringat dingin, dan stres sangat tinggi." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Tingkat Nomophobia</h2>
        <Button className="w-full md:w-auto">Tambah Tingkat</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tingkat</CardTitle>
          <CardDescription>
            Definisi tingkat keparahan yang digunakan sebagai konklusi (hipotesis final) Certainty Factor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full pb-4">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Nama Tingkat</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tingkatData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.deskripsi}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Hapus</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
