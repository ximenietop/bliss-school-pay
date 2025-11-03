import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, Percent, DollarSign } from "lucide-react";
import logoShort from "@/assets/bliss-logo-short.png";

const ComercioMovimientos = () => {
  const navigate = useNavigate();

  const transacciones = [
    {
      id: 1,
      tipo: "compra",
      cliente: "Juan Pérez",
      monto: 5000,
      comision: 250,
      descripcion: "Almuerzo escolar",
      fecha: "2025-11-01 12:30"
    },
    {
      id: 2,
      tipo: "pago",
      cliente: "Admin BLISS",
      monto: 50000,
      comision: 0,
      descripcion: "Retiro de saldo",
      fecha: "2025-10-31 16:00"
    },
    {
      id: 3,
      tipo: "compra",
      cliente: "María García",
      monto: 8500,
      comision: 425,
      descripcion: "Combo almuerzo + bebida",
      fecha: "2025-10-30 13:15"
    }
  ];

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
        <div className="space-y-4">
          {transacciones.map((trans) => (
            <Card key={trans.id} className="shadow-[var(--shadow-warm)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-full ${
                      trans.tipo === "pago" 
                        ? "bg-destructive/20 text-destructive" 
                        : "bg-primary/20 text-primary"
                    }`}>
                      {trans.tipo === "pago" ? (
                        <DollarSign className="h-5 w-5" />
                      ) : (
                        <ShoppingBag className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{trans.descripcion}</h3>
                      <p className="text-sm text-muted-foreground">{trans.cliente}</p>
                      <p className="text-xs text-muted-foreground mt-1">{trans.fecha}</p>
                      {trans.comision > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
                          <Percent className="h-3 w-3" />
                          <span>Comisión: ${trans.comision.toLocaleString("es-CO")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      trans.tipo === "pago" ? "text-destructive" : "text-primary"
                    }`}>
                      {trans.tipo === "pago" ? "-" : "+"}${trans.monto.toLocaleString("es-CO")}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      trans.tipo === "pago" 
                        ? "bg-destructive/20 text-destructive" 
                        : "bg-primary/20 text-primary"
                    }`}>
                      {trans.tipo === "pago" ? "Retiro" : "Venta"}
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

export default ComercioMovimientos;
