import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth/users` 
  : "http://localhost:5151/api/auth/users";

const HISTORY_API = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth/users` 
  : "http://localhost:5151/api/auth/users";

export default function ManageUsersPage() {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [historyLoading, setHistoryLoading] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true
    };
  };

  const fetchUsers = useCallback(async function fetchUsers() {
    const res = await axios.get(API_URL, getAuthConfig());
    return res.data.data;
  }, []);

  useEffect(function initUsers() {
    let ignore = false;

    async function startFetching() {
      try {
        const data = await fetchUsers();
        if (!ignore) {
          setUsersData(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal mengambil data users", error);
          toast.error("Gagal mengambil data users dari server.");
          setLoading(false);
        }
      }
    }

    startFetching();

    return () => {
      ignore = true;
    };
  }, [fetchUsers]);

  const handleViewHistory = async (userId) => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${HISTORY_API}/${userId}/history`, getAuthConfig());
      setSelectedUser({
        name: res.data.user.name,
        email: res.data.user.email,
        history: res.data.data
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengambil riwayat user ini.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleResetQuota = async (userId, userName) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">Reset kuota diagnosis?</p>
          <p className="text-xs text-slate-500">Apakah Anda yakin ingin me-reset kuota untuk user <strong className="text-slate-700">{userName}</strong> menjadi 3?</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.put(`${API_URL}/${userId}/reset-quota`, {}, getAuthConfig());
                  toast.success(`Kuota ${userName} berhasil direset!`);
                  setUsersData(prev => prev.map(u => u._id === userId ? { ...u, quota: 3 } : u));
                } catch (error) {
                  toast.error(error.response?.data?.message || "Gagal me-reset kuota user.");
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
            >
              Ya, Reset
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Data User</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna & Riwayat</CardTitle>
          <CardDescription>
            Memantau data pengguna yang terdaftar di sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full pb-4">
            {loading ? (
              <div className="py-8 text-center text-slate-500">Memuat data user...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Kuota</TableHead>
                    <TableHead>Izin Data</TableHead>
                    <TableHead>Terdaftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData && usersData.length > 0 ? usersData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                          item.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 ring-purple-600/20' 
                            : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                        }`}>
                          {item.role}
                        </span>
                      </TableCell>
                      <TableCell>{item.role === 'admin' ? "Unlimited" : item.quota}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                          item.shareData
                            ? 'bg-green-50 text-green-700 ring-green-600/20' 
                            : 'bg-slate-50 text-slate-500 ring-slate-200'
                        }`}>
                          {item.shareData ? "Bersedia" : "Privat"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.role !== 'admin' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleResetQuota(item._id, item.name)}
                              title="Reset Kuota"
                            >
                              Reset Kuota
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!item.shareData}
                              onClick={() => handleViewHistory(item._id)}
                              title={!item.shareData ? "User tidak mengizinkan akses data" : "Lihat Riwayat"}
                            >
                              Lihat Riwayat
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-slate-500">Belum ada data user.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Riwayat User */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Riwayat Diagnosis</h3>
                <p className="text-sm text-slate-500">{selectedUser.name} &mdash; {selectedUser.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>✕ Tutup</Button>
            </div>
            <div className="overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="py-8 text-center text-slate-500">Memuat riwayat...</div>
              ) : selectedUser.history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Tingkat</TableHead>
                      <TableHead>Nilai CF (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUser.history.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{item.tingkat_keparahan}</TableCell>
                        <TableCell>{(item.nilai_cf_akhir * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-slate-500">User ini belum memiliki riwayat diagnosis.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
