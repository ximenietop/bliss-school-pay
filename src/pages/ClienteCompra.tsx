import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";

const ClienteCompra = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const comerciosValidos = ["10001", "10002"];

  const handleCompra = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comerciosValidos.includes(codigo)) {
      toast.error("Código de comercio no válido");
      return;
    }

    if (parseFloat(monto) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    setLoading(true);
    
    // Simulación de compra
    setTimeout(() => {
      toast.success("¡Compra realizada exitosamente!");
      navigate("/cliente/dashboard");
      setLoading(false);
    }, 1500);
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
                <Label htmlFor="codigo">Código del Comercio (5 dígitos)</Label>
                <Input
                  id="codigo"
                  type="text"
                  placeholder="10001"
                  maxLength={5}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Códigos válidos: 10001 (Cafetería), 10002 (Papelería)
                </p>
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
