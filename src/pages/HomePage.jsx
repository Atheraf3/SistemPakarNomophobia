function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Selamat Datang di Sistem Pakar</h1>
      <p className="max-w-xl text-muted-foreground text-lg">
        Sistem pakar berbasis web untuk membantu proses diagnosis dan pengambilan keputusan.
      </p>
      <a
        href="/diagnosis"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Mulai Diagnosis
      </a>
    </div>
  );
}

export default HomePage;
