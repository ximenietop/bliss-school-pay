import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, ShoppingBag, CreditCard, DollarSign } from "lucide-react";
import logoShort from "@/assets/bliss-logo-short.png";

const AdminMovimientos = () => {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const transacciones = [
    {
      id: 1,
      tipo: "compra",
      usuario: "Juan Pérez",
      comercio: "Cafetería Escolar",
      monto: 5000,
      comision: 250,
      descripcion: "Almuerzo escolar",
      fecha: "2025-11-01 12:30"
    },
    {
      id: 2,
      tipo: "recarga",
      usuario: "María García",
      comercio: null,
      monto: 50000,
      comision: 0,
      descripcion: "Recarga mensual",
      fecha: "2025-11-01 10:00"
    },
    {
      id: 3,
      tipo: "pago",
      usuario: null,
      comercio: "Cafetería Escolar",
      monto: 50000,
      comision: 0,
      descripcion: "Retiro quincenal",
      fecha: "2025-10-31 16:00"
    },
    {
      id: 4,
      tipo: "compra",
      usuario: "Carlos López",
      comercio: "Papelería CRF",
      monto: 3500,
      comision: 175,
      descripcion: "Material escolar",
      fecha: "2025-10-30 14:20"
    },
    {
      id: 5,
      tipo: "recarga",
      usuario: "Juan Pérez",
      comercio: null,
      monto: 30000,
      comision: 0,
      descripcion: "Recarga semanal",
      fecha: "2025-10-29 09:15"
    }
  ];

  const filteredTransacciones = transacciones.filter(trans => {
    const matchTipo = filtroTipo === "todos" || trans.tipo === filtroTipo;
    const matchBusqueda = 
      trans.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      trans.usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      trans.comercio?.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusqueda;
  });

  const getIcon = (tipo: string) => {
    switch(tipo) {
      case "compra": return <ShoppingBag className="h-5 w-5" />;
      case "recarga": return <CreditCard className="h-5 w-5" />;
      case "pago": return <DollarSign className="h-5 w-5" />;
      default: return <ShoppingBag className="h-5 w-5" />;
    }
  };

  const getColorClass = (tipo: string) => {
    switch(tipo) {
      case "compra": return "bg-primary/20 text-primary";
      case "recarga": return "bg-accent/20 text-accent-foreground";
      case "pago": return "bg-destructive/20 text-destructive";
      default: return "bg-primary/20 text-primary";
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case "compra": return "Compra";
      case "recarga": return "Recarga";
      case "pago": return "Pago";
      default: return tipo;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoShort} alt="BLISS" className="h-12" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Consulta de Movimientos
          </h1>
        </header>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descripción, usuario o comercio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="compra">Compras</SelectItem>
              <SelectItem value="recarga">Recargas</SelectItem>
              <SelectItem value="pago">Pagos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transacciones List */}
        <div className="space-y-4">
          {filteredTransacciones.map((trans) => (
            <Card key={trans.id} className="shadow-[var(--shadow-warm)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-full ${getColorClass(trans.tipo)}`}>
                      {getIcon(trans.tipo)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{trans.descripcion}</h3>
                      {trans.usuario && (
                        <p className="text-sm text-muted-foreground">Cliente: {trans.usuario}</p>
                      )}
                      {trans.comercio && (
                        <p className="text-sm text-muted-foreground">Comercio: {trans.comercio}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{trans.fecha}</p>
                      {trans.comision > 0 && (
                        <p className="text-xs text-secondary mt-2">
                          Comisión BLISS: ${trans.comision.toLocaleString("es-CO")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      trans.tipo === "pago" ? "text-destructive" : "text-primary"
                    }`}>
                      {trans.tipo === "pago" ? "-" : "+"}${trans.monto.toLocaleString("es-CO")}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getColorClass(trans.tipo)}`}>
                      {getTipoLabel(trans.tipo)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTransacciones.length === 0 && (
          <Card className="shadow-[var(--shadow-warm)]">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No se encontraron transacciones</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminMovimientos;
