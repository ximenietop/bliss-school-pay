import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";

const ClienteCompra = () => {
  const navigate = useNavigate();
  const [comercioId, setComercioId] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [comercios, setComercios] = useState<any[]>([]);
  const [loadingComercios, setLoadingComercios] = useState(true);

  useEffect(() => {
    loadComercios();
  }, []);

  const loadComercios = async () => {
    try {
      const { data, error } = await supabase
        .from("comercios")
        .select("id, nombre, codigo_comercio")
        .order("nombre");

      if (error) throw error;
      setComercios(data || []);
    } catch (error: any) {
      toast.error("Error al cargar comercios: " + error.message);
    } finally {
      setLoadingComercios(false);
    }
  };

  const handleCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comercioId) {
      toast.error("Selecciona un comercio");
      return;
    }

    if (parseFloat(monto) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    setLoading(true);
    
    try {
      // 1. Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");
      
      // 2. Obtener el saldo actual del usuario
      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select("saldo")
        .eq("id", user.id)
        .single();
      
      if (userError) throw userError;
      
      const montoCompra = parseFloat(monto);
      
      // 3. Verificar que tenga saldo suficiente
      if (usuario.saldo < montoCompra) {
        toast.error("Saldo insuficiente");
        setLoading(false);
        return;
      }
      
      // 4. Crear la transacción
      const { error: transaccionError } = await supabase
        .from("transacciones")
        .insert({
          tipo: "compra",
          descripcion: descripcion,
          id_usuario: user.id,
          id_comercio: comercioId,
          monto: montoCompra
        });
      
      if (transaccionError) throw transaccionError;
      
      // 5. Actualizar el saldo del usuario (restar)
      const nuevoSaldoUsuario = usuario.saldo - montoCompra;
      const { error: updateUserError } = await supabase
        .from("usuarios")
        .update({ saldo: nuevoSaldoUsuario })
        .eq("id", user.id);
      
      if (updateUserError) throw updateUserError;
      
      // 6. Obtener el comercio y actualizar su saldo
      const { data: comercio, error: comercioError } = await supabase
        .from("comercios")
        .select("saldo, comision")
        .eq("id", comercioId)
        .single();
      
      if (comercioError) throw comercioError;
      
      // Calcular comisión (por defecto 5%)
      const comision = comercio.comision || 5;
      const montoComision = (montoCompra * comision) / 100;
      const montoParaComercio = montoCompra - montoComision;
      
      // 7. Actualizar el saldo del comercio (sumar monto menos comisión)
      const nuevoSaldoComercio = comercio.saldo + montoParaComercio;
      const { error: updateComercioError } = await supabase
        .from("comercios")
        .update({ saldo: nuevoSaldoComercio })
        .eq("id", comercioId);
      
      if (updateComercioError) throw updateComercioError;
      
      toast.success("¡Compra realizada exitosamente!");
      navigate("/cliente/dashboard");
      
    } catch (error: any) {
      console.error("Error al procesar compra:", error);
      toast.error("Error al procesar la compra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cliente/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoShort} alt="BLISS" className="h-12" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Realizar Compra
          </h1>
        </header>

        {/* Form Card */}
        <Card className="shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle>Ingresa los datos de tu compra</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompra} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="comercio">Comercio</Label>
                <Select value={comercioId} onValueChange={setComercioId} disabled={loadingComercios}>
                  <SelectTrigger id="comercio">
                    <SelectValue placeholder={loadingComercios ? "Cargando comercios..." : "Selecciona un comercio"} />
                  </SelectTrigger>
                  <SelectContent>
                    {comercios.map((comercio) => (
                      <SelectItem key={comercio.id} value={comercio.id}>
                        {comercio.nombre} ({comercio.codigo_comercio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  type="text"
                  placeholder="Ej: Almuerzo del día"
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
                  onClick={() => navigate("/cliente/dashboard")}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
                  {loading ? "Procesando..." : "Confirmar Compra"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteCompra;
