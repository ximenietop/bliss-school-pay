import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, CreditCard, DollarSign, Settings, History, LogOut } from "lucide-react";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalComercios, setTotalComercios] = useState(0);
  const [transaccionesHoy, setTransaccionesHoy] = useState(0);
  const [loading, setLoading] = useState(true);

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

    loadDashboardStats();
  };

  const loadDashboardStats = async () => {
    try {
      // Count total clients
      const { count: clientesCount, error: clientesError } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true })
        .eq("tipo_usuario", "cliente");

      if (clientesError) throw clientesError;

      // Count total comercios
      const { count: comerciosCount, error: comerciosError } = await supabase
        .from("comercios")
        .select("*", { count: "exact", head: true });

      if (comerciosError) throw comerciosError;

      // Count today's transactions
      const today = new Date().toISOString().split("T")[0];
      const { count: transaccionesCount, error: transaccionesError } = await supabase
        .from("transacciones")
        .select("*", { count: "exact", head: true })
        .gte("fecha", today)
        .lt("fecha", `${today}T23:59:59.999Z`);

      if (transaccionesError) throw transaccionesError;

      setTotalClientes(clientesCount || 0);
      setTotalComercios(comerciosCount || 0);
      setTransaccionesHoy(transaccionesCount || 0);
    } catch (error: any) {
      toast.error("Error al cargar estadísticas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando estadísticas...</p>
      </div>
    );
  }

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
              <p className="text-4xl font-bold text-primary">{totalClientes.toLocaleString("es-CO")}</p>
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-warm)]">
            <CardHeader>
              <CardTitle className="text-lg">Comercios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-secondary">{totalComercios.toLocaleString("es-CO")}</p>
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-warm)]">
            <CardHeader>
              <CardTitle className="text-lg">Transacciones Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent-foreground">{transaccionesHoy.toLocaleString("es-CO")}</p>
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
