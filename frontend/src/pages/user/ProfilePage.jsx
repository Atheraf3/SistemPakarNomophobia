import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/diagnosis/history` 
  : "http://localhost:5151/api/diagnosis/history";

const SHARE_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth/share-data` 
  : "http://localhost:5151/api/auth/share-data";

const PROFILE_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth/profile` 
  : "http://localhost:5151/api/auth/profile";


export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(user?.shareData ?? false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State for Edit Profile
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", age: "" });
  const [updating, setUpdating] = useState(false);

  const totalPages = Math.ceil(historyData.length / itemsPerPage);
  const currentHistoryData = historyData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchHistory = useCallback(async function fetchHistory() {
    const token = localStorage.getItem("token");
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true
    };
    const res = await axios.get(API_URL, config);
    return res.data.data;
  }, []);

  useEffect(function initHistory() {
    let ignore = false;

    async function startFetching() {
      try {
        const data = await fetchHistory();
        if (!ignore) {
          setHistoryData(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal mengambil riwayat", error);
          toast.error("Gagal mengambil riwayat diagnosis.");
          setLoading(false);
        }
      }
    }

    startFetching();

    return () => {
      ignore = true;
    };
  }, [fetchHistory]);

  const handleToggleShareData = async () => {
    const newValue = !shareData;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(SHARE_API, { shareData: newValue }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      setShareData(newValue);
      toast.success(newValue ? "Data riwayat Anda sekarang dapat dilihat Admin." : "Data riwayat Anda disembunyikan dari Admin.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui izin akses data.");
    }
  };

  const handleClearHistory = async () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">Bersihkan semua riwayat?</p>
          <p className="text-xs text-slate-500">Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = localStorage.getItem("token");
                  await axios.delete(API_URL, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                  });
                  toast.success("Riwayat berhasil dibersihkan!");
                  setHistoryData([]);
                  setCurrentPage(1);
                } catch (error) {
                  console.error(error);
                  toast.error("Gagal membersihkan riwayat.");
                }
              }}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
            >
              Hapus Semua
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-md hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(PROFILE_API, editFormData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      
      setUser(res.data.data);
      toast.success("Profil berhasil diperbarui!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal memperbarui profil.");
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      name: user?.name || "",
      age: user?.age || ""
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-8 py-6 md:py-8 space-y-6">
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
            <div className="font-medium text-slate-500">Umur</div>
            <div className="col-span-2">{user?.age ? `${user.age} Tahun` : "-"}</div>
          </div>
          <div className="grid grid-cols-3 border-b py-3">
            <div className="font-medium text-slate-500">Kuota Diagnosis</div>
            <div className="col-span-2 font-bold text-blue-600">
              {user?.role === 'admin' ? "Unlimited (∞)" : `${user?.quota || 0} kali`}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={openEditModal}>Edit Profil</Button>
            <Button variant="destructive">Hapus Akun</Button>
          </div>
        </CardContent>
      </Card>

      <div className="pt-6">
        <h2 className="text-2xl font-bold tracking-tight">Riwayat Diagnosis</h2>
        <p className="text-slate-500 mt-1 mb-4">Daftar riwayat tes Nomophobia Anda sebelumnya.</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Izin Akses Data</h3>
            <p className="text-sm text-blue-800">
              {shareData 
                ? "Data riwayat Anda sekarang bisa dilihat oleh Admin." 
                : "Apakah Anda bersedia data riwayat diagnosis ini dilihat oleh Admin?"}
            </p>
          </div>
          <Button
            variant={shareData ? "default" : "outline"}
            onClick={handleToggleShareData}
            className={shareData ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-red-700 text-white"}
          >
            {shareData ? "Tidak" : "Ya"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Riwayat Tersimpan</CardTitle>
            <CardDescription>
              Menampilkan hasil dan skor probabilitas menggunakan Certainty Factor.
            </CardDescription>
          </div>
          {historyData.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleClearHistory}>
              Bersihkan Riwayat
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Memuat riwayat...</div>
          ) : historyData && historyData.length > 0 ? (
            <>
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
                {currentHistoryData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{item.tingkat_keparahan}</TableCell>
                    <TableCell>{(item.nilai_cf_akhir * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm">Lihat Detail</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-slate-500">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="py-8 text-center text-slate-500">
              Belum ada riwayat diagnosis.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal (Custom) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="mb-4">
              <h3 className="text-xl font-bold">Edit Profil</h3>
              <p className="text-sm text-slate-500">Perbarui nama dan umur Anda di bawah ini.</p>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Umur</Label>
                <Input
                  id="age"
                  type="number"
                  value={editFormData.age}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
