import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoShort from "@/assets/bliss-logo-short.png";

const AdminClientes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([
    { id: "1", nombre: "Juan Pérez", correo: "juan.perez@colegiorefous.edu.co", saldo: 50000 },
    { id: "2", nombre: "María García", correo: "maria.garcia@colegiorefous.edu.co", saldo: 30000 },
    { id: "3", nombre: "Carlos López", correo: "carlos.lopez@colegiorefous.edu.co", saldo: 25000 },
  ]);

  const [newCliente, setNewCliente] = useState({
    nombre: "",
    correo: "",
    password: "",
    saldo: "0"
  });

  const handleAddCliente = () => {
    if (!newCliente.correo.endsWith("@colegiorefous.edu.co")) {
      toast.error("El correo debe ser institucional (@colegiorefous.edu.co)");
      return;
    }
    toast.success("Cliente agregado exitosamente");
    setNewCliente({ nombre: "", correo: "", password: "", saldo: "0" });
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Administrar Clientes
          </h1>
        </header>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    value={newCliente.nombre}
                    onChange={(e) => setNewCliente({...newCliente, nombre: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Correo Institucional</Label>
                  <Input
                    type="email"
                    value={newCliente.correo}
                    onChange={(e) => setNewCliente({...newCliente, correo: e.target.value})}
                    placeholder="nombre@colegiorefous.edu.co"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    value={newCliente.password}
                    onChange={(e) => setNewCliente({...newCliente, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saldo Inicial</Label>
                  <Input
                    type="number"
                    value={newCliente.saldo}
                    onChange={(e) => setNewCliente({...newCliente, saldo: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <Button variant="hero" className="w-full" onClick={handleAddCliente}>
                  Crear Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clientes List */}
        <div className="space-y-4">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="shadow-[var(--shadow-warm)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{cliente.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{cliente.correo}</p>
                    <p className="text-lg font-bold text-primary mt-2">
                      Saldo: ${cliente.saldo.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default AdminClientes;
