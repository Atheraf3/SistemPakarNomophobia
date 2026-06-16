import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, FileText, List, Percent } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalDiagnosis: 0, 
    totalGejala: 0, 
    rataRataCF: "0%",
    kategoriDistribution: null,
    trenHarian: null,
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const kategoriChartRef = useRef(null);
  const trenChartRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true
        };
        const API_URL = import.meta.env.VITE_API_URL 
          ? `${import.meta.env.VITE_API_URL}/auth/admin/stats` 
          : "http://localhost:5151/api/auth/admin/stats";
        
        const response = await axios.get(API_URL, config);
        if (response.data && response.data.data) {
          setStats((prev) => ({ ...prev, ...response.data.data }));
        }
      } catch (error) {
        console.error("Gagal mengambil statistik admin", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (isLoading || !stats.kategoriDistribution || !stats.trenHarian) return;

    let kategoriChartInstance = null;
    let trenChartInstance = null;

    if (kategoriChartRef.current) {
      const dist = stats.kategoriDistribution;
      kategoriChartInstance = new Chart(kategoriChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Tidak NMP', 'Ringan', 'Sedang', 'Berat', 'Akut'],
          datasets: [{
            data: [
              dist['Tidak Nomophobia'] || 0, 
              dist['Nomophobia Ringan'] || 0, 
              dist['Nomophobia Sedang'] || 0, 
              dist['Nomophobia Berat'] || 0, 
              dist['Nomophobia Akut'] || 0
            ],
            backgroundColor: [
              '#22C55E',
              '#3B82F6',
              '#F59E0B',
              '#EF4444', 
              '#B91C1C'  
            ],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    if (trenChartRef.current) {
      const tren = stats.trenHarian;
      trenChartInstance = new Chart(trenChartRef.current, {
        type: 'line',
        data: {
          labels: tren.map(t => t.date),
          datasets: [{
            label: 'Total Deteksi',
            data: tren.map(t => t.count),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3B82F6',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { borderDash: [5, 5] }, ticks: { stepSize: 1 } },
            x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } }
          }
        }
      });
    }

    return () => {
      if (kategoriChartInstance) kategoriChartInstance.destroy();
      if (trenChartInstance) trenChartInstance.destroy();
    };
  }, [isLoading, stats.kategoriDistribution, stats.trenHarian]);

  return (
    <div className="space-y-8 pb-8 relative">
      {/* QUICK ACTIONS & HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Admin</h2>
          <p className="text-sm text-slate-500">Ringkasan aktivitas dan metrik Sistem Pakar Nomophobia.</p>
        </div>
      </div>

      {/* TOP ROW: Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200/60 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total User</CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Pengguna terdaftar di sistem</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200/60 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Riwayat Diagnosis</CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileText className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.totalDiagnosis}</div>
            <p className="text-xs text-slate-500 mt-1">Total diagnosis dilakukan</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Gejala</CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><List className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.totalGejala}</div>
            <p className="text-xs text-slate-500 mt-1">Aturan gejala aktif</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Rata-Rata CF</CardTitle>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><Percent className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.rataRataCF}</div>
            <p className="text-xs text-slate-500 mt-1">Skor rata-rata keparahan</p>
          </CardContent>
        </Card>
      </div>

      {/* MIDDLE ROW: Chart Placeholders */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Pie/Doughnut Chart */}
        <Card className="md:col-span-4 shadow-sm border-slate-200/60 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800">Distribusi Kategori Nomophobia</CardTitle>
            <CardDescription>Berdasarkan hasil seluruh diagnosis</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex items-center justify-center p-4">
            {/* Canvas Chart.js */}
            <canvas ref={kategoriChartRef} id="kategoriChart" className="w-full h-full max-h-[250px]"></canvas>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="md:col-span-8 shadow-sm border-slate-200/60 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800">Tren Deteksi Bulanan</CardTitle>
            <CardDescription>Total pengguna yang melakukan deteksi dalam 30 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] p-4">
            {/* Canvas Chart.js */}
            <canvas ref={trenChartRef} id="trenChart" className="w-full h-full max-h-[250px]"></canvas>
          </CardContent>
        </Card>
      </div>  

    </div>
  );
}
