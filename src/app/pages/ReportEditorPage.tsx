import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { reportsAPI, Report, StaffMember, Task, Incident, Anomaly, SupportIssue } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Plus, Trash2, FileText, GripVertical, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const TASK_CATEGORIES = [
  'Inspection',
  'Cleaning',
  'Maintenance',
  'Unloading',
  'Inventory',
  'Sorting',
  'Loading',
  'Other',
];

const SUPPORT_TYPES = [
  'Equipment damage',
  'System issue',
  'Operational issue',
  'Other',
];

// Draggable Task Item Component
interface DraggableTaskItemProps {
  task: Task;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  updateTask: (index: number, field: keyof Task, value: any) => void;
  removeTask: (index: number) => void;
  staff: StaffMember[];
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  index,
  moveTask,
  updateTask,
  removeTask,
  staff,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TASK',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`p-4 bg-[#353535] rounded-lg space-y-3 border border-[#454545] transition-all ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isOver ? 'border-orange-500 bg-[#3f3f3f]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 transition-colors pt-1"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Category</Label>
            <Select value={task.category} onValueChange={(v) => updateTask(index, 'category', v)}>
              <SelectTrigger className="bg-[#2b2b2b] border-[#505050] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2b2b2b] border-[#505050]">
                {TASK_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Description</Label>
            <Textarea
              value={task.description}
              onChange={(e) => updateTask(index, 'description', e.target.value)}
              placeholder="Describe the task..."
              className="bg-[#2b2b2b] border-[#505050] text-white resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Assigned Staff</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 p-2 bg-[#2b2b2b] border border-[#505050] rounded-md min-h-[42px]">
                {task.assignedEmployees && task.assignedEmployees.length > 0 ? (
                  task.assignedEmployees.map((employeeName) => (
                    <span
                      key={employeeName}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded"
                    >
                      {employeeName}
                      <button
                        onClick={() => {
                          const updated = task.assignedEmployees.filter(n => n !== employeeName);
                          updateTask(index, 'assignedEmployees', updated);
                        }}
                        className="hover:text-zinc-300"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-500 text-sm">No staff assigned</span>
                )}
              </div>
              <Select
                value=""
                onValueChange={(employeeName) => {
                  if (employeeName === '__ALL_STAFF__') {
                    // Add all staff members to the task
                    const allStaffNames = staff
                      .filter(s => s.name.trim())
                      .map(s => s.name);
                    updateTask(index, 'assignedEmployees', allStaffNames);
                  } else if (employeeName && !task.assignedEmployees?.includes(employeeName)) {
                    const updated = [...(task.assignedEmployees || []), employeeName];
                    updateTask(index, 'assignedEmployees', updated);
                  }
                }}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white">
                  <SelectValue placeholder="Add staff member..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-600">
                  {staff.filter(s => s.name.trim()).length > 0 && (
                    <SelectItem value="__ALL_STAFF__" className="text-orange-400 font-semibold">
                      ✓ All staff on duty
                    </SelectItem>
                  )}
                  {staff
                    .filter(s => s.name.trim())
                    .filter(s => !task.assignedEmployees?.includes(s.name))
                    .map((member) => (
                      <SelectItem key={member.name} value={member.name} className="text-white">
                        {member.name}
                      </SelectItem>
                    ))}
                  {staff.filter(s => s.name.trim()).length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-zinc-500">No staff added yet</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button
          onClick={() => removeTask(index)}
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-red-500 -mt-1"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Draggable Incident Item Component
interface DraggableIncidentItemProps {
  incident: Incident;
  index: number;
  moveIncident: (dragIndex: number, hoverIndex: number) => void;
  updateIncident: (index: number, field: keyof Incident, value: string) => void;
  removeIncident: (index: number) => void;
}

const DraggableIncidentItem: React.FC<DraggableIncidentItemProps> = ({
  incident,
  index,
  moveIncident,
  updateIncident,
  removeIncident,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'INCIDENT',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'INCIDENT',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveIncident(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`p-4 bg-[#353535] rounded-lg space-y-3 border border-[#454545] transition-all ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isOver ? 'border-orange-500 bg-[#3f3f3f]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 transition-colors pt-1"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Incident Description</Label>
            <Textarea
              value={incident.description}
              onChange={(e) => updateIncident(index, 'description', e.target.value)}
              placeholder="What happened?"
              className="bg-[#2b2b2b] border-[#505050] text-white resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Actions Taken / Mitigation</Label>
            <Textarea
              value={incident.actionsTaken}
              onChange={(e) => updateIncident(index, 'actionsTaken', e.target.value)}
              placeholder="How was it handled?"
              className="bg-[#2b2b2b] border-[#505050] text-white resize-none"
              rows={2}
            />
          </div>
        </div>
        <Button
          onClick={() => removeIncident(index)}
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-red-500 -mt-1"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Draggable Anomaly Item Component
interface DraggableAnomalyItemProps {
  anomaly: Anomaly;
  index: number;
  moveAnomaly: (dragIndex: number, hoverIndex: number) => void;
  updateAnomaly: (index: number, field: keyof Anomaly, value: any) => void;
  removeAnomaly: (index: number) => void;
}

const DraggableAnomalyItem: React.FC<DraggableAnomalyItemProps> = ({
  anomaly,
  index,
  moveAnomaly,
  updateAnomaly,
  removeAnomaly,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'ANOMALY',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'ANOMALY',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveAnomaly(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`p-4 bg-[#353535] rounded-lg space-y-3 border border-[#454545] transition-all ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isOver ? 'border-orange-500 bg-[#3f3f3f]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 transition-colors pt-1"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Severity</Label>
            <Select value={anomaly.severity} onValueChange={(v: 'info' | 'warning' | 'critical') => updateAnomaly(index, 'severity', v)}>
              <SelectTrigger className="bg-[#2b2b2b] border-[#505050] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2b2b2b] border-[#505050]">
                <SelectItem value="critical" className="text-white">Critical</SelectItem>
                <SelectItem value="warning" className="text-white">Warning</SelectItem>
                <SelectItem value="info" className="text-white">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Description</Label>
            <Textarea
              value={anomaly.description}
              onChange={(e) => updateAnomaly(index, 'description', e.target.value)}
              placeholder="Describe the anomaly..."
              className="bg-[#2b2b2b] border-[#505050] text-white resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">What Next Shift Should Do</Label>
            <Textarea
              value={anomaly.nextShiftAction}
              onChange={(e) => updateAnomaly(index, 'nextShiftAction', e.target.value)}
              placeholder="Instructions for next shift..."
              className="bg-[#2b2b2b] border-[#505050] text-white resize-none"
              rows={2}
            />
          </div>
        </div>
        <Button
          onClick={() => removeAnomaly(index)}
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-red-500 -mt-1"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Draggable Support Issue Item Component
interface DraggableSupportIssueItemProps {
  issue: SupportIssue;
  index: number;
  moveSupportIssue: (dragIndex: number, hoverIndex: number) => void;
  updateSupport: (index: number, field: keyof SupportIssue, value: string) => void;
  removeSupport: (index: number) => void;
}

const DraggableSupportIssueItem: React.FC<DraggableSupportIssueItemProps> = ({
  issue,
  index,
  moveSupportIssue,
  updateSupport,
  removeSupport,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'SUPPORT',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'SUPPORT',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveSupportIssue(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`p-4 bg-[#353535] rounded-lg space-y-3 border border-[#454545] transition-all ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isOver ? 'border-orange-500 bg-[#3f3f3f]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 transition-colors pt-1"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Type</Label>
              <Select value={issue.type} onValueChange={(v) => updateSupport(index, 'type', v)}>
                <SelectTrigger className="bg-[#2b2b2b] border-[#505050] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2b2b2b] border-[#505050]">
                  {SUPPORT_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="text-white">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Ticket Number</Label>
              <Input
                value={issue.ticketNumber}
                onChange={(e) => updateSupport(index, 'ticketNumber', e.target.value)}
                placeholder="TKT-####"
                className="bg-[#2b2b2b] border-[#505050] text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Problem Description</Label>
            <Textarea
              value={issue.description}
              onChange={(e) => updateSupport(index, 'description', e.target.value)}
              placeholder="Describe the issue..."
              className="bg-[#2b2b2b] border-[#505050] text-white resize-none"
              rows={2}
            />
          </div>
        </div>
        <Button
          onClick={() => removeSupport(index)}
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-red-500 -mt-1"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default function ReportEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [shift, setShift] = useState<'day' | 'night' | 'day-night'>('day');
  const [staff, setStaff] = useState<StaffMember[]>([{ name: '', notes: '' }]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [supportIssues, setSupportIssues] = useState<SupportIssue[]>([]);

  useEffect(() => {
    // Load report if editing
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const report = await reportsAPI.getById(id!);
      setDate(report.date);
      setLocation(report.location);
      setPreparedBy(report.preparedBy);
      setShift(report.shift);
      setStaff(report.staff.length > 0 ? report.staff : [{ name: '', notes: '' }]);
      setTasks(report.tasks);
      setIncidents(report.incidents);
      setAnomalies(report.anomalies);
      setSupportIssues(report.supportIssues);
    } catch (error: any) {
      console.error('Error loading report:', error);
      toast.error(error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!date || !location || !preparedBy) {
      toast.error('Please fill in all required fields (Date, Location, Prepared By)');
      return;
    }

    // Filter out empty items
    const cleanedStaff = staff.filter(s => s.name.trim());
    const cleanedTasks = tasks.filter(t => t.description.trim());
    const cleanedIncidents = incidents.filter(i => i.description.trim());
    const cleanedAnomalies = anomalies.filter(a => a.description.trim());
    const cleanedSupport = supportIssues.filter(s => s.description.trim());

    const reportData = {
      date,
      location,
      preparedBy,
      shift,
      staff: cleanedStaff,
      tasks: cleanedTasks,
      incidents: cleanedIncidents,
      anomalies: cleanedAnomalies,
      supportIssues: cleanedSupport,
    };

    try {
      setSaving(true);
      if (id) {
        await reportsAPI.update(id, reportData);
        toast.success('Report updated successfully');
      } else {
        const newReport = await reportsAPI.create(reportData);
        toast.success('Report created successfully');
        navigate(`/reports/${newReport.id}/preview`);
        return;
      }
      navigate(`/reports/${id}/preview`);
    } catch (error: any) {
      console.error('Error saving report:', error);
      toast.error(error.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOnly = async () => {
    // Validation
    if (!date || !location || !preparedBy) {
      toast.error('Please fill in all required fields (Date, Location, Prepared By)');
      return;
    }

    // Filter out empty items
    const cleanedStaff = staff.filter(s => s.name.trim());
    const cleanedTasks = tasks.filter(t => t.description.trim());
    const cleanedIncidents = incidents.filter(i => i.description.trim());
    const cleanedAnomalies = anomalies.filter(a => a.description.trim());
    const cleanedSupport = supportIssues.filter(s => s.description.trim());

    const reportData = {
      date,
      location,
      preparedBy,
      shift,
      staff: cleanedStaff,
      tasks: cleanedTasks,
      incidents: cleanedIncidents,
      anomalies: cleanedAnomalies,
      supportIssues: cleanedSupport,
    };

    try {
      setSaving(true);
      if (id) {
        await reportsAPI.update(id, reportData);
        toast.success('Рапорт збережено');
      } else {
        const newReport = await reportsAPI.create(reportData);
        toast.success('Рапорт створено');
        // Update the URL to edit mode without navigating away
        navigate(`/reports/${newReport.id}/edit`, { replace: true });
      }
    } catch (error: any) {
      console.error('Error saving report:', error);
      toast.error(error.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  // Staff handlers
  const addStaff = () => setStaff([...staff, { name: '', notes: '' }]);
  const removeStaff = (index: number) => setStaff(staff.filter((_, i) => i !== index));
  const updateStaff = (index: number, field: keyof StaffMember, value: string) => {
    const updated = [...staff];
    updated[index] = { ...updated[index], [field]: value };
    setStaff(updated);
  };

  // Task handlers
  const addTask = () => {
    setTasks([...tasks, { id: crypto.randomUUID(), category: 'Other', description: '', assignedEmployees: [] }]);
  };
  const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));
  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };
  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const updated = [...tasks];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, dragged);
    setTasks(updated);
  };

  // Incident handlers
  const addIncident = () => {
    setIncidents([...incidents, { id: crypto.randomUUID(), description: '', actionsTaken: '' }]);
  };
  const removeIncident = (index: number) => setIncidents(incidents.filter((_, i) => i !== index));
  const updateIncident = (index: number, field: keyof Incident, value: string) => {
    const updated = [...incidents];
    updated[index] = { ...updated[index], [field]: value };
    setIncidents(updated);
  };
  const moveIncident = (dragIndex: number, hoverIndex: number) => {
    const updated = [...incidents];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, dragged);
    setIncidents(updated);
  };

  // Anomaly handlers
  const addAnomaly = () => {
    setAnomalies([...anomalies, { id: crypto.randomUUID(), severity: 'info', description: '', nextShiftAction: '' }]);
  };
  const removeAnomaly = (index: number) => setAnomalies(anomalies.filter((_, i) => i !== index));
  const updateAnomaly = (index: number, field: keyof Anomaly, value: any) => {
    const updated = [...anomalies];
    updated[index] = { ...updated[index], [field]: value };
    setAnomalies(updated);
  };
  const moveAnomaly = (dragIndex: number, hoverIndex: number) => {
    const updated = [...anomalies];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, dragged);
    setAnomalies(updated);
  };

  // Support handlers
  const addSupport = () => {
    const ticketNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    setSupportIssues([...supportIssues, { id: crypto.randomUUID(), type: 'Other', description: '', ticketNumber: ticketNum }]);
  };
  const removeSupport = (index: number) => setSupportIssues(supportIssues.filter((_, i) => i !== index));
  const updateSupport = (index: number, field: keyof SupportIssue, value: string) => {
    const updated = [...supportIssues];
    updated[index] = { ...updated[index], [field]: value };
    setSupportIssues(updated);
  };
  const moveSupportIssue = (dragIndex: number, hoverIndex: number) => {
    const updated = [...supportIssues];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, dragged);
    setSupportIssues(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f]">
      {/* Header */}
      <header className="bg-[#2b2b2b] border-b border-[#3a3a3a] py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/reports')}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Warehouse Operations → Daily Report</h1>
              <p className="text-zinc-400 text-sm">{id ? 'Edit Report' : 'New Report'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveOnly}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Збереження...' : 'Зберегти'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              {saving ? 'Збереження...' : 'Генерувати рапорт'}
            </Button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Report Information */}
        <Card className="bg-[#2b2b2b] border-[#3a3a3a]">
          <CardHeader>
            <CardTitle className="text-white">Report Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-300">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-[#353535] border-[#454545] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-zinc-300">Warehouse / Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Warehouse A"
                  className="bg-[#353535] border-[#454545] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preparedBy" className="text-zinc-300">Prepared By *</Label>
                <Input
                  id="preparedBy"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  placeholder="Your name"
                  className="bg-[#353535] border-[#454545] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift" className="text-zinc-300">Shift *</Label>
                <Select value={shift} onValueChange={(v: 'day' | 'night' | 'day-night') => setShift(v)}>
                  <SelectTrigger className="bg-[#353535] border-[#454545] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#353535] border-[#454545]">
                    <SelectItem value="day" className="text-white">Day Shift</SelectItem>
                    <SelectItem value="night" className="text-white">Night Shift</SelectItem>
                    <SelectItem value="day-night" className="text-white">Day-Night Shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff on Shift */}
        <Card className="bg-[#2b2b2b] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Staff on Shift</CardTitle>
            <Button onClick={addStaff} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {staff.map((member, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={member.name}
                  onChange={(e) => updateStaff(index, 'name', e.target.value)}
                  placeholder="Employee name"
                  className="bg-[#353535] border-[#454545] text-white flex-1"
                />
                <Input
                  value={member.notes}
                  onChange={(e) => updateStaff(index, 'notes', e.target.value)}
                  placeholder="Notes (optional)"
                  className="bg-[#353535] border-[#454545] text-white flex-1"
                />
                {staff.length > 1 && (
                  <Button
                    onClick={() => removeStaff(index)}
                    variant="ghost"
                    size="icon"
                    className="text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Daily Work */}
        <Card className="bg-[#2b2b2b] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Daily Work</CardTitle>
            <Button onClick={addTask} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No tasks added yet</p>
            ) : (
              <DndProvider backend={HTML5Backend}>
                {tasks.map((task, index) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    moveTask={moveTask}
                    updateTask={updateTask}
                    removeTask={removeTask}
                    staff={staff}
                  />
                ))}
              </DndProvider>
            )}
          </CardContent>
        </Card>

        {/* Critical Incidents */}
        <Card className="bg-[#2b2b2b] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Critical Incidents</CardTitle>
            <Button onClick={addIncident} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Incident
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {incidents.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No incidents recorded</p>
            ) : (
              <DndProvider backend={HTML5Backend}>
                {incidents.map((incident, index) => (
                  <DraggableIncidentItem
                    key={incident.id}
                    incident={incident}
                    index={index}
                    moveIncident={moveIncident}
                    updateIncident={updateIncident}
                    removeIncident={removeIncident}
                  />
                ))}
              </DndProvider>
            )}
          </CardContent>
        </Card>

        {/* Anomalies */}
        <Card className="bg-[#2b2b2b] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Anomalies — Reminders for Next Shift</CardTitle>
            <Button onClick={addAnomaly} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Anomaly
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {anomalies.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No anomalies recorded</p>
            ) : (
              <DndProvider backend={HTML5Backend}>
                {anomalies.map((anomaly, index) => (
                  <DraggableAnomalyItem
                    key={anomaly.id}
                    anomaly={anomaly}
                    index={index}
                    moveAnomaly={moveAnomaly}
                    updateAnomaly={updateAnomaly}
                    removeAnomaly={removeAnomaly}
                  />
                ))}
              </DndProvider>
            )}
          </CardContent>
        </Card>

        {/* Support Required */}
        <Card className="bg-[#2b2b2b] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Support Required</CardTitle>
            <Button onClick={addSupport} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Issue
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportIssues.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No support issues</p>
            ) : (
              <DndProvider backend={HTML5Backend}>
                {supportIssues.map((issue, index) => (
                  <DraggableSupportIssueItem
                    key={issue.id}
                    issue={issue}
                    index={index}
                    moveSupportIssue={moveSupportIssue}
                    updateSupport={updateSupport}
                    removeSupport={removeSupport}
                  />
                ))}
              </DndProvider>
            )}
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            onClick={() => navigate('/reports')}
            variant="outline"
            className="bg-[#353535] border-[#454545] text-zinc-300 hover:bg-[#3f3f3f] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Generate Report'}
          </Button>
        </div>
      </main>
    </div>
  );
}