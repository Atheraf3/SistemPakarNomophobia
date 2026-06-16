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

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/gejala`
  : "http://localhost:5151/api/gejala";

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
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    
    img.onerror = error => {
      reject(error);
    };
    
    img.src = url;
  });
}

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

  // async function to load image
  const cetakPDFGejala = async () => {
    // toast loading
    const loadingToast = toast.loading("Sedang menyiapkan dokumen PDF");

    try {
      // jsPDF initialization
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 15;

      // HEADER
      const logoUrl = "https://ik.imagekit.io/2xthk8ud4/TA/Logo.png?updatedAt=1776489422811";
      
      try {
        const logoBase64 = await getBase64ImageFromURL(logoUrl);
        doc.addImage(logoBase64, 'PNG', 12, currentY - 3, 16, 16); 
      } catch (error) {
        console.error("Gagal memuat logo dari URL, menggunakan lingkaran default:", error);
        // Fallback
        doc.setFillColor(200, 200, 200); 
        doc.circle(20, currentY + 5, 8, 'F'); 
      }

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Sistem Pakar Deteksi Dini Nomophobia", pageWidth / 2, currentY + 7, { align: "center" });
      
      currentY += 15;
      
      // Divider line
      doc.setLineWidth(0.5);
      doc.line(15, currentY, pageWidth - 15, currentY);

      currentY += 10;

      // BODY
      doc.setFontSize(12);
      doc.text("Daftar Gejala", pageWidth / 2, currentY, { align: "center" });
      
      currentY += 8;

      // Prepare table data
      const activeGejala = gejalaData.filter(g => g.isActive !== false);
      
      // Format data for autotable
      const tableData = activeGejala.map(g => [g.kode_gejala, g.pernyataan]);

      // Render table using autotable
      autoTable(doc, {
        startY: currentY,
        head: [['ID', 'Pertanyaan Kuesioner']],
        body: tableData,
        theme: 'grid',
        margin: { bottom: 40 }, 
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
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 'auto' }
        }
      });

      // FOOTER
      const finalY = doc.lastAutoTable.finalY + 20;

      let footerY = finalY;
      if (footerY > pageHeight - 40) {
        doc.addPage();
        footerY = 20;
      }

      // Dynamic Date Format
      const today = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('id-ID', options);

      // Determine signature position
      const signatureX = pageWidth - 70;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Jakarta, ${formattedDate}`, signatureX, footerY);
      doc.text("Pakar,", signatureX, footerY + 5);
      
      doc.text("                                         ", signatureX, footerY + 30);
      
      const textWidth = doc.getTextWidth("                                         ");
      doc.setLineWidth(0.3);
      doc.line(signatureX, footerY + 31, signatureX + textWidth, footerY + 31);

      // Save file
      doc.save("Laporan_Gejala_NMPQ.pdf");
      toast.success("PDF berhasil dicetak!", { id: loadingToast });

    } catch (err) {
      console.error(err);
      toast.error("Gagal mencetak PDF.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Gejala (NMPQ)</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Button onClick={cetakPDFGejala} variant="outline" className="w-full md:w-auto">
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