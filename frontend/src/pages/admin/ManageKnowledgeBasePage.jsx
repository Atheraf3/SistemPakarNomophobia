import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5151/api";
const API_URL = `${BASE_URL}/knowledge-base`;

export default function ManageKnowledgeBasePage() {
  const [kbData, setKbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", kode_gejala: "", mb: "", md: "" });
  const tableRef = useRef(null);

  const fetchKb = useCallback(async function fetchKb() {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.data;
  }, []);

  useEffect(function initKb() {
    let ignore = false;
    async function startFetching() {
      try {
        const data = await fetchKb();
        if (!ignore) {
          setKbData(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal mengambil data KB", error);
          toast.error("Gagal mengambil data dari server.");
          setLoading(false);
        }
      }
    }
    startFetching();
    return () => { ignore = true; };
  }, [fetchKb]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await axios.post(`${API_URL}/sync`, {}, { withCredentials: true });
      const count = res.data.synced;
      if (count > 0) {
        toast.success(`${count} gejala baru berhasil disinkronkan ke basis pengetahuan!`);
      } else {
        toast.success("Basis pengetahuan sudah sinkron dengan daftar gejala.");
      }
      
      const updatedData = await fetchKb();
      setKbData(updatedData);
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan sinkronisasi.");
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenModal = (item) => {
    setFormData({
      id: item._id,
      kode_gejala: item.kode_gejala,
      mb: item.mb !== null ? item.mb : "",
      md: item.md !== null ? item.md : "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const cfPreview = () => {
    const mb = parseFloat(formData.mb);
    const md = parseFloat(formData.md);
    if (!isNaN(mb) && !isNaN(md)) {
      return (mb - md).toFixed(4);
    }
    return "-";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, { mb: formData.mb, md: formData.md }, { withCredentials: true });
      toast.success(`Bobot untuk ${formData.kode_gejala} berhasil diperbarui!`);
      handleCloseModal();
      
      const updatedData = await fetchKb();
      setKbData(updatedData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  const handlePrintPdf = () => {
    const element = tableRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: "Laporan_Knowledge_Base_CF_Pakar.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const getCFBadge = (cf) => {
    if (cf === null || cf === undefined) return { text: "Belum diisi", cls: "bg-slate-100 text-slate-500" };
    if (cf >= 0.7) return { text: cf, cls: "bg-green-100 text-green-700 font-bold" };
    if (cf >= 0.4) return { text: cf, cls: "bg-amber-100 text-amber-700 font-bold" };
    return { text: cf, cls: "bg-red-100 text-red-700 font-bold" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Basis Pengetahuan (CF Pakar)</h2>
          <p className="text-sm text-slate-500 mt-0.5">CF Pakar = MB − MD (dihitung otomatis)</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <Button onClick={handleSync} variant="outline" className="w-full md:w-auto" disabled={syncing}>
            {syncing ? "Menyinkronkan..." : "Sinkron Gejala"}
          </Button>
          <Button onClick={handlePrintPdf} variant="outline" className="w-full md:w-auto">Cetak PDF</Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
        <strong>Cara penggunaan:</strong> Klik <strong>"Sinkron Gejala"</strong> untuk mengimpor semua gejala dari halaman Kelola Gejala ke tabel ini. Kemudian, klik <strong>"Edit Bobot"</strong> pada setiap baris untuk mengisi nilai <strong>MB</strong> (Measure of Belief) dan <strong>MD</strong> (Measure of Disbelief) dengan rentang <strong>0.0 – 1.0</strong>. Nilai <strong>CF Pakar = MB − MD</strong> akan dihitung otomatis.
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nilai Certainty Factor Pakar</CardTitle>
          <CardDescription>
            Atur nilai MB dan MD untuk setiap gejala. CF Pakar = MB − MD (sesuai metode Certainty Factor).
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
                      <TableHead className="w-[120px]">Kode Gejala</TableHead>
                      <TableHead className="w-[100px]">Nilai MB</TableHead>
                      <TableHead className="w-[100px]">Nilai MD</TableHead>
                      <TableHead className="w-[120px]">CF Pakar</TableHead>
                      <TableHead className="text-right" data-html2canvas-ignore="true">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kbData && kbData.length > 0 ? kbData.map((item) => {
                      const badge = getCFBadge(item.cf_pakar);
                      return (
                        <TableRow key={item._id}>
                          <TableCell className="font-semibold text-blue-700">{item.kode_gejala}</TableCell>
                          <TableCell>{item.mb !== null ? item.mb : <span className="text-slate-400 italic">-</span>}</TableCell>
                          <TableCell>{item.md !== null ? item.md : <span className="text-slate-400 italic">-</span>}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${badge.cls}`}>
                              {badge.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-right" data-html2canvas-ignore="true">
                            <Button onClick={() => handleOpenModal(item)} variant="outline" size="sm">Edit Bobot</Button>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                          Belum ada data. Klik <strong>"Sinkron Gejala"</strong> untuk mengimpor gejala.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Edit Bobot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-1">Edit Bobot CF Pakar</h3>
            <p className="text-sm text-slate-500 mb-5">
              Kode Gejala: <span className="font-semibold text-blue-700">{formData.kode_gejala}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mb">Nilai MB (0.0 – 1.0)</Label>
                  <Input
                    id="mb"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.mb}
                    onChange={(e) => setFormData({ ...formData, mb: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-slate-400">Measure of Belief</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="md">Nilai MD (0.0 – 1.0)</Label>
                  <Input
                    id="md"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.md}
                    onChange={(e) => setFormData({ ...formData, md: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-slate-400">Measure of Disbelief</p>
                </div>
              </div>

              {/* CF Pakar Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">CF Pakar (MB − MD)</p>
                  <p className="text-xs text-slate-400 mt-0.5">Dihitung otomatis oleh sistem</p>
                </div>
                <span className="text-2xl font-black text-blue-700">{cfPreview()}</span>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Batal</Button>
                <Button type="submit">Simpan Bobot</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
