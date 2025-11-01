import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Calendar, AlertCircle, CheckCircle2, Circle, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  urgency: boolean;
  status: "todo" | "in_progress" | "done";
  due_date?: string;
  client_id?: string;
  client?: {
    name: string;
    company?: string;
  };
  created_at: string;
  updated_at: string;
}

const statusConfig = [
  { id: "todo", label: "À faire", icon: Circle, color: "bg-blue-500" },
  { id: "in_progress", label: "En cours", icon: Calendar, color: "bg-yellow-500" },
  { id: "done", label: "Terminé", icon: CheckCircle2, color: "bg-green-500" },
];

const Tasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    urgency: false,
    status: "todo" as const,
    due_date: "",
    client_id: "none",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch tasks with client info
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select(`
          *,
          client:clients!left(id, name, company)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Fetch clients for dropdown
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, company")
        .eq("user_id", user.id)
        .order("name");

      if (clientsError) throw clientsError;
      setClients(clientsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        category: task.category || "",
        priority: task.priority,
        urgency: task.urgency,
        status: task.status,
        due_date: task.due_date || "",
        client_id: task.client_id || "none",
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        urgency: false,
        status: "todo",
        due_date: "",
        client_id: "none",
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const dataToSave = {
        ...formData,
        client_id: formData.client_id === "none" ? null : formData.client_id,
        due_date: formData.due_date || null,
      };

      if (editingTask) {
        const { error } = await supabase
          .from("tasks")
          .update(dataToSave)
          .eq("id", editingTask.id);

        if (error) throw error;
        toast({ title: "✅ Tâche modifiée" });
      } else {
        const { error } = await supabase
          .from("tasks")
          .insert({ ...dataToSave, user_id: user.id });

        if (error) throw error;
        toast({ title: "✅ Tâche créée" });
      }

      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "🗑️ Tâche supprimée" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (event: any) => {
    setDraggedTask(event.active.id as string);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setDraggedTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id as Task["status"];

    if (!taskId || !newStatus) return;

    // Find current task
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    // Update in database
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      toast({ title: "✅ Tâche déplacée" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de déplacer la tâche",
        variant: "destructive",
      });
      fetchData(); // Revert
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgent";
      case "high":
        return "Haute";
      case "medium":
        return "Moyenne";
      default:
        return "Basse";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">📋 Tâches</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos tâches et projets
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nouvelle tâche
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {statusConfig.map((status) => (
          <div
            key={status.id}
            id={status.id}
            className="space-y-4"
          >
            <Card>
              <CardHeader className={`${status.color} text-white`}>
                <CardTitle className="flex items-center gap-2">
                  <status.icon className="h-5 w-5" />
                  {status.label}
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === status.id)
                .map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("taskId", task.id);
                      e.dataTransfer.setData("currentStatus", task.status);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedTaskId = e.dataTransfer.getData("taskId");
                      const currentStatus = e.dataTransfer.getData("currentStatus");
                      
                      if (droppedTaskId === task.id && currentStatus !== status.id) {
                        handleDragEnd({
                          active: { id: droppedTaskId },
                          over: { id: status.id }
                        });
                      }
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-semibold">
                                {task.title}
                              </h3>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(task.id)}
                            className="h-6 w-6"
                          >
                            ×
                          </Button>
                        </div>

                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}

                        {task.client && (
                          <p className="text-xs text-muted-foreground">
                            📁 {task.client.company || task.client.name}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={getPriorityColor(task.priority) as any}
                            className="text-xs"
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>

                          {task.urgency && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}

                          {task.due_date && (
                            <Badge
                              variant={
                                isOverdue(task.due_date) ? "destructive" : "outline"
                              }
                              className="text-xs"
                            >
                              📅{" "}
                              {format(new Date(task.due_date), "dd MMM", {
                                locale: fr,
                              })}
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(task)}
                          className="w-full mt-2"
                        >
                          Modifier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ma tâche importante"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Détails de la tâche..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="ex: Onboarding, Content"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_id">Client/Organisation</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, client_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Deadline</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="urgency"
                checked={formData.urgency}
                onChange={(e) =>
                  setFormData({ ...formData, urgency: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="urgency" className="cursor-pointer">
                Marquer comme urgent
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingTask ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;

