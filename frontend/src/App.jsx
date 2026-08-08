import { BrowserRouter, Routes, Route } from "react-router-dom";
import SideNav from "./components/SideNav";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import DataCollection from "./pages/DataCollection";
import NVSimulation from "./pages/NVSimulation";
import VectorMagnetometry from "./pages/VectorMagnetometry";
import Navigation from "./pages/Navigation";
import { SessionProvider } from "./context/SessionContext";

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <div className="h-screen flex bg-void text-slate-200">
          <SideNav />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 overflow-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/data-collection" element={<DataCollection />} />
                <Route path="/simulation" element={<NVSimulation />} />
                <Route path="/vector-magnetometry" element={<VectorMagnetometry />} />
                <Route path="/navigation" element={<Navigation />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </SessionProvider>
  );
}
