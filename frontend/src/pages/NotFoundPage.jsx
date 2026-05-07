import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-7xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export default NotFoundPage;
