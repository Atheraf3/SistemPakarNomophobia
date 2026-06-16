import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL 
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

export default function ManageSolutionsPage() {
  const [tingkatData, setTingkatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", kode_tingkat: "", nama_tingkat: "", solusi_detox: "" });
  const tableRef = useRef(null);

  const fetchData = useCallback(async function fetchData() {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.data;
  }, []);

  useEffect(function initFetch() {
    let ignore = false;

    async function startFetching() {
      try {
        const data = await fetchData();
        if (!ignore) {
          setTingkatData(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal mengambil data", error);
          toast.error("Gagal mengambil data solusi dari server.");
          setLoading(false);
        }
      }
    }

    startFetching();

    return function cleanup() {
      ignore = true;
    };
  }, [fetchData]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const existingItem = tingkatData.find(t => t._id === formData.id);
      const payload = {
        ...existingItem,
        solusi_detox: formData.solusi_detox
      };

      await axios.put(`${API_URL}/${formData.id}`, payload, { withCredentials: true });
      toast.success("Berhasil memperbarui solusi!");
      setIsModalOpen(false);
      
      const updatedData = await fetchData();
      setTingkatData(updatedData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
    }
  }

  function handleEdit(item) {
    setFormData({
      id: item._id,
      kode_tingkat: item.kode_tingkat,
      nama_tingkat: item.nama_tingkat,
      solusi_detox: item.solusi_detox || ""
    });
    setIsModalOpen(true);
  }

  async function cetakPDFSolusi() {
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

      const logoUrl = "https://ik.imagekit.io/2xthk8ud4/TA/Logo.png?updatedAt=1776489422811";
      try {
        const logoBase64 = await getBase64ImageFromURL(logoUrl);
        doc.addImage(logoBase64, 'PNG', 12, currentY - 3, 16, 16); 
      } catch (error) {
        console.error("Gagal memuat logo dari URL, menggunakan lingkaran default:", error);
        doc.setFillColor(200, 200, 200); 
        doc.circle(20, currentY + 5, 8, 'F'); 
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Sistem Pakar Deteksi Dini Nomophobia", pageWidth / 2, currentY + 7, { align: "center" });
      
      currentY += 15;
      
      doc.setLineWidth(0.5);
      doc.line(15, currentY, pageWidth - 15, currentY);

      currentY += 10;

      doc.setFontSize(12);
      doc.text("Daftar Solusi per Tingkatan", pageWidth / 2, currentY, { align: "center" });
      
      currentY += 8;

      const tableData = tingkatData.map(item => [
        item.kode_tingkat,
        item.nama_tingkat,
        item.solusi_detox || "-"
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['ID Tingkat', 'Nama Tingkat', 'Solusi / Saran']],
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
          0: { halign: 'center', cellWidth: 20 },
          1: { halign: 'left', cellWidth: 40 },
          2: { halign: 'justify' }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 20;

      let footerY = finalY;
      if (footerY > pageHeight - 40) {
        doc.addPage();
        footerY = 20;
      }

      const today = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('id-ID', options);

      const signatureX = pageWidth - 70;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Jakarta, ${formattedDate}`, signatureX, footerY);
      doc.text("Pakar,", signatureX, footerY + 5);
      
      doc.text("                                         ", signatureX, footerY + 30);
      const textWidth = doc.getTextWidth("                                         ");
      doc.setLineWidth(0.3);
      doc.line(signatureX, footerY + 31, signatureX + textWidth, footerY + 31);

      doc.save("Laporan_Solusi_Nomophobia.pdf");
      toast.success("PDF berhasil dicetak!", { id: loadingToast });

    } catch (err) {
      console.error(err);
      toast.error("Gagal mencetak PDF.", { id: loadingToast });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Solusi / Anjuran</h2>
        <Button onClick={cetakPDFSolusi} variant="outline" className="w-full md:w-auto">Cetak PDF</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Solusi per Tingkatan</CardTitle>
          <CardDescription>
            Saran penanganan yang akan ditampilkan kepada pengguna sesuai hasil konklusi akhir CF (Tingkat Keparahan).
            Data ini sinkron dengan data tingkat yang ada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-slate-500">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto w-full pb-4 bg-white" ref={tableRef}>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4 hidden print:block">Laporan Solusi Nomophobia</h3>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID Tingkat</TableHead>
                    <TableHead className="w-[150px]">Nama Tingkat</TableHead>
                    <TableHead>Solusi / Saran</TableHead>
                    <TableHead className="text-right" data-html2canvas-ignore="true">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tingkatData && tingkatData.length > 0 ? tingkatData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.kode_tingkat}</TableCell>
                      <TableCell>{item.nama_tingkat}</TableCell>
                      <TableCell className="max-w-md break-words whitespace-pre-wrap">
                        {item.solusi_detox || <span className="text-slate-400 italic">Belum ada solusi...</span>}
                      </TableCell>
                      <TableCell className="text-right" data-html2canvas-ignore="true">
                        <Button onClick={() => handleEdit(item)} variant="outline" size="sm">Edit Solusi</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-slate-500">Belum ada data tingkat. Tambahkan di menu Kelola Tingkat.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Edit Solusi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-2">Edit Solusi</h3>
            <p className="text-sm text-slate-500 mb-5">Tingkat: <span className="font-bold">{formData.kode_tingkat} - {formData.nama_tingkat}</span></p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="solusi_detox">Solusi / Saran Penanganan</Label>
                <textarea 
                  id="solusi_detox" 
                  rows={8}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.solusi_detox} 
                  onChange={(e) => setFormData({...formData, solusi_detox: e.target.value})} 
                  placeholder="Masukkan saran penanganan atau detoks digital..." 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan Solusi</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
