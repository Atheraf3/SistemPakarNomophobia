import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/tingkat` : "http://localhost:5151/api/tingkat";

export default function ManagePenyakitPage() {
  const [tingkatData, setTingkatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", kode_tingkat: "", nama_tingkat: "", batas_min: "", batas_max: "", solusi_detox: "" });
  const [isEdit, setIsEdit] = useState(false);
  const tableRef = useRef(null);

  const fetchTingkat = useCallback(async function fetchTingkat() {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.data;
  }, []);

  useEffect(function initTingkat() {
    let ignore = false;
    
    async function startFetching() {
      try {
        const data = await fetchTingkat();
        if (!ignore) {
          setTingkatData(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal mengambil data", error);
          toast.error("Gagal mengambil data tingkat dari server.");
          setLoading(false);
        }
      }
    }

    startFetching();
    return () => { ignore = true; };
  }, [fetchTingkat]);

  const handleOpenModal = (tingkat = null) => {
    if (tingkat) {
      setFormData({
        id: tingkat._id,
        kode_tingkat: tingkat.kode_tingkat,
        nama_tingkat: tingkat.nama_tingkat,
        batas_min: tingkat.batas_min,
        batas_max: tingkat.batas_max,
        solusi_detox: tingkat.solusi_detox || ""
      });
      setIsEdit(true);
    } else {
      setFormData({ id: "", kode_tingkat: "", nama_tingkat: "", batas_min: "", batas_max: "", solusi_detox: "" });
      setIsEdit(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/${formData.id}`, formData, { withCredentials: true });
        toast.success("Berhasil memperbarui data!");
      } else {
        await axios.post(API_URL, formData, { withCredentials: true });
        toast.success("Berhasil menambahkan data!");
      }
      handleCloseModal();
      
      // Refresh data
      const updatedData = await fetchTingkat();
      setTingkatData(updatedData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">Hapus data ini?</p>
          <p className="text-xs text-slate-500">Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
                  toast.success("Data berhasil dihapus!");
                  const updatedData = await fetchTingkat();
                  setTingkatData(updatedData);
                } catch (error) {
                  console.error(error);
                  toast.error("Gagal menghapus data");
                }
              }}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
            >
              Hapus
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

  const handlePrintPdf = () => {
    const element = tableRef.current;
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     'Laporan_Tingkat_Nomophobia.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Tingkat Nomophobia</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handlePrintPdf} variant="outline" className="w-full md:w-auto">Cetak PDF</Button>
          <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">Tambah Tingkat</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tingkat</CardTitle>
          <CardDescription>
            Definisi tingkat keparahan yang digunakan sebagai konklusi (hipotesis final) Certainty Factor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-slate-500">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto w-full pb-4 bg-white" ref={tableRef}>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4 hidden print:block" data-html2canvas-ignore="false">Laporan Tingkat Nomophobia</h3>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nama Tingkat</TableHead>
                    <TableHead>Persentase Skor</TableHead>
                    <TableHead className="text-right html2pdf__page-break-avoid" data-html2canvas-ignore="true">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tingkatData && tingkatData.length > 0 ? tingkatData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.kode_tingkat}</TableCell>
                      <TableCell>{item.nama_tingkat}</TableCell>
                      <TableCell>{item.batas_min}% - {item.batas_max}%</TableCell>
                      <TableCell className="text-right space-x-2" data-html2canvas-ignore="true">
                        <Button onClick={() => handleOpenModal(item)} variant="outline" size="sm">Edit</Button>
                        <Button onClick={() => handleDelete(item._id)} variant="destructive" size="sm">Hapus</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-slate-500">Belum ada data tingkat.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Overlay untuk Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-6 w-full max-md shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-5">{isEdit ? "Edit Tingkat" : "Tambah Tingkat Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kode_tingkat">ID (Kode Tingkat)</Label>
                <Input 
                  id="kode_tingkat" 
                  value={formData.kode_tingkat} 
                  onChange={(e) => setFormData({...formData, kode_tingkat: e.target.value})} 
                  placeholder="Contoh: T1" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_tingkat">Nama Tingkat</Label>
                <Input 
                  id="nama_tingkat" 
                  value={formData.nama_tingkat} 
                  onChange={(e) => setFormData({...formData, nama_tingkat: e.target.value})} 
                  placeholder="Contoh: Ringan" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batas_min">Batas Minimal (%)</Label>
                  <Input 
                    id="batas_min" 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.batas_min} 
                    onChange={(e) => setFormData({...formData, batas_min: e.target.value})} 
                    placeholder="0" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batas_max">Batas Maksimal (%)</Label>
                  <Input 
                    id="batas_max" 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.batas_max} 
                    onChange={(e) => setFormData({...formData, batas_max: e.target.value})} 
                    placeholder="20" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="solusi_detox">Solusi / Saran</Label>
                <textarea 
                  id="solusi_detox" 
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                  value={formData.solusi_detox} 
                  onChange={(e) => setFormData({...formData, solusi_detox: e.target.value})} 
                  placeholder="Masukkan solusi untuk tingkat ini..." 
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Batal</Button>
                <Button type="submit">{isEdit ? "Simpan Perubahan" : "Simpan"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
