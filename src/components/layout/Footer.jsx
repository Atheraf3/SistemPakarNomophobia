function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Sistem Pakar. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
