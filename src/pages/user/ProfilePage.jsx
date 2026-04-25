import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto max-w-2xl px-4 md:px-8 py-6 md:py-8 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Profil Pengguna</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>
            Data profil yang digunakan dalam sistem pakar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 border-b py-3">
            <div className="font-medium text-slate-500">Nama Lengkap</div>
            <div className="col-span-2 font-semibold">{user?.name || "User Guest"}</div>
          </div>
          <div className="grid grid-cols-3 border-b py-3">
            <div className="font-medium text-slate-500">Email</div>
            <div className="col-span-2">{user?.email || "-"}</div>
          </div>
          <div className="grid grid-cols-3 border-b py-3">
            <div className="font-medium text-slate-500">Role</div>
            <div className="col-span-2 capitalize">{user?.role || "-"}</div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline">Edit Profil</Button>
            <Button variant="destructive">Hapus Akun</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
