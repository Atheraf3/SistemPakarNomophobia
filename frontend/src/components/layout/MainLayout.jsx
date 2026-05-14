import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden bg-slate-50">
      <Navbar />
      <main className="flex-1 flex flex-col w-full pt-24">
        <Outlet />
      </main>
      <Footer />
      <PwaInstallPrompt />
    </div>
  );
}

export default MainLayout;
