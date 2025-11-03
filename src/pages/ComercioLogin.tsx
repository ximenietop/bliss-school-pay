import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logoFull from "@/assets/bliss-logo-full.png";
import { supabase } from "@/integrations/supabase/client";

const ComercioLogin = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: correo,
        password: password,
      });

      if (authError) throw authError;

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "comercio")
        .maybeSingle();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error("No tienes permisos de comercio");
      }

      const { data: comercio, error: comercioError } = await supabase
        .from("comercios")
        .select("*")
        .eq("usuario_id", authData.user.id)
        .maybeSingle();

      if (comercioError || !comercio) {
        await supabase.auth.signOut();
        throw new Error("No se encontró el comercio asociado");
      }

      toast.success("¡Bienvenido!");
      navigate("/comercio/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-warm)]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <img src={logoFull} alt="BLISS" className="h-16" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Comercios Afiliados
          </CardTitle>
          <CardDescription>
            Ingresa con las credenciales de tu comercio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                placeholder="comercio@bliss.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" variant="hero" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComercioLogin;
