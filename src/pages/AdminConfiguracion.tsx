import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";

const AdminConfiguracion = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Debes iniciar sesión");
      navigate("/admin");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast.error("No tienes permisos de administrador");
      await supabase.auth.signOut();
      navigate("/admin");
      return;
    }
  };
  const [comisionGlobal, setComisionGlobal] = useState("5");
  const [loading, setLoading] = useState(false);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    
    const comision = parseFloat(comisionGlobal);
    
    if (comision < 0 || comision > 100) {
      toast.error("La comisión debe estar entre 0% y 100%");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      toast.success("Configuración guardada exitosamente");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoShort} alt="BLISS" className="h-12" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Configuración del Sistema
          </h1>
        </header>

        {/* Comisión Global */}
        <Card className="shadow-[var(--shadow-warm)] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Comisión Global
            </CardTitle>
            <CardDescription>
              Configura el porcentaje de comisión que se aplicará a todas las transacciones de los comercios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuardar} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="comision">Porcentaje de Comisión (%)</Label>
                <Input
                  id="comision"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={comisionGlobal}
                  onChange={(e) => setComisionGlobal(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Este porcentaje se aplicará a todas las ventas de los comercios afiliados
                </p>
              </div>

              <Button type="submit" variant="hero" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Información del Sistema */}
        <Card className="shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Versión</p>
                <p className="font-semibold">1.0.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Última actualización</p>
                <p className="font-semibold">Noviembre 2025</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="font-semibold text-primary">125</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Comercios</p>
                <p className="font-semibold text-secondary">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
