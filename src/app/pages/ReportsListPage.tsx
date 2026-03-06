import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { reportsAPI, Report } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Calendar, MapPin, Trash2, Eye, Sun, Moon, Sunrise, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EditPasswordDialog } from '../components/EditPasswordDialog';

export default function ReportsListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<string | null>(null);
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

  const handleEdit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportToEdit(id);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!reportToEdit) return;

    setEditDialogOpen(false);
    navigate(`/reports/${reportToEdit}/edit`);
    setReportToEdit(null);
  };

  // Group reports by date
  const groupedReports = reports.reduce((acc, report) => {
    const dateKey = format(new Date(report.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedReports).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Sort reports within each date: day -> night -> day-night
  const getShiftOrder = (shift: string) => {
    if (shift === 'day') return 0;
    if (shift === 'night') return 1;
    if (shift === 'day-night') return 2;
    return 3;
  };

  Object.keys(groupedReports).forEach(dateKey => {
    groupedReports[dateKey].sort((a, b) => getShiftOrder(a.shift) - getShiftOrder(b.shift));
  });

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
      <main className="p-8 max-w-[1600px] mx-auto">
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
          <div className="space-y-6">
            {sortedDates.map(dateKey => (
              <Card key={dateKey} className="bg-[#2b2b2b] border-[#3a3a3a]">
                <CardHeader className="border-b border-[#3a3a3a]">
                  <div className="flex items-center gap-3 mx-[0px] my-[-12px]">
                    <Calendar className="w-6 h-6 text-orange-500" />
                    <CardTitle className="text-2xl text-white">
                      {format(new Date(dateKey), 'dd MMMM yyyy')}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-[24px] pt-[0px] pb-[24px]">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 auto-rows-fr">
                    {groupedReports[dateKey].map((report) => (
                      <Card
                        key={report.id}
                        className="bg-[#1f1f1f] border-[#3a3a3a] hover:border-orange-500/50 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-orange-500/10"
                        onClick={() => navigate(`/reports/${report.id}/preview`)}
                      >
                        <CardHeader className="border-b border-[#3a3a3a] pr-[16px] mx-[0px] mt-[0px] mb-[-22px] px-[16px] pt-[3px] pb-[12px]">
                          <div className="flex items-start justify-between px-[0px] pt-[14px] pb-[0px]">
                            <div className="flex-1 rounded-[9px]">
                              <div className="flex items-center gap-2 lg:gap-3 mx-[0px] mt-[3px] mb-[-12px] pl-[7px] pr-[0px] pt-[1px] pb-[0px]">
                                <div className={`rounded-lg p-1.5 lg:p-2.5 ${ 
                                  report.shift === 'day' ? 'bg-amber-500/20' : 
                                  report.shift === 'night' ? 'bg-indigo-600/20' : 
                                  'bg-gradient-to-r from-amber-500/20 to-indigo-600/20' 
                                }`}>
                                  {report.shift === 'day' && <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-amber-500" />}
                                  {report.shift === 'night' && <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />}
                                  {report.shift === 'day-night' && <Sunrise className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-white capitalize text-base lg:text-lg leading-tight">
                                      {report.shift === 'day-night' ? 'Day-Night' : report.shift} Shift
                                    </CardTitle>
                                    <div className="h-4 w-px bg-zinc-600 ml-[8px] mr-[4px] my-[0px]"></div>
                                    <div className="flex items-center gap-1.5">
                                      <User className="w-4 h-4 text-orange-500/70 flex-shrink-0" />
                                      <span className="text-zinc-400 truncate p-[0px] mx-[0px] mt-[-3px] mb-[0px] text-[13px]">{report.preparedBy}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-0.5 truncate mx-[0px] mt-[2px] mb-[0px]">{report.location}</p>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(report.id, e)}
                              className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 lg:-mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 px-[10px] py-[0px] ml-[0px] mr-[-4px] mt-[-8px] mb-[0px]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 px-[24px] py-[19px]">
                          {/* Stats */}
                          <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
                            <div className="bg-[#2b2b2b] rounded-lg p-1.5 lg:p-2 text-center border border-[#3a3a3a]">
                              <div className="text-orange-500 font-bold text-base lg:text-lg">{report.tasks.length}</div>
                              <div className="text-zinc-500 text-[10px] lg:text-xs">Tasks</div>
                            </div>
                            <div className="bg-[#2b2b2b] rounded-lg p-1.5 lg:p-2 text-center border border-[#3a3a3a]">
                              <div className="text-red-500 font-bold text-base lg:text-lg">{report.incidents.length}</div>
                              <div className="text-zinc-500 text-[10px] lg:text-xs">Incidents</div>
                            </div>
                            <div className="bg-[#2b2b2b] rounded-lg p-1.5 lg:p-2 text-center border border-[#3a3a3a]">
                              <div className="text-yellow-500 font-bold text-base lg:text-lg">{report.anomalies.length}</div>
                              <div className="text-zinc-500 text-[10px] lg:text-xs">Anomalies</div>
                            </div>
                            <div className="bg-[#2b2b2b] rounded-lg p-1.5 lg:p-2 text-center border border-[#3a3a3a]">
                              <div className="text-blue-500 font-bold text-base lg:text-lg">{report.supportIssues.length}</div>
                              <div className="text-zinc-500 text-[10px] lg:text-xs">Support</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleEdit(report.id, e)}
                              className="flex-1 bg-transparent border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors text-xs lg:text-sm"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/reports/${report.id}/preview`);
                              }}
                              className="flex-1 bg-transparent border-sky-500/50 text-sky-500 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors text-xs lg:text-sm"
                            >
                              <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
        requirePassword={true}
        correctPassword="PASSAT123@"
      />

      {/* Edit Password Dialog */}
      <EditPasswordDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onConfirm={confirmEdit}
      />
    </div>
  );
}