/**
 * Algorithme de priorisation automatique des tâches pour TDAH
 * Calcule un score de priorité basé sur plusieurs critères
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  deadline?: string | null;
  recurring?: boolean;
  is_blocking?: boolean;
  calculated_priority_score?: number;
  client_id?: string;
}

/**
 * Calcule le score de priorité d'une tâche
 * Score plus élevé = plus prioritaire
 */
export function calculatePriorityScore(task: Task): number {
  let score = 0;

  // 1. Priorité de base (0-100)
  const basePriorityScores = {
    urgent: 100,
    high: 70,
    medium: 40,
    low: 10,
  };
  score += basePriorityScores[task.priority] || 0;

  // 2. Deadline imminente (0-150)
  if (task.deadline) {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) {
      // En retard : score très élevé
      score += 150;
    } else if (hoursUntilDeadline < 24) {
      // Dans les 24h : score élevé
      score += 120;
    } else if (hoursUntilDeadline < 48) {
      // Dans les 48h : score moyen-élevé
      score += 80;
    } else if (hoursUntilDeadline < 168) {
      // Dans la semaine : score moyen
      score += 40;
    }
  }

  // 3. Tâche bloquante (0-50)
  if (task.is_blocking) {
    score += 50;
  }

  // 4. Tâche récurrente (0-30)
  if (task.recurring) {
    score += 30;
  }

  // 5. Statut (tâche en cours = légèrement plus prioritaire)
  if (task.status === 'in_progress') {
    score += 10;
  }

  return Math.round(score);
}

/**
 * Trie les tâches par priorité calculée
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return tasks
    .map(task => ({
      ...task,
      calculated_priority_score: calculatePriorityScore(task),
    }))
    .sort((a, b) => {
      // Tâches en retard en premier
      const aOverdue = a.deadline && new Date(a.deadline) < new Date();
      const bOverdue = b.deadline && new Date(b.deadline) < new Date();
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Puis par score de priorité
      return (b.calculated_priority_score || 0) - (a.calculated_priority_score || 0);
    });
}

/**
 * Filtre les tâches pour ne garder que les plus prioritaires (max 5)
 */
export function getTopPriorityTasks(tasks: Task[], maxCount: number = 5): Task[] {
  const sorted = sortTasksByPriority(tasks);
  return sorted
    .filter(task => task.status !== 'done' && task.status !== 'archived')
    .slice(0, maxCount);
}

/**
 * Sépare les tâches en "Focus du jour" et "Backlog"
 */
export function separateFocusAndBacklog(tasks: Task[], focusCount: number = 5) {
  const sorted = sortTasksByPriority(tasks);
  const activeTasks = sorted.filter(
    task => task.status !== 'done' && task.status !== 'archived'
  );

  return {
    focus: activeTasks.slice(0, focusCount),
    backlog: activeTasks.slice(focusCount),
  };
}

/**
 * Détermine la couleur de priorité pour l'affichage
 */
export function getPriorityColor(priority: string, score?: number): string {
  if (score && score >= 200) return 'destructive'; // Rouge - Urgent/En retard
  if (score && score >= 150) return 'destructive'; // Rouge - Très urgent
  if (priority === 'urgent' || score && score >= 120) return 'destructive'; // Rouge
  if (priority === 'high' || score && score >= 80) return 'default'; // Orange
  if (priority === 'medium' || score && score >= 40) return 'secondary'; // Jaune
  return 'outline'; // Gris - Basse priorité
}

/**
 * Détermine le label de priorité
 */
export function getPriorityLabel(priority: string, score?: number): string {
  if (score && score >= 200) return 'En retard';
  if (score && score >= 150) return 'Urgent';
  if (priority === 'urgent') return 'Urgent';
  if (priority === 'high') return 'Haute';
  if (priority === 'medium') return 'Moyenne';
  return 'Basse';
}


