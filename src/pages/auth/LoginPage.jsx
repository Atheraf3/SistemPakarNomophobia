import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const success = login(email, password);
    if (success) {
      const state = useAuthStore.getState();
      if (state.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setError("Email atau password salah.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Pilih kredensial di bawah ini untuk menguji hak akses (password bebas)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Info Akun Dummy */}
          <div className="mb-6 p-4 bg-blue-50 text-blue-900 border border-blue-200 rounded-md text-sm">
            <p className="font-semibold mb-1">Dummy Akun untuk Testing:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Admin:</strong> admin@test.com</li>
              <li><strong>User:</strong> user@test.com</li>
            </ul>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            
            <Button type="submit" className="w-full">Masuk</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline">Daftar sekarang</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
