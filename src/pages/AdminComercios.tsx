import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Store, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";

const AdminComercios = () => {
  const navigate = useNavigate();
  const [comercios, setComercios] = useState([
    { id: "1", nombre: "Cafetería Escolar", codigo: "10001", comision: 5, saldo: 95000 },
    { id: "2", nombre: "Papelería CRF", codigo: "10002", comision: 5, saldo: 45000 },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComercio, setEditingComercio] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    comision: "5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingComercio) {
      setComercios(comercios.map(c => 
        c.id === editingComercio.id 
          ? { ...c, ...formData, comision: parseFloat(formData.comision) }
          : c
      ));
      toast.success("Comercio actualizado exitosamente");
    } else {
      const newComercio = {
        id: Date.now().toString(),
        ...formData,
        comision: parseFloat(formData.comision),
        saldo: 0
      };
      setComercios([...comercios, newComercio]);
      toast.success("Comercio creado exitosamente");
    }
    
    setDialogOpen(false);
    setEditingComercio(null);
    setFormData({ nombre: "", codigo: "", comision: "5" });
  };

  const handleEdit = (comercio: any) => {
    setEditingComercio(comercio);
    setFormData({
      nombre: comercio.nombre,
      codigo: comercio.codigo,
      comision: comercio.comision.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setComercios(comercios.filter(c => c.id !== id));
    toast.success("Comercio eliminado exitosamente");
  };

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
                setFormData({ nombre: "", codigo: "", comision: "5" });
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
                <Button type="submit" variant="hero" className="w-full">
                  {editingComercio ? "Actualizar" : "Crear"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Comercios List */}
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
                  <span className="font-mono font-bold">{comercio.codigo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Comisión:</span>
                  <span className="font-bold text-secondary">{comercio.comision}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Saldo:</span>
                  <span className="font-bold text-primary">${comercio.saldo.toLocaleString("es-CO")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminComercios;
