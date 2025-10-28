import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientTasksTabProps {
  clientId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string | null;
}

export const ClientTasksTab = ({ clientId }: ClientTasksTabProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [clientId]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("client_tasks")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (data) setTasks(data);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingTask) {
      // Update existing task
      const { error } = await supabase
        .from("client_tasks")
        .update({
          ...formData,
          completed_at:
            formData.status === "done" ? new Date().toISOString() : null,
        })
        .eq("id", editingTask.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la tâche",
          variant: "destructive",
        });
      } else {
        toast({ title: "Succès", description: "Tâche mise à jour" });
        resetForm();
        fetchTasks();
      }
    } else {
      // Create new task
      const { error } = await supabase.from("client_tasks").insert({
        client_id: clientId,
        user_id: user.id,
        ...formData,
      });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer la tâche",
          variant: "destructive",
        });
      } else {
        toast({ title: "Succès", description: "Tâche créée" });
        resetForm();
        fetchTasks();
      }
    }
  };

  const handleDelete = async (taskId: string) => {
    const { error } = await supabase
      .from("client_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    } else {
      toast({ title: "Succès", description: "Tâche supprimée" });
      fetchTasks();
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    const { error } = await supabase
      .from("client_tasks")
      .update({
        status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", task.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    } else {
      fetchTasks();
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      todo: "bg-muted text-muted-foreground",
      in_progress: "bg-warning text-warning-foreground",
      done: "bg-success text-success-foreground",
    };
    const labels: Record<string, string> = {
      todo: "À faire",
      in_progress: "En cours",
      done: "Terminé",
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-primary/20 text-primary",
      high: "bg-destructive text-destructive-foreground",
    };
    const labels: Record<string, string> = {
      low: "Basse",
      medium: "Moyenne",
      high: "Haute",
    };
    return (
      <Badge variant="outline" className={variants[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">À faire</p>
              <p className="text-3xl font-bold text-muted-foreground">
                {todoTasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">En cours</p>
              <p className="text-3xl font-bold text-warning">
                {inProgressTasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Terminé</p>
              <p className="text-3xl font-bold text-success">
                {doneTasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tâches & To-Do Lists</CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle tâche
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4 border-t pt-6">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                placeholder="Titre de la tâche..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Description de la tâche..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">À faire</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="done">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorité</Label>
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date limite</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {editingTask ? "Mettre à jour" : "Créer la tâche"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune tâche pour ce client
            </CardContent>
          </Card>
        ) : (
          <>
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className="mt-1"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`text-lg font-semibold ${
                              task.status === "done"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.due_date && (
                            <span>
                              📅{" "}
                              {new Date(task.due_date).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                          )}
                          {task.completed_at && (
                            <span>
                              ✅ Terminé le{" "}
                              {new Date(task.completed_at).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(task)}
                      >
                        Éditer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

