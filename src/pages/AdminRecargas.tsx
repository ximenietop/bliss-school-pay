import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";

const AdminRecargas = () => {
  const navigate = useNavigate();
  const [clienteId, setClienteId] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const clientes = [
    { id: "1", nombre: "Juan Pérez", correo: "juan.perez@colegiorefous.edu.co" },
    { id: "2", nombre: "María García", correo: "maria.garcia@colegiorefous.edu.co" },
    { id: "3", nombre: "Carlos López", correo: "carlos.lopez@colegiorefous.edu.co" },
  ];

  const handleRecarga = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteId) {
      toast.error("Selecciona un cliente");
      return;
    }

    if (parseFloat(monto) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      toast.success("Recarga realizada exitosamente");
      setClienteId("");
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
            Realizar Recargas
          </h1>
        </header>

        {/* Form Card */}
        <Card className="shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Cargar Saldo a Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecarga} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.correo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto a Recargar</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="0"
                  min="1"
                  step="1000"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Sugerencias: $10,000 | $20,000 | $50,000
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  type="text"
                  placeholder="Ej: Recarga mensual"
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
                  {loading ? "Procesando..." : "Realizar Recarga"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Recargas */}
        <Card className="mt-6 shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle className="text-lg">Recargas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                <div>
                  <p className="font-medium">Juan Pérez</p>
                  <p className="text-xs text-muted-foreground">Recarga mensual</p>
                </div>
                <p className="font-bold text-accent-foreground">+$50,000</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                <div>
                  <p className="font-medium">María García</p>
                  <p className="text-xs text-muted-foreground">Recarga semanal</p>
                </div>
                <p className="font-bold text-accent-foreground">+$30,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRecargas;
