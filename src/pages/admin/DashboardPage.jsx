import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalDiagnosis: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        const response = await axios.get("http://localhost:5151/api/admin/stats", config);
        if (response.data && response.data.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil statistik admin", error);
        // Fallback or error handling can be done here
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin</h2>
        <p className="text-slate-500">Ringkasan statistik sistem pakar.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total User</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-slate-500">Pengguna terdaftar di sistem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riwayat Diagnosis</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalDiagnosis}</div>
            <p className="text-xs text-slate-500">Total diagnosis dilakukan</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
