import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import logoShort from "@/assets/bliss-logo-short.png";

const ClienteMovimientos = () => {
  const navigate = useNavigate();

  const movimientos = [
    {
      id: 1,
      tipo: "compra",
      comercio: "Cafetería Escolar",
      monto: 5000,
      descripcion: "Almuerzo escolar",
      fecha: "2025-11-01 12:30"
    },
    {
      id: 2,
      tipo: "recarga",
      comercio: "Admin BLISS",
      monto: 50000,
      descripcion: "Recarga mensual",
      fecha: "2025-11-01 08:00"
    },
    {
      id: 3,
      tipo: "compra",
      comercio: "Papelería El Lápiz",
      monto: 3500,
      descripcion: "Cuadernos",
      fecha: "2025-10-30 14:15"
    }
  ];

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
      </div>
    </div>
  );
};

export default ClienteMovimientos;
