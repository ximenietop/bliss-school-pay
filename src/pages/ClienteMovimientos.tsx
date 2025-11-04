import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";

const ClienteMovimientos = () => {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovimientos();
  }, []);

  const loadMovimientos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/cliente");
        return;
      }

      const { data, error } = await supabase
        .from("transacciones")
        .select(`
          id,
          tipo,
          descripcion,
          monto,
          fecha,
          comercios (
            nombre
          )
        `)
        .eq("id_usuario", user.id)
        .order("fecha", { ascending: false });

      if (error) throw error;

      const movimientosFormateados = data.map(t => ({
        id: t.id,
        tipo: t.tipo,
        comercio: t.comercios?.nombre || "Admin BLISS",
        monto: Number(t.monto),
        descripcion: t.descripcion,
        fecha: new Date(t.fecha).toLocaleString("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
      }));

      setMovimientos(movimientosFormateados);
    } catch (error: any) {
      toast.error("Error al cargar movimientos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando movimientos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cliente/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoShort} alt="BLISS" className="h-12" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Mis Movimientos
          </h1>
        </header>

        {/* Movimientos List */}
        {movimientos.length === 0 ? (
          <Card className="shadow-[var(--shadow-warm)]">
            <CardContent className="p-6 text-center text-muted-foreground">
              No tienes movimientos aún
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
          {movimientos.map((mov) => (
            <Card key={mov.id} className="shadow-[var(--shadow-warm)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-full ${
                      mov.tipo === "recarga" 
                        ? "bg-accent/20 text-accent-foreground" 
                        : "bg-secondary/20 text-secondary"
                    }`}>
                      {mov.tipo === "recarga" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{mov.descripcion}</h3>
                      <p className="text-sm text-muted-foreground">{mov.comercio}</p>
                      <p className="text-xs text-muted-foreground mt-1">{mov.fecha}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      mov.tipo === "recarga" ? "text-accent-foreground" : "text-secondary"
                    }`}>
                      {mov.tipo === "recarga" ? "+" : "-"}${mov.monto.toLocaleString("es-CO")}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      mov.tipo === "recarga" 
                        ? "bg-accent/20 text-accent-foreground" 
                        : "bg-secondary/20 text-secondary"
                    }`}>
                      {mov.tipo === "recarga" ? "Recarga" : "Compra"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteMovimientos;
