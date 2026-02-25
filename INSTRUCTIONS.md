# Warehouse Operations - Daily Report System

A full-stack web application for creating, managing, and exporting shift daily reports for warehouse operations.

## Features

### Core Functionality
- ✅ **12-Hour Shift Reports** - Create comprehensive daily reports for Day/Night shifts
- ✅ **Dark Theme Editor** - Professional dark UI with orange accents for comfortable data entry
- ✅ **Clean Preview** - Light, printable "paper" layout optimized for readability
- ✅ **PDF Export** - Client-side PDF generation with proper formatting and page breaks
- ✅ **Edit ↔ Preview** - Seamlessly switch between editing and preview without losing data
- ✅ **Authentication** - Secure login system with email/password
- ✅ **Database Storage** - All reports persisted to Supabase backend
- ✅ **CRUD Operations** - Create, Read, Update, Delete reports

### Report Sections
1. **Report Information**
   - Date (defaults to today)
   - Warehouse/Location
   - Prepared by
   - Shift (Day/Night)

2. **Staff on Shift**
   - Employee names
   - Notes for each staff member
   - Dynamic add/remove

3. **Daily Work**
   - Multiple tasks with categories (Picking, Packing, Sorting, Loading, Unloading, Inventory, Inspection, Maintenance, Cleaning, Other)
   - Task descriptions
   - Assigned employees

4. **Critical Incidents**
   - Incident descriptions
   - Actions taken/mitigation steps

5. **Anomalies - Reminders for Next Shift**
   - Severity levels (Info, Warning, Critical)
   - Issue descriptions
   - Action items for next shift

6. **Support Required**
   - Issue type (Equipment damage, System issue, Operational issue, Other)
   - Problem descriptions
   - Auto-generated ticket numbers (TKT-####)

## Getting Started

### 1. Sign Up / Sign In
- On first visit, click "Don't have an account? Sign up"
- Enter your name, email, and password
- After signup, you'll be automatically signed in

### 2. Create Your First Report
**Option A: Use Example Data**
- Click "Add Example Report" button to create a sample report with realistic data
- Great for testing and understanding the system

**Option B: Create From Scratch**
- Click "New Report" button
- Fill in the required fields (Date, Location, Prepared By, Shift)
- Add staff members, tasks, incidents, anomalies, and support issues as needed
- Click "Generate Report" to save

### 3. Edit Reports
- From the reports list, click "Edit" on any report
- Make your changes
- Click "Generate Report" to save updates

### 4. Preview & Export PDF
- Click "View" or the report card to open preview
- Review the clean, formatted report
- Click "Save as PDF" to download
- PDF filename format: `Daily_Report_YYYY-MM-DD_Location_Shift.pdf`

### 5. Manage Reports
- View all reports in chronological order
- Delete unwanted reports with the trash icon
- Search and filter (coming soon)

## Usage Tips

### Best Practices
- **Required Fields**: Date, Location, Prepared By, and Shift must be filled
- **Empty Items**: Empty staff, tasks, or incidents are automatically filtered out when saving
- **Staff Names**: While optional, adding staff names is recommended for complete records
- **Ticket Numbers**: Auto-generated for support issues but can be customized

### Keyboard Shortcuts
- **Enter** in text fields: Moves to next field
- **Tab**: Navigate between form fields
- **Ctrl/Cmd + S**: Quick save (not yet implemented)

### Data Validation
- Staff names are optional but recommended
- Task descriptions must not be empty
- Incident descriptions must not be empty
- Support issue descriptions must not be empty
- Ticket numbers are optional but pre-filled

## Technical Details

### Tech Stack
- **Frontend**: React + TypeScript + React Router
- **UI**: Tailwind CSS v4 + Radix UI components
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase KV Store
- **Auth**: Supabase Auth
- **PDF Export**: html2pdf.js
- **Date Handling**: date-fns

### Data Model
Reports are stored with the following structure:
```typescript
{
  id: string;
  date: string;
  location: string;
  preparedBy: string;
  shift: 'day' | 'night';
  staff: Array<{ name: string; notes: string }>;
  tasks: Array<{ id, category, description, assignedEmployees }>;
  incidents: Array<{ id, description, actionsTaken }>;
  anomalies: Array<{ id, severity, description, nextShiftAction }>;
  supportIssues: Array<{ id, type, description, ticketNumber }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### API Endpoints
- `POST /auth/signup` - Create new user account
- `GET /reports` - Get all reports
- `GET /reports/:id` - Get single report
- `POST /reports` - Create new report
- `PUT /reports/:id` - Update existing report
- `DELETE /reports/:id` - Delete report

## PDF Export Details

The PDF export feature uses html2pdf.js to generate client-side PDFs with:
- A4 page size
- 0.5-inch margins
- Proper page breaks (no orphaned section titles)
- Color-accurate rendering
- Professional formatting matching the preview

### Print Stylesheet
A custom print stylesheet ensures:
- Clean white background
- Proper pagination
- No web UI elements (buttons, navigation)
- Optimized typography for print

## Security Notes

⚠️ **Important**: This application is intended for prototyping and development purposes.

For production use with real warehouse data:
- Implement additional security measures
- Use proper role-based access control (RBAC)
- Enable SSL/TLS for all communications
- Regular security audits
- Compliance with data protection regulations

## Troubleshooting

### "Unauthorized" Errors
- Make sure you're signed in
- Try signing out and back in
- Check browser console for detailed errors

### PDF Not Generating
- Check browser console for errors
- Ensure report content is loaded
- Try a different browser (Chrome recommended)
- Disable browser extensions that might interfere

### Data Not Saving
- Check internet connection
- Verify all required fields are filled
- Check browser console for API errors
- Ensure Supabase backend is connected

### Reports Not Loading
- Refresh the page
- Check browser console
- Verify authentication status
- Try signing out and back in

## Future Enhancements

Potential features for future versions:
- [ ] Search and filter reports
- [ ] Duplicate report as template
- [ ] Export multiple reports
- [ ] Email reports directly
- [ ] Real-time collaboration
- [ ] Mobile app version
- [ ] Report templates
- [ ] Analytics dashboard
- [ ] Role-based permissions (Technician vs Manager)
- [ ] Audit trail
- [ ] Bulk operations
- [ ] Custom fields

## Support

For issues or questions:
1. Check this documentation
2. Review browser console errors
3. Check Supabase connection status
4. Verify all environment variables are set

## Version

Current Version: 1.0.0
Last Updated: February 2026
