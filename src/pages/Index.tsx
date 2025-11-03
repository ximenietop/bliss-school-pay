import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Shield } from "lucide-react";
import logoFull from "@/assets/bliss-logo-full.png";

const Index = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Estudiantes y Padres",
      description: "Consulta tu saldo y realiza compras",
      icon: Users,
      route: "/cliente",
      color: "from-primary to-accent",
      iconBg: "bg-primary/20",
      iconColor: "text-primary"
    },
    {
      title: "Comercios Afiliados",
      description: "Gestiona las ventas de tu negocio",
      icon: Store,
      route: "/comercio",
      color: "from-secondary to-primary",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary"
    },
    {
      title: "Administración",
      description: "Panel de control completo",
      icon: Shield,
      route: "/admin",
      color: "from-accent to-secondary",
      iconBg: "bg-accent/20",
      iconColor: "text-accent-foreground"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/10 to-accent/10 p-4">
      <div className="text-center mb-12">
        <img src={logoFull} alt="BLISS" className="h-24 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
          Bienvenido a BLISS
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tu tarjeta prepago escolar inteligente. Fácil, segura y diseñada para ti.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full">
        {modules.map((module) => (
          <Card
            key={module.route}
            className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all shadow-[var(--shadow-warm)]"
            onClick={() => navigate(module.route)}
          >
            <CardHeader className="text-center">
              <div className={`w-16 h-16 rounded-full ${module.iconBg} flex items-center justify-center mx-auto mb-4`}>
                <module.icon className={`h-8 w-8 ${module.iconColor}`} />
              </div>
              <CardTitle className="text-xl">{module.title}</CardTitle>
              <CardDescription className="mt-2">{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="hero" 
                className="w-full"
              >
                Ingresar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© 2025 BLISS - Colegio Refous</p>
        <p className="mt-1">Sistema de tarjeta prepago escolar</p>
      </footer>
    </div>
  );
};

export default Index;
