import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, Percent } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";

const ComercioMovimientos = () => {
  const navigate = useNavigate();
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransacciones();
  }, []);

  const loadTransacciones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/comercio");
        return;
      }

      // Obtener el comercio del usuario
      const { data: comercio, error: comercioError } = await supabase
        .from("comercios")
        .select("id, comision")
        .eq("usuario_id", user.id)
        .single();

      if (comercioError) throw comercioError;

      // Obtener transacciones del comercio
      const { data, error } = await supabase
        .from("transacciones")
        .select(`
          id,
          tipo,
          descripcion,
          monto,
          fecha,
          usuarios (
            nombre
          )
        `)
        .eq("id_comercio", comercio.id)
        .order("fecha", { ascending: false });

      if (error) throw error;

      const transaccionesFormateadas = data.map(t => {
        const montoNum = Number(t.monto);
        const comision = (montoNum * comercio.comision) / 100;
        
        return {
          id: t.id,
          tipo: t.tipo,
          cliente: t.usuarios?.nombre || "Cliente",
          monto: montoNum,
          comision: comision,
          descripcion: t.descripcion,
          fecha: new Date(t.fecha).toLocaleString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })
        };
      });

      setTransacciones(transaccionesFormateadas);
    } catch (error: any) {
      toast.error("Error al cargar transacciones: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando transacciones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/comercio/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoShort} alt="BLISS" className="h-12" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Transacciones
          </h1>
        </header>

        {/* Transacciones List */}
        {transacciones.length === 0 ? (
          <Card className="shadow-[var(--shadow-warm)]">
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay transacciones aún
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transacciones.map((trans) => (
              <Card key={trans.id} className="shadow-[var(--shadow-warm)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-full bg-primary/20 text-primary">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{trans.descripcion}</h3>
                        <p className="text-sm text-muted-foreground">{trans.cliente}</p>
                        <p className="text-xs text-muted-foreground mt-1">{trans.fecha}</p>
                        {trans.comision > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
                            <Percent className="h-3 w-3" />
                            <span>Comisión BLISS: ${trans.comision.toLocaleString("es-CO")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        +${(trans.monto - trans.comision).toLocaleString("es-CO")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total: ${trans.monto.toLocaleString("es-CO")}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        Venta
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

export default ComercioMovimientos;
