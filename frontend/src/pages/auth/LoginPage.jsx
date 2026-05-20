import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      const state = useAuthStore.getState();
      if (state.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
        <Card className="w-full border-none shadow-xl md:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">

        <CardHeader className="space-y-2 pt-8 pb-4 px-6 md:px-8">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center tracking-tight text-slate-900">
            Selamat Datang
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-center text-slate-500">
            Silakan masuk untuk melanjutkan 
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                className="w-full h-11 px-4 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full h-11 pl-4 pr-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs md:text-sm text-red-600 font-medium text-center">{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>

          </form>
        </CardContent>
        <CardFooter className="px-6 md:px-8 pb-8 flex justify-center border-t border-slate-50 pt-6">
          <p className="text-sm text-slate-500">
            Belum punya akun? <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors cursor-pointer">Daftar sekarang</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  </div>
  );
}

