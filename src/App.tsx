import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Cliente routes
import ClienteLogin from "./pages/ClienteLogin";
import ClienteDashboard from "./pages/ClienteDashboard";
import ClienteCompra from "./pages/ClienteCompra";
import ClienteMovimientos from "./pages/ClienteMovimientos";

// Comercio routes
import ComercioLogin from "./pages/ComercioLogin";
import ComercioDashboard from "./pages/ComercioDashboard";
import ComercioMovimientos from "./pages/ComercioMovimientos";

// Admin routes
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClientes from "./pages/AdminClientes";
import AdminRecargas from "./pages/AdminRecargas";
import AdminComercios from "./pages/AdminComercios";
import AdminPagos from "./pages/AdminPagos";
import AdminMovimientos from "./pages/AdminMovimientos";
import AdminConfiguracion from "./pages/AdminConfiguracion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Cliente Routes */}
          <Route path="/cliente" element={<ClienteLogin />} />
          <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
          <Route path="/cliente/compra" element={<ClienteCompra />} />
          <Route path="/cliente/movimientos" element={<ClienteMovimientos />} />
          
          {/* Comercio Routes */}
          <Route path="/comercio" element={<ComercioLogin />} />
          <Route path="/comercio/dashboard" element={<ComercioDashboard />} />
          <Route path="/comercio/movimientos" element={<ComercioMovimientos />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/clientes" element={<AdminClientes />} />
          <Route path="/admin/recargas" element={<AdminRecargas />} />
          <Route path="/admin/comercios" element={<AdminComercios />} />
          <Route path="/admin/pagos" element={<AdminPagos />} />
          <Route path="/admin/movimientos" element={<AdminMovimientos />} />
          <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
