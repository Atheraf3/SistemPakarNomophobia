import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/cf-options`
  : "http://localhost:5151/api/cf-options";

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

export default function ManageCfOptionPage() {
  const [cfOptions, setCfOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", label: "", value: "", description: "" });
  const [isEdit, setIsEdit] = useState(false);

  const fetchCfOptions = useCallback(async function fetchCfOptions() {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.data;
  }, []);

  useEffect(function initCfOptions() {
    let ignore = false;
    
    async function startFetching() {
      try {
        const data = await fetchCfOptions();
        if (!ignore) {
          setCfOptions(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal mengambil data", error);
          toast.error("Gagal mengambil data CF Option dari server.");
          setLoading(false);
        }
      }
    }

    startFetching();
    return () => { ignore = true; };
  }, [fetchCfOptions]);

  const handleOpenModal = (option = null) => {
    if (option) {
      setFormData({ id: option._id, label: option.label, value: option.value, description: option.description });
      setIsEdit(true);
    } else {
      setFormData({ id: "", label: "", value: "", description: "" });
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
        toast.success("Berhasil memperbarui CF Option!");
      } else {
        await axios.post(API_URL, formData, { withCredentials: true });
        toast.success("Berhasil menambahkan CF Option!");
      }
      handleCloseModal();
      
      const updatedData = await fetchCfOptions();
      setCfOptions(updatedData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">Hapus CF Option ini?</p>
          <p className="text-xs text-slate-500">Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
                  toast.success("CF Option berhasil dihapus!");
                  const updatedData = await fetchCfOptions();
                  setCfOptions(updatedData);
                } catch (error) {
                  console.error(error);
                  toast.error("Gagal menghapus CF Option");
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

  const cetakPDFCfOption = async () => {
    const loadingToast = toast.loading("Sedang menyiapkan dokumen PDF...");

    try {
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
        console.error("Gagal memuat logo dari URL, menggunakan lingkaran default:", error);
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

      currentY += 10;

      doc.setFontSize(12);
      doc.text("Daftar Pilihan Jawaban & Bobot CF User", pageWidth / 2, currentY, { align: "center" });
      
      currentY += 8;

      const tableData = cfOptions.map(item => [
        item.label,
        item.value,
        item.description
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Label', 'Nilai (Value)', 'Deskripsi']],
        body: tableData,
        theme: 'grid', 
        styles: {
          font: 'helvetica',
          fontSize: 10,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [240, 240, 240], 
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 35 },
          1: { halign: 'center', cellWidth: 30 },
          2: { halign: 'left' }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 20;

      let footerY = finalY;
      if (footerY > pageHeight - 40) {
        doc.addPage();
        footerY = 20;
      }

      const today = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('id-ID', options);

      const signatureCenterX = pageWidth - 45;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Jakarta, ${formattedDate}`, signatureCenterX, footerY, { align: "center" });
      doc.text("pakar,", signatureCenterX, footerY + 5, { align: "center" });
      
      doc.setLineWidth(0.3);
      doc.line(signatureCenterX - 20, footerY + 30, signatureCenterX + 20, footerY + 30);

      doc.save("Laporan_Pilihan_Pengguna.pdf");
      toast.success("PDF berhasil dicetak!", { id: loadingToast });

    } catch (err) {
      console.error(err);
      toast.error("Gagal mencetak PDF.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Pilihan Jawaban User (CF User)</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Button onClick={cetakPDFCfOption} variant="outline" className="w-full md:w-auto">Cetak PDF</Button>
          <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">Tambah Pilihan Jawaban</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pilihan Jawaban </CardTitle>
          <CardDescription>
            Pilihan yang akan ditampilkan saat pengguna mengisi kuesioner diagnosis beserta bobot nilainya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-slate-500">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto w-full pb-4 bg-white">
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Nilai (Value)</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cfOptions && cfOptions.length > 0 ? cfOptions.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium align-top">{item.label}</TableCell>
                        <TableCell className="align-top">{item.value}</TableCell>
                        <TableCell className="align-top">{item.description}</TableCell>
                        <TableCell className="text-right space-x-2 align-top">
                          <Button onClick={() => handleOpenModal(item)} variant="outline" size="sm">Edit</Button>
                          <Button onClick={() => handleDelete(item._id)} variant="destructive" size="sm">Hapus</Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-slate-500">Belum ada data CF Option.</TableCell>
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
            <h3 className="text-xl font-bold mb-5">{isEdit ? "Edit CF Option" : "Tambah CF Option Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label (Contoh: Sering)</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Masukkan label"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Nilai Bobot (0.0 - 1.0)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Contoh: 0.8 atau 0.05"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Saya sering mengalami ini"
                  required
                  rows={3}
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
