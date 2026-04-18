import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ManageUsersPage() {
  const usersData = [
    { id: 1, nama: "Budi Santoso", email: "budi@test.com", riwayat: 3, lastDiagnosis: "Nomophobia Berat", izinAkses: true },
    { id: 2, nama: "Andi Saputra", email: "andi@test.com", riwayat: 1, lastDiagnosis: "Nomophobia Sedang", izinAkses: true },
    { id: 3, nama: "Siti Aminah", email: "siti@test.com", riwayat: 5, lastDiagnosis: "Rahasia", izinAkses: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Data User</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna & Riwayat</CardTitle>
          <CardDescription>
            Memantau hasil diagnosis pengguna yang bersedia membagikan datanya kepada Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full pb-4">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Jml Riwayat</TableHead>
                <TableHead>Diagnosis Terakhir</TableHead>
                <TableHead>Status Akses Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.riwayat}</TableCell>
                  <TableCell className={item.izinAkses ? "font-semibold text-slate-900" : "text-slate-400 italic"}>
                    {item.lastDiagnosis}
                  </TableCell>
                  <TableCell>
                    {item.izinAkses ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                        Diizinkan
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        Privat
                      </span>
                    )}
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
