import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ManageKnowledgeBasePage() {
  const kbData = [
    { id: "KB1", gejala: "G01", mb: 0.8, md: 0.1, cfPakar: 0.7 },
    { id: "KB2", gejala: "G02", mb: 0.7, md: 0.2, cfPakar: 0.5 },
    { id: "KB3", gejala: "G03", mb: 0.9, md: 0.05, cfPakar: 0.85 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Kelola Basis Pengetahuan (Knowledge Base)</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nilai Certainty Factor Pakar</CardTitle>
          <CardDescription>
            Atur nilai Measure of Belief (MB) dan Measure of Disbelief (MD) untuk setiap gejala. (CF Pakar = MB - MD). 
            Tidak menggunakan hierarki Rule Based, setiap parameter mewakili bobot independen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Gejala</TableHead>
                <TableHead>Nilai MB</TableHead>
                <TableHead>Nilai MD</TableHead>
                <TableHead>CF Pakar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kbData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.gejala}</TableCell>
                  <TableCell>{item.mb}</TableCell>
                  <TableCell>{item.md}</TableCell>
                  <TableCell>{item.cfPakar}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Edit Bobot</Button>
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
