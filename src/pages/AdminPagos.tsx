import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";

const AdminPagos = () => {
  const navigate = useNavigate();
  const [comercioId, setComercioId] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const comercios = [
    { id: "1", nombre: "Cafetería Escolar", codigo: "10001", saldo: 95000 },
    { id: "2", nombre: "Papelería CRF", codigo: "10002", saldo: 45000 },
  ];

  const handlePago = (e: React.FormEvent) => {
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

    if (comercio && montoNum > comercio.saldo) {
      toast.error("El monto excede el saldo disponible del comercio");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      toast.success("Pago realizado exitosamente");
      setComercioId("");
      setMonto("");
      setDescripcion("");
      setLoading(false);
    }, 1500);
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
                    {comercios.map((comercio) => (
                      <SelectItem key={comercio.id} value={comercio.id}>
                        {comercio.nombre} - Saldo: ${comercio.saldo.toLocaleString("es-CO")}
                      </SelectItem>
                    ))}
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
                    Saldo disponible: ${comercios.find(c => c.id === comercioId)?.saldo.toLocaleString("es-CO")}
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
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <div>
                  <p className="font-medium">Cafetería Escolar</p>
                  <p className="text-xs text-muted-foreground">Retiro quincenal</p>
                </div>
                <p className="font-bold text-destructive">-$50,000</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <div>
                  <p className="font-medium">Papelería CRF</p>
                  <p className="text-xs text-muted-foreground">Retiro mensual</p>
                </div>
                <p className="font-bold text-destructive">-$35,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPagos;
