import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-6 md:py-8 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
