import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/tingkat` : "http://localhost:5151/api/tingkat";

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

  const cetakPDFTingkat = async () => {
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
      doc.text("Daftar Tingkat Keparahan Nomophobia", pageWidth / 2, currentY, { align: "center" });
      
      currentY += 8;

      const tableData = tingkatData.map(item => [
        item.kode_tingkat,
        item.nama_tingkat,
        `${item.batas_min}% - ${item.batas_max}%`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['ID', 'Nama Tingkat', 'Persentase Skor']],
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
          0: { halign: 'center' },
          1: { halign: 'left' },
          2: { halign: 'center' }
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

      doc.save("Laporan_Tingkat_Nomophobia.pdf");
      toast.success("PDF berhasil dicetak!", { id: loadingToast });

    } catch (err) {
      console.error(err);
      toast.error("Gagal mencetak PDF.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Tingkat Nomophobia</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button onClick={cetakPDFTingkat} variant="outline" className="w-full md:w-auto">
              Cetak PDF
            </Button>
            <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">
              Tambah Tingkat
            </Button>
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
