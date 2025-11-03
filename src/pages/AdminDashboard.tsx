import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, CreditCard, DollarSign, Settings, History, LogOut } from "lucide-react";
import logoShort from "@/assets/bliss-logo-short.png";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/admin");
  };

  const menuItems = [
    {
      title: "Administrar Clientes",
      description: "Crear, editar y eliminar clientes",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/20",
      route: "/admin/clientes"
    },
    {
      title: "Administrar Comercios",
      description: "Gestionar comercios afiliados",
      icon: Store,
      color: "text-secondary",
      bgColor: "bg-secondary/20",
      route: "/admin/comercios"
    },
    {
      title: "Realizar Recargas",
      description: "Cargar saldo a estudiantes",
      icon: CreditCard,
      color: "text-accent-foreground",
      bgColor: "bg-accent/20",
      route: "/admin/recargas"
    },
    {
      title: "Pagos a Comercios",
      description: "Realizar retiros y pagos",
      icon: DollarSign,
      color: "text-destructive",
      bgColor: "bg-destructive/20",
      route: "/admin/pagos"
    },
    {
      title: "Consulta de Movimientos",
      description: "Ver todas las transacciones",
      icon: History,
      color: "text-primary",
      bgColor: "bg-primary/20",
      route: "/admin/movimientos"
    },
    {
      title: "Configuración",
      description: "Ajustar comisiones y parámetros",
      icon: Settings,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      route: "/admin/configuracion"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-card p-4 rounded-xl shadow-[var(--shadow-warm)]">
          <div className="flex items-center gap-3">
            <img src={logoShort} alt="BLISS" className="h-12" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-sm text-muted-foreground">Gestión completa de BLISS</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-[var(--shadow-warm)]">
            <CardHeader>
              <CardTitle className="text-lg">Total Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">125</p>
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-warm)]">
            <CardHeader>
              <CardTitle className="text-lg">Comercios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-secondary">12</p>
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-warm)]">
            <CardHeader>
              <CardTitle className="text-lg">Transacciones Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent-foreground">48</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.route}
              className="cursor-pointer hover:shadow-lg transition-all shadow-[var(--shadow-warm)]"
              onClick={() => navigate(item.route)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${item.bgColor}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
