import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a2a12986`;

// Report type
export interface StaffMember {
  name: string;
  notes: string;
}

export interface Task {
  id: string;
  category: string;
  description: string;
  assignedEmployees: string[];
}

export interface Incident {
  id: string;
  description: string;
  actionsTaken: string;
}

export interface Anomaly {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  nextShiftAction: string;
}

export interface SupportIssue {
  id: string;
  type: string;
  description: string;
  ticketNumber: string;
}

export interface Report {
  id: string;
  date: string;
  location: string;
  preparedBy: string;
  shift: 'day' | 'night' | 'day-night';
  shiftStartTime?: string;
  shiftEndTime?: string;
  staff: StaffMember[];
  tasks: Task[];
  incidents: Incident[];
  anomalies: Anomaly[];
  supportIssues: SupportIssue[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Reports API
export const reportsAPI = {
  async getAll(): Promise<Report[]> {
    const response = await fetch(`${API_URL}/reports`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching reports:', error);
      throw new Error(error.error || 'Failed to fetch reports');
    }
    
    const data = await response.json();
    return data.reports;
  },

  async getById(id: string): Promise<Report> {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching report:', error);
      throw new Error(error.error || 'Failed to fetch report');
    }
    
    const data = await response.json();
    return data.report;
  },

  async create(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Report> {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(report),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating report:', error);
      throw new Error(error.error || 'Failed to create report');
    }
    
    const data = await response.json();
    return data.report;
  },

  async update(id: string, report: Partial<Report>): Promise<Report> {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(report),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating report:', error);
      throw new Error(error.error || 'Failed to update report');
    }
    
    const data = await response.json();
    return data.report;
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error deleting report:', error);
      throw new Error(error.error || 'Failed to delete report');
    }
  },
};