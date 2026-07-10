import { useEffect, useState } from "react";
import "@/App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";

import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { ListPropertyDialog } from "@/components/ListProperty";
import Home from "@/pages/Home";
import SearchResults from "@/pages/SearchResults";
import PropertyDetail from "@/pages/PropertyDetail";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function App() {
  const [splashRemoved, setSplashRemoved] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const openList = () => setListOpen(true);

  return (
    <div className="App grain">
      <BrowserRouter>
        <ScrollToTop />
        {!splashRemoved && (
          <SplashScreen onExited={() => setSplashRemoved(true)} />
        )}
        <Navbar onListClick={openList} />
        <Routes>
          <Route path="/" element={<Home onListClick={openList} />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
        </Routes>
        <Footer onListClick={openList} />
        <WhatsAppFab />
        <ListPropertyDialog open={listOpen} onOpenChange={setListOpen} />
      </BrowserRouter>
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}

export default App;
