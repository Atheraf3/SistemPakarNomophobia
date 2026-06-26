import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/diagnosis/history` 
  : "http://localhost:5151/api/diagnosis/history";

const SHARE_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth/share-data` 
  : "http://localhost:5151/api/auth/share-data";

const PROFILE_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth/profile` 
  : "http://localhost:5151/api/auth/profile";

const GEJALA_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/gejala` 
  : "http://localhost:5151/api/gejala";

const CF_OPTIONS_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/cf-options` 
  : "http://localhost:5151/api/cf-options";

const TINGKAT_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/tingkat` 
  : "http://localhost:5151/api/tingkat";

function getBase64ImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
}


export default function ProfilePage() {
  const { user, setUser, fetchProfile } = useAuthStore();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(user?.shareData ?? false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State for Edit Profile
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", age: "" });
  const [updating, setUpdating] = useState(false);

  // Modal Detail Riwayat
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [cfOptionsList, setCfOptionsList] = useState([]);

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
        const [data, cfRes] = await Promise.all([
          fetchHistory(),
          axios.get(CF_OPTIONS_API).catch(() => ({ data: { data: [] } }))
        ]);
        if (!ignore) {
          setHistoryData(data);
          setCfOptionsList(cfRes.data?.data || []);
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
    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [fetchHistory, fetchProfile]);

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

  const handleDownloadPDF = async () => {
    if (!selectedHistory) return;
    const loadingToast = toast.loading("Sedang menyiapkan dokumen PDF...");

    try {
      const [gejalaRes, cfRes, tingkatRes] = await Promise.all([
        axios.get(GEJALA_API),
        axios.get(CF_OPTIONS_API),
        axios.get(TINGKAT_API)
      ]);
      
      const gejalaList = gejalaRes.data.data || [];
      const cfOptions = cfRes.data.data || [];
      const tingkatList = tingkatRes.data.data || [];

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 15;

      const logoUrl = "https://ik.imagekit.io/2xthk8ud4/TA/Logo%20PT.png?updatedAt=1782357094871";
      try {
        const logoBase64 = await getBase64ImageFromURL(logoUrl);
        doc.addImage(logoBase64, 'PNG', 15, currentY - 10, 24, 24); 
      } catch (error) {
        console.error("Gagal memuat logo", error);
        doc.setFillColor(200, 200, 200); 
        doc.circle(20, currentY + 5, 8, 'F'); 
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Sistem Pakar Deteksi Dini Nomophobia", pageWidth / 2, currentY + 2, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitAlamat = doc.splitTextToSize("Gedung Graha Mampang, Lantai 3 Suite 30, Jl. Mampang Prapatan Raya Kav.100, Jakarta Selatan, Indonesia", 100);
      doc.text(splitAlamat, pageWidth / 2, currentY + 7, { align: "center" });
      
      currentY += 18;
      
      doc.setLineWidth(0.5);
      doc.line(15, currentY, pageWidth - 15, currentY);

      currentY += 15;

      doc.setFontSize(14);
      doc.text("Laporan Hasil Diagnosis", pageWidth / 2, currentY, { align: "center" });

      currentY += 15;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const tanggalTes = new Date(selectedHistory.tanggal).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const namaLengkap = user?.name || "User Guest";
      
      const xLabel = 15; 
      const xTitikDua = 50; 
      const xNilai = 53; 
      
      doc.text("Nama Lengkap", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.text(`${namaLengkap}`, xNilai, currentY);
      currentY += 6;

      doc.text("Tanggal Tes", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.text(`${tanggalTes}`, xNilai, currentY);
      currentY += 6;
      
      doc.text("Hasil Diagnosis", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(`${selectedHistory.tingkat_keparahan || "Tidak Diketahui"}`, xNilai, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 6;
      
      doc.text("Tingkat Keyakinan", xLabel, currentY);
      doc.text(":", xTitikDua, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(`${(selectedHistory.nilai_cf_akhir * 100).toFixed(2)}%`, xNilai, currentY);
      doc.setFont("helvetica", "normal");
      
      currentY += 10;

      const tableData = (selectedHistory.detail_jawaban_user || []).map((jawaban, i) => {
        const g = gejalaList.find(gej => gej.kode_gejala === jawaban.gejalaId) || { pernyataan: "Gejala tidak ditemukan" };
        const cfLabel = cfOptions.find(opt => opt.value === jawaban.cfUser)?.label || "-";
        return [
          (i + 1).toString(),
          g.pernyataan,
          cfLabel
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Gejala', 'Jawaban Anda']],
        body: tableData,
        theme: 'grid',
        margin: { bottom: 30 },
        styles: { font: 'helvetica', fontSize: 10, lineWidth: 0.1, lineColor: [0, 0, 0], textColor: [0, 0, 0] },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'left' },
          2: { halign: 'center', cellWidth: 35 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Solusi / Saran Penanganan:", 15, currentY);
      
      doc.setFont("helvetica", "normal");
      const matchedTingkat = tingkatList.find(t => t.nama_tingkat === selectedHistory.tingkat_keparahan);
      const solusiDetox = matchedTingkat?.solusi_detox || "Tidak ada saran spesifik.";
      const splitTeksSolusi = doc.splitTextToSize(solusiDetox, pageWidth - 30);
      doc.text(splitTeksSolusi, 15, currentY + 6);

      currentY += splitTeksSolusi.length * 5 + 10;

      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      const signatureX = pageWidth - 70;
      const tglCetak = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      doc.text("Jakarta,", signatureX, currentY);
      doc.text(`${tglCetak}`, signatureX, currentY + 5);
      doc.text("Mengetahui,", signatureX, currentY + 10);
      doc.text("Pakar / Konselor", signatureX, currentY + 15);
      
      doc.text("                                         ", signatureX, currentY + 40);
      const textWidth = doc.getTextWidth("                                         ");
      doc.setLineWidth(0.3);
      doc.line(signatureX, currentY + 41, signatureX + textWidth, currentY + 41);

      doc.save(`Riwayat_Diagnosis_${namaLengkap.replace(/\s+/g, '_')}_${tanggalTes.substring(0,10).replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF berhasil dicetak!", { id: loadingToast });

    } catch (err) {
      console.error(err);
      toast.error("Gagal mencetak PDF.", { id: loadingToast });
    }
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
            <div className="font-medium text-slate-500">Sisa Kuota Diagnosis</div>
            <div className="col-span-2 font-bold text-blue-600">
              {user?.role === 'admin' ? "Unlimited (∞)" : `${user?.quota || 0} kali`}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={openEditModal}>Edit Profil</Button>
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
                : "Apakah Anda bersedia data riwayat diagnosis ini di lihat oleh Admin?"}
            </p>
          </div>
          <Button
            variant="default" 
            onClick={handleToggleShareData}
            className={
              shareData 
                ? "bg-slate-500 hover:bg-slate-600 text-white" 
                : "bg-green-600 hover:bg-green-700 text-white" 
            }
          >
            {shareData ? "Batalkan Izin" : "Saya Bersedia"}
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
                  <TableHead>Tingkat</TableHead>
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
                      <Button variant="link" size="sm" onClick={() => { setSelectedHistory(item); setIsDetailModalOpen(true); }}>Lihat Detail</Button>
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

      {/* Edit Profile Modal */}
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

      {/* Modal Detail Riwayat */}
      {isDetailModalOpen && selectedHistory && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[70vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Detail Riwayat Diagnosis</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-slate-500 font-medium">Tanggal</span>
                <span className="col-span-2 font-semibold">
                  {new Date(selectedHistory.tanggal).toLocaleString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-slate-500 font-medium">Tingkat Keparahan</span>
                <span className="col-span-2 font-bold text-black-600">{selectedHistory.tingkat_keparahan}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-slate-500 font-medium">Nilai Akhir</span>
                <span className="col-span-2 font-semibold">{(selectedHistory.nilai_cf_akhir * 100).toFixed(2)}%</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-800 mb-3">Detail Jawaban Anda:</h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[100px]">Kode Gejala</TableHead>
                    <TableHead>Jawaban</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedHistory.detail_jawaban_user && selectedHistory.detail_jawaban_user.length > 0 ? (
                    selectedHistory.detail_jawaban_user.map((jawaban, idx) => {
                      const labelJawaban = cfOptionsList.find(opt => opt.value === jawaban.cfUser)?.label || jawaban.cfUser;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-slate-700">{jawaban.gejalaId}</TableCell>
                          <TableCell>{labelJawaban}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-slate-500 py-4">Data detail tidak tersedia.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
              <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">Cetak Riwayat (PDF)</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
