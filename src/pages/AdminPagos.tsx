import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";

const AdminPagos = () => {
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
  const [comercioId, setComercioId] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [comercios, setComercios] = useState<any[]>([]);
  const [loadingComercios, setLoadingComercios] = useState(true);
  const [pagos, setPagos] = useState<any[]>([]);

  useEffect(() => {
    loadComercios();
    loadPagos();
  }, []);

  const loadComercios = async () => {
    try {
      const { data, error } = await supabase
        .from("comercios")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setComercios(data || []);
    } catch (error: any) {
      toast.error("Error al cargar comercios: " + error.message);
    } finally {
      setLoadingComercios(false);
    }
  };

  const loadPagos = async () => {
    try {
      const { data, error } = await supabase
        .from("transacciones")
        .select(`
          *,
          comercios!transacciones_id_comercio_fkey(nombre)
        `)
        .eq("tipo", "pago")
        .order("fecha", { ascending: false })
        .limit(5);

      if (error) throw error;
      setPagos(data || []);
    } catch (error: any) {
      console.error("Error al cargar pagos:", error);
    }
  };

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comercioId) {
      toast.error("Selecciona un comercio");
      return;
    }

    const comercio = comercios.find(c => c.id === comercioId);
    const montoNum = parseFloat(monto);

    if (montoNum <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    if (comercio && montoNum > parseFloat(comercio.saldo?.toString() || "0")) {
      toast.error("El monto excede el saldo disponible del comercio");
      return;
    }

    setLoading(true);
    
    try {
      // Obtener saldo actual del comercio
      const { data: comercioData, error: comercioError } = await supabase
        .from("comercios")
        .select("saldo")
        .eq("id", comercioId)
        .single();

      if (comercioError) throw comercioError;

      const nuevoSaldo = parseFloat(comercioData.saldo?.toString() || "0") - montoNum;

      // Actualizar saldo del comercio
      const { error: updateError } = await supabase
        .from("comercios")
        .update({ saldo: nuevoSaldo })
        .eq("id", comercioId);

      if (updateError) throw updateError;

      // Registrar transacción
      const { error: transaccionError } = await supabase
        .from("transacciones")
        .insert({
          tipo: "pago",
          id_comercio: comercioId,
          monto: montoNum,
          descripcion: descripcion
        });

      if (transaccionError) throw transaccionError;

      toast.success("Pago realizado exitosamente");
      setComercioId("");
      setMonto("");
      setDescripcion("");
      loadComercios();
      loadPagos();
    } catch (error: any) {
      toast.error("Error al realizar pago: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoShort} alt="BLISS" className="h-12" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Pagos a Comercios
          </h1>
        </header>

        {/* Form Card */}
        <Card className="shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-destructive" />
              Realizar Pago/Retiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePago} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="comercio">Comercio</Label>
                <Select value={comercioId} onValueChange={setComercioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar comercio..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingComercios ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : comercios.length === 0 ? (
                      <SelectItem value="empty" disabled>No hay comercios</SelectItem>
                    ) : (
                      comercios.map((comercio) => (
                        <SelectItem key={comercio.id} value={comercio.id}>
                          {comercio.nombre} - Saldo: ${parseFloat(comercio.saldo?.toString() || "0").toLocaleString("es-CO")}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto a Pagar</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
                {comercioId && (
                  <p className="text-xs text-muted-foreground">
                    Saldo disponible: ${parseFloat(comercios.find(c => c.id === comercioId)?.saldo?.toString() || "0").toLocaleString("es-CO")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  type="text"
                  placeholder="Ej: Retiro quincenal"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
                  {loading ? "Procesando..." : "Realizar Pago"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Pagos */}
        <Card className="mt-6 shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle className="text-lg">Pagos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {pagos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay pagos recientes</p>
            ) : (
              <div className="space-y-3">
                {pagos.map((pago) => (
                  <div key={pago.id} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                    <div>
                      <p className="font-medium">{pago.comercios?.nombre || "Comercio"}</p>
                      <p className="text-xs text-muted-foreground">{pago.descripcion}</p>
                    </div>
                    <p className="font-bold text-destructive">
                      -${parseFloat(pago.monto).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPagos;
