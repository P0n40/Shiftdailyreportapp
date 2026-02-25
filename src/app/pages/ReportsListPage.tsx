import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { reportsAPI, Report } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Calendar, MapPin, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function ReportsListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await reportsAPI.delete(reportToDelete);
      toast.success('Report deleted');
      loadReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error(error.message || 'Failed to delete report');
    } finally {
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
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
      <header className="bg-[#2b2b2b] border-b border-[#3a3a3a] py-6 px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
            <p className="text-zinc-400">Manage and view all daily warehouse reports</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {reports.length === 0 ? (
          <Card className="bg-[#2b2b2b] border-[#3a3a3a]">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 mb-4">No reports yet</p>
              <Button
                onClick={() => navigate('/reports/new')}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Create Your First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="bg-[#2b2b2b] border-[#3a3a3a] hover:border-[#505050] cursor-pointer transition-colors group"
                onClick={() => navigate(`/reports/${report.id}/preview`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Daily Report
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(report.id, e)}
                      className="text-zinc-500 hover:text-red-500 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(report.date), 'MMM dd, yyyy')}</span>
                    <span className="ml-auto px-2 py-1 bg-orange-600 text-white text-xs rounded capitalize">
                      {report.shift === 'day-night' ? 'Day-Night' : report.shift}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    <span>{report.location}</span>
                  </div>
                  <div className="text-zinc-500 text-xs pt-2 border-t border-[#3a3a3a]">
                    Prepared by {report.preparedBy}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#3a3a3a]">
                    <div className="text-center">
                      <div className="text-orange-500 font-bold">{report.tasks.length}</div>
                      <div className="text-zinc-600 text-xs">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-500 font-bold">{report.incidents.length}</div>
                      <div className="text-zinc-600 text-xs">Incidents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-500 font-bold">{report.anomalies.length}</div>
                      <div className="text-zinc-600 text-xs">Anomalies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-500 font-bold">{report.supportIssues.length}</div>
                      <div className="text-zinc-600 text-xs">Support</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reports/${report.id}/edit`);
                      }}
                      className="flex-1 bg-sky-800 border-sky-600 text-white hover:bg-sky-600 hover:text-white"
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Видалити рапорт?"
        message="Ви впевнені, що хочете видалити цей рапорт? Цю дію не можна скасувати."
        confirmText="Видалити"
        cancelText="Скасувати"
      />
    </div>
  );
}