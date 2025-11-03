import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, History, LogOut, Store } from "lucide-react";
import logoShort from "@/assets/bliss-logo-short.png";

const ComercioDashboard = () => {
  const navigate = useNavigate();
  const [saldo] = useState(95000);
  const [nombre] = useState("Cafetería Escolar");
  const [codigo] = useState("10001");

  const handleLogout = () => {
    navigate("/comercio");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-card p-4 rounded-xl shadow-[var(--shadow-warm)]">
          <div className="flex items-center gap-3">
            <img src={logoShort} alt="BLISS" className="h-12" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                {nombre}
              </h1>
              <p className="text-sm text-muted-foreground">Código: {codigo}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Saldo Card */}
        <Card className="mb-8 bg-gradient-to-br from-secondary to-primary text-white shadow-[var(--shadow-warm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5" />
              Saldo Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">
              ${saldo.toLocaleString("es-CO")}
            </p>
            <p className="text-sm mt-2 text-white/80">Disponible para retiro</p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-[var(--shadow-warm)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="h-5 w-5 text-primary" />
                Ventas del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">$250,000</p>
              <p className="text-sm text-muted-foreground mt-1">48 transacciones</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-warm)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-secondary" />
                Comisión BLISS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">5%</p>
              <p className="text-sm text-muted-foreground mt-1">Por transacción</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all shadow-[var(--shadow-warm)]"
          onClick={() => navigate("/comercio/movimientos")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Consulta todas las ventas recibidas y comisiones aplicadas
            </p>
            <Button variant="hero" className="w-full">
              Ver transacciones
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComercioDashboard;
