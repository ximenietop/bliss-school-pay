import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Store, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";
import { supabase } from "@/integrations/supabase/client";

const AdminComercios = () => {
  const navigate = useNavigate();

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

    loadComercios();
  };

  const [comercios, setComercios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComercio, setEditingComercio] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    comision: "5",
    correo: "",
    password: "",
  });

  const loadComercios = async () => {
    try {
      const { data, error } = await supabase
        .from("comercios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComercios(data || []);
    } catch (error: any) {
      toast.error("Error al cargar comercios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingComercio) {
      try {
        const { error } = await supabase
          .from("comercios")
          .update({
            nombre: formData.nombre,
            codigo_comercio: formData.codigo,
            comision: parseFloat(formData.comision),
          })
          .eq("id", editingComercio.id);

        if (error) throw error;

        toast.success("Comercio actualizado exitosamente");
        loadComercios();
      } catch (error: any) {
        toast.error("Error al actualizar: " + error.message);
      }
    } else {
      try {
        const { data, error } = await supabase.functions.invoke('create-comercio', {
          body: {
            nombre: formData.nombre,
            codigo_comercio: formData.codigo,
            comision: parseFloat(formData.comision),
            correo: formData.correo,
            password: formData.password
          }
        });

        if (error) throw error;

        if (!data.success) {
          throw new Error(data.error || "Error al crear comercio");
        }

        toast.success("Comercio creado exitosamente");
        loadComercios();
      } catch (error: any) {
        toast.error("Error al crear comercio: " + error.message);
      }
    }
    
    setDialogOpen(false);
    setEditingComercio(null);
    setFormData({ nombre: "", codigo: "", comision: "5", correo: "", password: "" });
  };

  const handleEdit = (comercio: any) => {
    setEditingComercio(comercio);
    setFormData({
      nombre: comercio.nombre,
      codigo: comercio.codigo_comercio,
      comision: comercio.comision.toString(),
      correo: "",
      password: "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este comercio?")) return;

    try {
      const { error } = await supabase
        .from("comercios")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Comercio eliminado exitosamente");
      loadComercios();
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando comercios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoShort} alt="BLISS" className="h-12" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Administrar Comercios
            </h1>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => {
                setEditingComercio(null);
                setFormData({ nombre: "", codigo: "", comision: "5", correo: "", password: "" });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Comercio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingComercio ? "Editar Comercio" : "Nuevo Comercio"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Comercio</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código (5 dígitos)</Label>
                  <Input
                    id="codigo"
                    type="text"
                    maxLength={5}
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/\D/g, "") })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comision">Comisión (%)</Label>
                  <Input
                    id="comision"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.comision}
                    onChange={(e) => setFormData({ ...formData, comision: e.target.value })}
                    required
                  />
                </div>
                {!editingComercio && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="correo">Correo Electrónico</Label>
                      <Input
                        id="correo"
                        type="email"
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                        placeholder="comercio@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        required
                      />
                    </div>
                  </>
                )}
                <Button type="submit" variant="hero" className="w-full">
                  {editingComercio ? "Actualizar" : "Crear"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Comercios List */}
        {comercios.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay comercios registrados</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {comercios.map((comercio) => (
              <Card key={comercio.id} className="shadow-[var(--shadow-warm)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-secondary" />
                      {comercio.nombre}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(comercio)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(comercio.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Código:</span>
                    <span className="font-mono font-bold">{comercio.codigo_comercio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Comisión:</span>
                    <span className="font-bold text-secondary">{comercio.comision}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Saldo:</span>
                    <span className="font-bold text-primary">${Number(comercio.saldo || 0).toLocaleString("es-CO")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComercios;
