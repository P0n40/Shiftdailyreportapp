# Warehouse Operations - Daily Report System

A comprehensive full-stack web application for creating, managing, and exporting 12-hour shift daily reports for warehouse operations.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📸 Features

### Dark Theme Report Editor
- Professional dark UI with orange accents
- Structured form with multiple sections
- Dynamic add/remove for all list items
- Real-time validation
- Auto-save to database

### Clean Preview & PDF Export
- Light "paper" layout optimized for print
- Client-side PDF generation
- Proper page breaks and formatting
- Professional typography
- Auto-generated filenames

### Full Authentication
- Email/password signup and login
- Session management with Supabase Auth
- Protected routes
- User context throughout app

### Complete CRUD Operations
- Create new reports
- View all reports
- Edit existing reports
- Delete reports
- Example data seeding

## 🚀 Quick Start

### For Users
See [QUICK_START.md](QUICK_START.md) for a 3-minute getting started guide.

### For Developers
See [INSTRUCTIONS.md](INSTRUCTIONS.md) for complete documentation.

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/              # Radix UI components
│   │   │   └── SeedDataButton.tsx
│   │   ├── lib/
│   │   │   ├── api.ts           # API client & types
│   │   │   └── auth-context.tsx # Auth provider
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ReportsListPage.tsx
│   │   │   ├── ReportEditorPage.tsx
│   │   │   └── ReportPreviewPage.tsx
│   │   ├── App.tsx              # Main app component
│   │   └── routes.ts            # Route configuration
│   └── styles/
│       ├── index.css            # Global + print styles
│       ├── theme.css            # Design tokens
│       └── tailwind.css         # Tailwind imports
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx        # API routes
│           └── kv_store.tsx     # Database utilities
├── INSTRUCTIONS.md              # Full documentation
├── QUICK_START.md               # Getting started guide
└── README.md                    # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router 7** - Client-side routing
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible components
- **date-fns** - Date formatting
- **html2pdf.js** - PDF generation
- **Sonner** - Toast notifications

### Backend
- **Supabase Edge Functions** - Serverless API
- **Hono** - Web framework
- **Supabase Auth** - Authentication
- **Supabase KV Store** - Database

### Development
- **Vite** - Build tool
- **ESLint** - Code quality

## 📋 Report Sections

Each daily report includes:

1. **Report Information** (required)
   - Date, Location, Prepared By, Shift

2. **Staff on Shift** (optional)
   - Employee names and notes

3. **Daily Work** (optional)
   - Tasks with categories and descriptions

4. **Critical Incidents** (optional)
   - Incident descriptions and actions taken

5. **Anomalies - Reminders for Next Shift** (optional)
   - Severity-graded issues with next actions

6. **Support Required** (optional)
   - Equipment/system issues with ticket numbers

## 🔐 Security

### Current Implementation
- Email/password authentication via Supabase Auth
- Protected API routes
- Session-based access control
- Environment-based configuration

### Production Considerations
⚠️ This application is designed for prototyping and development.

For production use with real warehouse data, implement:
- Role-based access control (RBAC)
- Additional encryption
- Regular security audits
- Data backup procedures
- Compliance with regulations (GDPR, etc.)
- SSL/TLS certificates
- Rate limiting
- Input sanitization

## 📊 Data Model

```typescript
interface Report {
  id: string;
  date: string;
  location: string;
  preparedBy: string;
  shift: 'day' | 'night';
  staff: StaffMember[];
  tasks: Task[];
  incidents: Incident[];
  anomalies: Anomaly[];
  supportIssues: SupportIssue[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

See [api.ts](src/app/lib/api.ts) for complete type definitions.

## 🎨 Design System

### Colors
- **Background**: Zinc-950 (dark)
- **Cards**: Zinc-900
- **Borders**: Zinc-800/700
- **Text**: White/Zinc-300/400
- **Primary**: Orange-600 (CTAs)
- **Destructive**: Red-500

### Typography
- **Headings**: Bold, White
- **Body**: Zinc-300
- **Labels**: Zinc-400
- **Print**: Black on White

## 🔄 Workflow

1. **User signs up/in** → Auth with Supabase
2. **Create report** → Fill dark theme form
3. **Save report** → POST to API → Store in DB
4. **View preview** → Light "paper" layout
5. **Export PDF** → Client-side html2pdf.js
6. **Edit report** → Load from DB → Update form
7. **List reports** → Fetch all → Display cards

## 📦 Dependencies

### Core
- `react` + `react-dom` - UI framework
- `react-router` - Routing
- `@supabase/supabase-js` - Backend client

### UI & Styling
- `tailwindcss` - CSS framework
- `@radix-ui/*` - Accessible components
- `lucide-react` - Icons
- `sonner` - Toasts

### Utilities
- `date-fns` - Date formatting
- `html2pdf.js` - PDF export
- `clsx` + `tailwind-merge` - Class merging

## 🐛 Troubleshooting

### Common Issues

**"Unauthorized" errors**
- Sign out and sign in again
- Check browser console for details
- Verify Supabase connection

**PDF not generating**
- Check browser console
- Try different browser (Chrome recommended)
- Disable interfering browser extensions

**Reports not loading**
- Refresh the page
- Check internet connection
- Verify authentication status

See [INSTRUCTIONS.md](INSTRUCTIONS.md) for more troubleshooting tips.

## 🚧 Future Enhancements

- [ ] Search and filter reports
- [ ] Duplicate report as template
- [ ] Export multiple reports to ZIP
- [ ] Email reports directly
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Report templates
- [ ] Analytics dashboard
- [ ] Manager/Technician role system
- [ ] Audit trail
- [ ] Bulk operations
- [ ] Custom fields per location
- [ ] Photo attachments
- [ ] Digital signatures
- [ ] Automatic shift detection

## 📄 License

MIT License - feel free to use for your warehouse operations!

## 🤝 Contributing

This is a prototype application. For production use, please:
1. Conduct security review
2. Add comprehensive tests
3. Implement proper RBAC
4. Add data backup/restore
5. Set up monitoring and logging

## 📞 Support

- **Documentation**: See INSTRUCTIONS.md
- **Quick Start**: See QUICK_START.md
- **Issues**: Check browser console for errors
- **API**: Check Supabase logs

---

Built with ❤️ for warehouse operations teams everywhere.

**Version**: 1.0.0  
**Last Updated**: February 2026
