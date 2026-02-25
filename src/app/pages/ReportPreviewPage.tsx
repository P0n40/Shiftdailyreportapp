import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { reportsAPI, Report } from '../lib/api';
import { Button } from '../components/ui/button';
import { ArrowLeft, Edit, Printer, Users, ClipboardList, AlertCircle, AlertTriangle, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ReportPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportsAPI.getById(id!);
      setReport(data);
    } catch (error: any) {
      console.error('Error loading report:', error);
      toast.error(error.message || 'Failed to load report');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!contentRef.current || !report) return;
    
    // Use browser's native print dialog with proper formatting
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-zinc-900">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-zinc-900">Report not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 py-4 px-6 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/reports')}
              variant="ghost"
              size="sm"
              className="text-zinc-600 hover:text-zinc-900 px-[10px] py-[0px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Report Preview</h1>
              <p className="text-zinc-500 text-sm">{format(new Date(report.date), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/reports/${id}/edit`)}
              variant="outline"
              className="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <main className="max-w-5xl mx-auto p-6 print:p-0">
        <div
          ref={contentRef}
          className="bg-white min-h-[11in] p-8 shadow-lg print:shadow-none print:p-6"
        >
          {/* Report Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-zinc-900">
            <h1 className="text-zinc-900 m-[0px] px-[1px] py-[4px] font-bold text-[40px]">DAILY REPORT</h1>
            <p className="text-xs text-zinc-600">Warehouse Operations</p>
          </div>

          {/* Report Info */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
            <div>
              <span className="font-semibold text-zinc-700">Date:</span>{' '}
              <span className="text-zinc-900">{format(new Date(report.date), 'MMMM dd, yyyy')}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-700">Shift:</span>{' '}
              <span className="text-zinc-900 capitalize">
                {report.shift === 'day-night' ? 'Day-Night Shift' : report.shift === 'day' ? 'Day Shift' : 'Night Shift'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-zinc-700">Location:</span>{' '}
              <span className="text-zinc-900">{report.location}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-700">Prepared by:</span>{' '}
              <span className="text-zinc-900">{report.preparedBy}</span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-zinc-700">Generated at:</span>{' '}
              <span className="text-zinc-900">{format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>

          {/* Staff on Shift */}
          {report.staff.length > 0 && (
            <div className="mb-5 page-break-inside-avoid">
              <div className="flex items-center gap-3 bg-orange-50 border-l-4 border-orange-500 px-3 py-2 mb-3 rounded">
                <Users className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-orange-600">
                  Staff on Shift
                </h2>
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="text-left p-1.5 border border-zinc-300 font-semibold text-zinc-700 text-xs">
                      Employee Name
                    </th>
                    <th className="text-left p-1.5 border border-zinc-300 font-semibold text-zinc-700 text-xs">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.staff.map((member, index) => (
                    <tr key={index}>
                      <td className="p-1.5 border border-zinc-300 text-zinc-900 text-xs">{member.name}</td>
                      <td className="p-1.5 border border-zinc-300 text-zinc-600 text-xs">{member.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Daily Work */}
          {report.tasks.length > 0 && (
            <div className="mb-5 page-break-inside-avoid">
              <div className="flex items-center gap-3 bg-orange-50 border-l-4 border-orange-500 px-3 py-2 mb-3 rounded">
                <ClipboardList className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-orange-600">
                  Daily Work
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {report.tasks.map((task, index) => (
                  <div key={task.id} className="border border-zinc-300 rounded p-2 bg-zinc-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-900 text-xs font-semibold rounded">
                        {task.category}
                      </span>
                      <span className="text-xs text-zinc-500">Task #{index + 1}</span>
                    </div>
                    <p className="text-xs text-zinc-900 whitespace-pre-wrap mb-1">{task.description}</p>
                    {task.assignedEmployees && task.assignedEmployees.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-zinc-200">
                        <p className="text-xs font-semibold text-zinc-700 mb-0.5">Assigned Staff:</p>
                        <div className="flex flex-wrap gap-1">
                          {task.assignedEmployees.map((employeeName) => (
                            <span
                              key={employeeName}
                              className="inline-block px-1.5 py-0.5 bg-sky-600 text-white text-xs rounded"
                            >
                              {employeeName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Incidents */}
          {report.incidents.length > 0 && (
            <div className="mb-5 page-break-inside-avoid">
              <div className="flex items-center gap-3 bg-orange-50 border-l-4 border-orange-500 px-3 py-2 mb-3 rounded">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-orange-600">
                  Critical Incidents
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {report.incidents.map((incident, index) => (
                  <div key={incident.id} className="border border-red-300 rounded p-2 bg-red-50">
                    <h3 className="font-semibold text-red-900 mb-1 text-xs">Incident #{index + 1}</h3>
                    <div className="mb-1">
                      <p className="text-xs font-semibold text-zinc-700 mb-0.5">Description:</p>
                      <p className="text-xs text-zinc-900 whitespace-pre-wrap">{incident.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 mb-0.5">Actions Taken:</p>
                      <p className="text-xs text-zinc-900 whitespace-pre-wrap">{incident.actionsTaken}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomalies */}
          {report.anomalies.length > 0 && (
            <div className="mb-5 page-break-inside-avoid">
              <div className="flex items-center gap-3 bg-orange-50 border-l-4 border-orange-500 px-3 py-2 mb-3 rounded">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-orange-600">
                  Anomalies — Reminders for Next Shift
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {report.anomalies.map((anomaly, index) => (
                  <div key={anomaly.id} className="border border-zinc-300 rounded p-2 bg-yellow-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase ${
                        anomaly.severity === 'critical' ? 'text-red-600' :
                        anomaly.severity === 'warning' ? 'text-orange-600' :
                        anomaly.severity === 'info' ? 'text-blue-600' : 'text-zinc-600'
                      }`}>
                        {anomaly.severity}
                      </span>
                      <span className="text-xs text-zinc-500">Anomaly #{index + 1}</span>
                    </div>
                    <div className="mb-1">
                      <p className="text-xs font-semibold text-zinc-700 mb-0.5">Description:</p>
                      <p className="text-xs text-zinc-900 whitespace-pre-wrap">{anomaly.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 mb-0.5">Next Shift Action:</p>
                      <p className="text-xs text-zinc-900 whitespace-pre-wrap">{anomaly.nextShiftAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Required */}
          {report.supportIssues.length > 0 && (
            <div className="mb-5 page-break-inside-avoid">
              <div className="flex items-center gap-3 bg-orange-50 border-l-4 border-orange-500 px-3 py-2 mb-3 rounded">
                <Wrench className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-orange-600">
                  Support Required
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {report.supportIssues.map((issue, index) => (
                  <div key={issue.id} className="border border-zinc-300 rounded p-2 bg-blue-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-900 text-xs font-semibold rounded">
                        {issue.type}
                      </span>
                      <span className="text-xs font-mono text-zinc-600">{issue.ticketNumber}</span>
                    </div>
                    <p className="text-xs text-zinc-900 whitespace-pre-wrap">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-zinc-300 text-xs text-zinc-500 text-center">
            <p>Generated by Warehouse Operations Management System</p>
            <p>Report ID: {report.id}</p>
          </div>
        </div>
      </main>
    </div>
  );
}