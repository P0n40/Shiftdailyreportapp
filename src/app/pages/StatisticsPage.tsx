import React, { useEffect, useState } from 'react';
import { reportsAPI, Report } from '../lib/api';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Users, AlertTriangle, Wrench, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function StatisticsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsAPI.getAll();
      setReports(data);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error(error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading statistics...</div>
      </div>
    );
  }

  // Calculate statistics
  const totalReports = reports.length;
  const totalTasks = reports.reduce((sum, report) => sum + report.tasks.length, 0);
  const totalStaff = reports.reduce((sum, report) => sum + report.staff.length, 0);
  const totalIncidents = reports.reduce((sum, report) => sum + report.incidents.length, 0);
  const totalAnomalies = reports.reduce((sum, report) => sum + report.anomalies.length, 0);
  const totalSupportIssues = reports.reduce((sum, report) => sum + report.supportIssues.length, 0);

  // Average tasks per report
  const avgTasksPerReport = totalReports > 0 ? (totalTasks / totalReports).toFixed(1) : 0;

  // Reports by shift type
  const shiftData = [
    {
      name: 'Day Shift',
      count: reports.filter((r) => r.shift === 'day').length,
    },
    {
      name: 'Night Shift',
      count: reports.filter((r) => r.shift === 'night').length,
    },
    {
      name: 'Day-Night',
      count: reports.filter((r) => r.shift === 'day-night').length,
    },
  ];

  // Tasks by category
  const tasksByCategory: Record<string, number> = {};
  reports.forEach((report) => {
    report.tasks.forEach((task) => {
      tasksByCategory[task.category] = (tasksByCategory[task.category] || 0) + 1;
    });
  });

  const categoryData = Object.entries(tasksByCategory).map(([name, count]) => ({
    name,
    count,
  }));

  // Anomalies by severity
  const anomaliesBySeverity: Record<string, number> = {
    critical: 0,
    warning: 0,
    info: 0,
    note: 0,
  };
  reports.forEach((report) => {
    report.anomalies.forEach((anomaly) => {
      anomaliesBySeverity[anomaly.severity] = (anomaliesBySeverity[anomaly.severity] || 0) + 1;
    });
  });

  const severityData = Object.entries(anomaliesBySeverity).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Reports timeline (last 30 days)
  const timelineData = reports
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)
    .map((report) => ({
      date: new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      incidents: report.incidents.length,
      anomalies: report.anomalies.length,
    }));

  // Staff Productivity - Top 10 employees by task count
  const staffProductivity: Record<string, number> = {};
  reports.forEach((report) => {
    report.tasks.forEach((task) => {
      task.assignedEmployees?.forEach((employee) => {
        staffProductivity[employee] = (staffProductivity[employee] || 0) + 1;
      });
    });
  });

  const topStaff = Object.entries(staffProductivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      tasks: count,
    }));

  // Support requests by type
  const supportByType: Record<string, number> = {};
  reports.forEach((report) => {
    report.supportIssues.forEach((issue) => {
      supportByType[issue.type] = (supportByType[issue.type] || 0) + 1;
    });
  });

  const supportTypeData = Object.entries(supportByType).map(([name, count]) => ({
    name,
    count,
  }));

  // Reports over time with trend (last 60 days)
  const reportsOverTime = reports
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-60)
    .reduce((acc: any[], report) => {
      const date = new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.reports += 1;
        existing.tasks += report.tasks.length;
      } else {
        acc.push({
          date,
          reports: 1,
          tasks: report.tasks.length,
        });
      }
      return acc;
    }, []);

  const COLORS = ['#ea580c', '#fb923c', '#fdba74', '#fed7aa', '#3b82f6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-6 px-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Statistics Dashboard</h1>
          <p className="text-zinc-400">Overview of warehouse operations and reports</p>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalReports}</div>
              <p className="text-xs text-zinc-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalStaff}</div>
              <p className="text-xs text-zinc-500 mt-1">Total recorded</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{totalIncidents}</div>
              <p className="text-xs text-zinc-500 mt-1">Critical events</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{totalAnomalies}</div>
              <p className="text-xs text-zinc-500 mt-1">Total logged</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Support Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{totalSupportIssues}</div>
              <p className="text-xs text-zinc-500 mt-1">Requests made</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Reports by Shift Type */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Reports by Shift Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shiftData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#ea580c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tasks by Category */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Tasks by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#a1a1aa" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#fb923c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Anomalies by Severity */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Anomalies by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Incidents & Anomalies Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="anomalies" stroke="#eab308" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Staff Productivity */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Top 10 Staff Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topStaff}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Support Requests by Type */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Support Requests by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supportTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports Over Time */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Reports Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="reports" stroke="#ea580c" strokeWidth={2} />
                  <Line type="monotone" dataKey="tasks" stroke="#fb923c" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Tasks Per Report Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-600/20 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Avg Tasks per Report</p>
                    <p className="text-2xl font-bold text-white">{avgTasksPerReport}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Tasks Completed</p>
                    <p className="text-2xl font-bold text-white">{totalTasks}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Active Staff</p>
                    <p className="text-2xl font-bold text-white">{Object.keys(staffProductivity).length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}