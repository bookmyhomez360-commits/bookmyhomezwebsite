import { useEffect } from "react";
import "@/App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { ListPropertyDialog } from "@/components/ListProperty";
import Home from "@/pages/Home";
import SplashScreen from "@/components/SplashScreen";
import SearchResults from "@/pages/SearchResults";
import PropertyDetail from "@/pages/PropertyDetail";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import ListPropertyWizard from "@/pages/ListPropertyWizard";
import { useState } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [splashRemoved, setSplashRemoved] = useState(
    window.location.pathname !== "/"
  );

  // OAuth callback: session_id arrives in the URL fragment — handle before routes
  if (location.hash && location.hash.includes("session_id=")) {
    return <AuthCallback />;
  }

  const handleListClick = () => {
    if (user) navigate("/list-property");
    else navigate("/login");
  };

  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isWizard = location.pathname === "/list-property";

  return (
    <>
      <ScrollToTop />{!splashRemoved && <SplashScreen onExited={() => setSplashRemoved(true)} />}
      {!isAuthPage && !isWizard && <Navbar onListClick={handleListClick} />}
      <Routes>
        <Route path="/" element={<Home onListClick={handleListClick} />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/list-property" element={<ListPropertyWizard />} />
      </Routes>
      {!isAuthPage && !isWizard && <Footer onListClick={handleListClick} />}}
      <WhatsAppFab />
    </>
  );
}

function App() {
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
      <AuthProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </AuthProvider>
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}

export default App;
