import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/gejala`
  : "http://localhost:5151/api/gejala";

export default function ManageGejalaPage() {
  const [gejalaData, setGejalaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", kode_gejala: "", pernyataan: "" });
  const [isEdit, setIsEdit] = useState(false);
  const tableRef = useRef(null);

  const fetchGejala = useCallback(async function fetchGejala() {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.data;
  }, []);

  useEffect(function initGejala() {
    let ignore = false;
    
    async function startFetching() {
      try {
        const data = await fetchGejala();
        if (!ignore) {
          setGejalaData(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal mengambil data", error);
          toast.error("Gagal mengambil data gejala dari server.");
          setLoading(false);
        }
      }
    }

    startFetching();
    return () => { ignore = true; };
  }, [fetchGejala]);

  const handleOpenModal = (gejala = null) => {
    if (gejala) {
      setFormData({ id: gejala._id, kode_gejala: gejala.kode_gejala, pernyataan: gejala.pernyataan });
      setIsEdit(true);
    } else {
      setFormData({ id: "", kode_gejala: "", pernyataan: "" });
      setIsEdit(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/${formData.id}`, formData, { withCredentials: true });
        toast.success("Berhasil memperbarui gejala!");
      } else {
        await axios.post(API_URL, formData, { withCredentials: true });
        toast.success("Berhasil menambahkan gejala!");
      }
      handleCloseModal();
      
      const updatedData = await fetchGejala();
      setGejalaData(updatedData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleToggleActive = async (gejala) => {
    try {
      const updatedIsActive = gejala.isActive === false ? true : false;
      const updateData = {
        kode_gejala: gejala.kode_gejala,
        pernyataan: gejala.pernyataan,
        isActive: updatedIsActive,
      };
      await axios.put(`${API_URL}/${gejala._id}`, updateData, { withCredentials: true });
      toast.success(`Gejala berhasil ${updatedIsActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      
      const updatedData = await fetchGejala();
      setGejalaData(updatedData);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status gejala");
    }
  };

  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">Hapus gejala ini?</p>
          <p className="text-xs text-slate-500">Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
                  toast.success("Gejala berhasil dihapus!");
                  const updatedData = await fetchGejala();
                  setGejalaData(updatedData);
                } catch (error) {
                  console.error(error);
                  toast.error("Gagal menghapus gejala");
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
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: "Laporan_Gejala_NMPQ.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Gejala (NMPQ)</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Button onClick={handlePrintPdf} variant="outline" className="w-full md:w-auto">
            Cetak PDF
          </Button>
          <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">
            Tambah Gejala
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Gejala Kuesioner</CardTitle>
          <CardDescription>
            Kumpulan pertanyaan adaptasi dari NMPQ (Nomophobia Questionnaire).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-slate-500">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto w-full pb-4 bg-white" ref={tableRef}>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Pertanyaan Kuesioner</TableHead>
                      <TableHead className="text-right" data-html2canvas-ignore="true">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gejalaData && gejalaData.length > 0 ? gejalaData.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium align-top">{item.kode_gejala}</TableCell>
                        <TableCell className="text-justify leading-relaxed">{item.pernyataan}</TableCell>
                        <TableCell className="text-right space-x-2 align-top" data-html2canvas-ignore="true">
                          <Button 
                            onClick={() => handleToggleActive(item)} 
                            variant={item.isActive !== false ? "default" : "outline"} 
                            className={item.isActive !== false ? "bg-green-500 hover:bg-green-600 text-white" : "text-slate-500"} 
                            size="sm"
                          >
                            Aktif
                          </Button>
                          <Button onClick={() => handleOpenModal(item)} variant="outline" size="sm">Edit</Button>
                          <Button onClick={() => handleDelete(item._id)} variant="destructive" size="sm">Hapus</Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-slate-500">Belum ada data gejala.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-5">{isEdit ? "Edit Gejala" : "Tambah Gejala Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kode_gejala">ID Gejala</Label>
                <Input
                  id="kode_gejala"
                  value={formData.kode_gejala}
                  onChange={(e) => setFormData({ ...formData, kode_gejala: e.target.value })}
                  placeholder="Contoh: G01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pernyataan">Pertanyaan Kuesioner</Label>
                <textarea
                  id="pernyataan"
                  value={formData.pernyataan}
                  onChange={(e) => setFormData({ ...formData, pernyataan: e.target.value })}
                  placeholder="Tulis pertanyaan kuesioner NMPQ..."
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all resize-none"
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
