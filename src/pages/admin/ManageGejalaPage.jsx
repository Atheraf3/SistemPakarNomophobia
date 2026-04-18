import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ManageGejalaPage() {
  const gejalaData = [
    { id: "G01", kode: "NMPQ-1", pertanyaan: "Saya merasa tidak nyaman tanpa akses konstan ke informasi di smartphone." },
    { id: "G02", kode: "NMPQ-2", pertanyaan: "Saya merasa terganggu jika tidak bisa mencari informasi di smartphone saat saya ingin." },
    { id: "G03", kode: "NMPQ-3", pertanyaan: "Saya akan merasa cemas jika tidak bisa mendapat berita terkini lewat smartphone." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Gejala (NMPQ)</h2>
        <Button className="w-full md:w-auto">Tambah Gejala</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Gejala Kuesioner</CardTitle>
          <CardDescription>
            Kumpulan pertanyaan adaptasi dari NMPQ (Nomophobia Questionnaire).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full pb-4">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[100px]">Kode</TableHead>
                <TableHead>Pertanyaan Kuesioner</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gejalaData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.kode}</TableCell>
                  <TableCell>{item.pertanyaan}</TableCell>
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
