
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Slider } from "@/components/ui/Slider/Slider";
import { CheckCircle, Circle, Edit, Save, Trash, Plus } from "lucide-react";

// Mock data for goals
const initialGoals = [
  { id: 1, title: 'Study documentation for 2 hours', completed: false, progress: 45 },
  { id: 2, title: 'Complete 3 coding challenges', completed: true, progress: 100 },
  { id: 3, title: 'Limit social media to 30 minutes', completed: false, progress: 60 },
];

interface Goal {
  id: number;
  title: string;
  completed: boolean;
  progress: number;
}

const Goals: React.FC = () => {
  // const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem("goals");
    return savedGoals ? JSON.parse(savedGoals) : initialGoals;
  });
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
const updateLocalStorage = (updatedGoals: Goal[]) => {
  localStorage.setItem("goals", JSON.stringify(updatedGoals));
};


  const handleAddGoal = () => {
    if (newGoalTitle.trim() === '') return;
    
    const newGoal: Goal = {
      id: Math.max(0, ...goals.map(g => g.id)) + 1,
      title: newGoalTitle.trim(),
      completed: false,
      progress: 0
    };
    
    // setGoals([...goals, newGoal]);
      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      updateLocalStorage(updatedGoals);
    setNewGoalTitle('');
  };
  
  const handleRemoveGoal = (id: number) => {
    // setGoals(goals.filter(goal => goal.id !== id));
      const updatedGoals = goals.filter((goal) => goal.id !== id);
      setGoals(updatedGoals);
      updateLocalStorage(updatedGoals);
  };
  
  const handleToggleComplete = (id: number) => {
    // setGoals(goals.map(goal => 
    //   goal.id === id ? { ...goal, completed: !goal.completed, progress: !goal.completed ? 100 : goal.progress } : goal
    // ));
      const updatedGoals = goals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
              progress: !goal.completed ? 100 : goal.progress,
            }
          : goal
      );
      setGoals(updatedGoals);
      updateLocalStorage(updatedGoals);
  };
  
  const handleProgressChange = (id: number, newProgress: number) => {
    // setGoals(goals.map(goal => 
    //   goal.id === id ? { 
    //     ...goal, 
    //     progress: newProgress, 
    //     completed: newProgress === 100
    //   } : goal
    // ));
      const updatedGoals = goals.map((goal) =>
        goal.id === id
          ? { ...goal, progress: newProgress, completed: newProgress === 100 }
          : goal
      );
      setGoals(updatedGoals);
      updateLocalStorage(updatedGoals);
  };
  
  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
  };
  
  const saveEdit = () => {
    if (editTitle.trim() === '') return;
    
    setGoals(goals.map(goal => 
      goal.id === editingId ? { ...goal, title: editTitle.trim() } : goal
    ));
    
    setEditingId(null);
    setEditTitle('');
  };
  
  return (
    <Card className="pixel-container">
      <CardHeader>
        <CardTitle>Productivity Goals</CardTitle>
        <CardDescription>
          Set and track your productivity goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Enter a new goal..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleAddGoal} className="px-3" variant="default">
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
        
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No goals yet. Add your first goal above!
            </div>
          ) : (
            goals.map((goal) => (
              <div 
                key={goal.id} 
                className="p-3 border-2 border-black"
                style={{
                  backgroundColor: goal.completed ? 'rgba(16, 185, 129, 0.1)' : 'white'
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <button 
                      onClick={() => handleToggleComplete(goal.id)}
                      className="flex-shrink-0"
                    >
                      {goal.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {editingId === goal.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1"
                      />
                    ) : (
                      <span className={goal.completed ? "line-through text-muted-foreground" : ""}>
                        {goal.title}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {editingId === goal.id ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={saveEdit}
                        className="h-8 w-8"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startEditing(goal)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleRemoveGoal(goal.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="pl-7">
                  <div className="flex items-center gap-4">
                    <div className="w-full flex-1">
                      <Slider
                        value={[goal.progress]}
                        min={0}
                        max={100}
                        step={5}
                        disabled={goal.completed}
                        onValueChange={(values) => handleProgressChange(goal.id, values[0])}
                      />
                    </div>
                    <div className="w-12 text-right font-medium">
                      {goal.progress}%
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Completing goals helps your LilGuy grow and gain new items!
      </CardFooter>
    </Card>
  );
};

export default Goals;
