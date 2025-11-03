import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShoppingCart, History, LogOut } from "lucide-react";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(0);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/cliente");
        return;
      }

      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("nombre, saldo")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setNombre(usuario.nombre);
      setSaldo(usuario.saldo);
    } catch (error: any) {
      toast.error(error.message);
      navigate("/cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/cliente");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-card p-4 rounded-xl shadow-[var(--shadow-warm)]">
          <div className="flex items-center gap-3">
            <img src={logoShort} alt="BLISS" className="h-12" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Hola, {nombre}
              </h1>
              <p className="text-sm text-muted-foreground">Estudiante</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Saldo Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary to-secondary text-white shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5" />
              Saldo Disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">
              ${saldo.toLocaleString("es-CO")}
            </p>
            <p className="text-sm mt-2 text-white/80">Pesos colombianos</p>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all shadow-[var(--shadow-warm)]"
            onClick={() => navigate("/cliente/compra")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Realizar Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compra en comercios afiliados usando tu saldo BLISS
              </p>
              <Button variant="hero" className="w-full mt-4">
                Comprar ahora
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all shadow-[var(--shadow-warm)]"
            onClick={() => navigate("/cliente/movimientos")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-secondary" />
                Mis Movimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Consulta tu historial de compras y recargas
              </p>
              <Button variant="secondary" className="w-full mt-4">
                Ver historial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;
