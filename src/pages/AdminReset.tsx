import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import logoFull from "@/assets/bliss-logo-full.png";
import { supabase } from "@/integrations/supabase/client";

const AdminReset = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm("⚠️ ADVERTENCIA: Esto eliminará TODOS los administradores del sistema. ¿Estás seguro?")) {
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('reset-admin');

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Error al resetear admin");
      }

      toast.success("Sistema reseteado exitosamente");
      
      setTimeout(() => {
        navigate("/admin/setup");
      }, 1500);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-warm)]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <img src={logoFull} alt="BLISS" className="h-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Resetear Sistema Admin
          </CardTitle>
          <CardDescription>
            Esta acción eliminará todos los administradores del sistema y permitirá crear uno nuevo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">⚠️ Advertencia</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Se eliminarán todos los administradores</li>
              <li>• Deberás crear un nuevo administrador</li>
              <li>• Esta acción no se puede deshacer</li>
            </ul>
          </div>

          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Reseteando sistema..." : "Resetear y Crear Nuevo Admin"}
          </Button>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/admin")}
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReset;