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

  // Normalize employee names to handle different name orders
  // "HRYTSAIENKO STANISLAV" and "STANISLAV HRYTSAIENKO" become the same person
  const normalizeEmployeeName = (name: string): string => {
    // Convert to uppercase first
    let normalized = name.trim().toUpperCase();
    
    // Handle transliteration variants (Ukrainian/Russian names)
    const transliterationMap: Record<string, string> = {
      'DMYTRII': 'DMITRII',
      'DMYTRO': 'DMITRII',
      'DMYTRY': 'DMITRII',
      'OLEKSANDR': 'ALEKSANDR',
      'OLEKSANDER': 'ALEKSANDR',
      'OLEXANDR': 'ALEKSANDR',
      'MYKOLA': 'NIKOLAY',
      'MYKHAILO': 'MIKHAIL',
      'PAVLO': 'PAVEL',
      'SERHII': 'SERGEY',
      'SERHIY': 'SERGEY',
      'SERGII': 'SERGEY',
      'YEVHEN': 'EVGENIY',
      'YEVHENII': 'EVGENIY',
      'EVHEN': 'EVGENIY',
      'ANDRII': 'ANDREY',
      'ANDRIY': 'ANDREY',
      'YURII': 'YURIY',
      'YURI': 'YURIY',
      'VOLODYMYR': 'VLADIMIR',
      'VADYM': 'VADIM',
    };
    
    // Apply transliteration mapping
    Object.entries(transliterationMap).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}\\b`, 'g');
      normalized = normalized.replace(regex, to);
    });
    
    // Split name into words, sort alphabetically, and join back
    const words = normalized.split(/\s+/).filter(w => w.length > 0).sort();
    return words.join(' ');
  };

  // Staff Productivity - with name normalization
  const staffProductivity: Record<string, { normalizedName: string; originalName: string; count: number }> = {};
  
  reports.forEach((report) => {
    report.tasks.forEach((task) => {
      task.assignedEmployees?.forEach((employee) => {
        const normalized = normalizeEmployeeName(employee);
        
        if (!staffProductivity[normalized]) {
          staffProductivity[normalized] = {
            normalizedName: normalized,
            originalName: employee, // Keep first encountered version
            count: 0,
          };
        }
        
        staffProductivity[normalized].count += 1;
      });
    });
  });

  const topStaff = Object.values(staffProductivity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((staff) => ({
      name: staff.normalizedName, // Display normalized name in UPPERCASE
      tasks: staff.count,
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

  // Heat Map Calendar Data - Last 60 days
  const getHeatMapData = () => {
    const today = new Date();
    const daysToShow = 60;
    const heatMapData: any[] = [];
    
    // Create map of incidents by date
    const incidentsByDate: Record<string, number> = {};
    reports.forEach((report) => {
      const dateKey = report.date;
      incidentsByDate[dateKey] = (incidentsByDate[dateKey] || 0) + report.incidents.length;
    });

    // Find max incidents for color scaling
    const maxIncidents = Math.max(...Object.values(incidentsByDate), 1);

    // Generate last 60 days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const incidents = incidentsByDate[dateStr] || 0;
      
      heatMapData.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        incidents,
        intensity: incidents / maxIncidents, // 0-1 scale
        dayOfWeek: date.getDay(),
      });
    }

    return heatMapData;
  };

  const heatMapData = getHeatMapData();

  // Get color for heat map cell
  const getHeatMapColor = (intensity: number) => {
    if (intensity === 0) return '#18181b'; // No data - dark
    if (intensity < 0.2) return '#166534'; // Very low - dark green
    if (intensity < 0.4) return '#16a34a'; // Low - green
    if (intensity < 0.6) return '#eab308'; // Medium - yellow
    if (intensity < 0.8) return '#f97316'; // High - orange
    return '#dc2626'; // Very high - red
  };

  // Donut Chart - Task Distribution by Staff
  const staffTaskDistribution = Object.values(staffProductivity)
    .sort((a, b) => b.count - a.count)
    // Show ALL employees
    .map((staff) => ({
      name: staff.normalizedName, // Display normalized name in UPPERCASE
      value: staff.count,
    }));

  const DONUT_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#64748b'];

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

        {/* Heat Map Calendar - Incidents Activity */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Incidents Heat Map - Last 60 Days</CardTitle>
            <p className="text-sm text-zinc-400 mt-1">Visual calendar showing incident activity by day</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-grid grid-cols-[repeat(13,minmax(0,1fr))] gap-2 min-w-full">
                {/* Week labels */}
                {Array.from({ length: 13 }).map((_, weekIndex) => {
                  const weekStart = heatMapData[weekIndex * 7];
                  return weekStart ? (
                    <div key={`week-${weekIndex}`} className="text-xs text-zinc-500 text-center mb-1">
                      {new Date(weekStart.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  ) : (
                    <div key={`week-${weekIndex}`} />
                  );
                })}
                
                {/* Days grid */}
                {heatMapData.map((day) => (
                  <div
                    key={day.date}
                    className="aspect-square rounded-sm transition-all hover:ring-2 hover:ring-white/50 cursor-pointer group relative"
                    style={{
                      backgroundColor: getHeatMapColor(day.intensity),
                    }}
                    title={`${day.displayDate}: ${day.incidents} incidents`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-zinc-700">
                      <div className="font-semibold">{day.displayDate}</div>
                      <div className="text-zinc-400">{day.incidents} incidents</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 mt-6 justify-center">
                <span className="text-xs text-zinc-400">Less</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#18181b' }} />
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#166534' }} />
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#16a34a' }} />
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#eab308' }} />
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#f97316' }} />
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#dc2626' }} />
                </div>
                <span className="text-xs text-zinc-400">More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Productivity - Full Width */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
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

        {/* Tasks by Category - Full Width */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
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

        {/* Task Distribution by Staff - Donut Chart */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Task Distribution by Staff</CardTitle>
            <p className="text-sm text-zinc-400 mt-1">Workload balance across top employees</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12">
              {/* Donut Chart - Reduced size */}
              <div className="flex-shrink-0">
                <ResponsiveContainer width={320} height={320}>
                  <PieChart>
                    <Pie
                      data={staffTaskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {staffTaskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [`${value} tasks`, 'Tasks']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend - Wider with better spacing */}
              <div className="flex flex-col gap-3 flex-1 max-w-xl max-h-[500px] overflow-y-auto pr-2">
                {staffTaskDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-4 text-base p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div
                      className="w-5 h-5 rounded flex-shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                    />
                    <span className="text-zinc-200 font-medium flex-1 min-w-0">{entry.name}</span>
                    <span className="text-zinc-400 font-semibold tabular-nums">{entry.value} tasks</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Requests by Type and Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

          {/* Performance Metrics */}
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