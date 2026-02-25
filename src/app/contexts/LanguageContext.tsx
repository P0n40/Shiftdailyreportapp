import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'uk' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  uk: {
    // Navigation
    'nav.home': 'Головна',
    'nav.reports': 'Рапорти',
    'nav.statistics': 'Статистика',
    'nav.newReport': 'Новий рапорт',
    
    // Home Page
    'home.title': 'Система щоденних звітів',
    'home.subtitle': 'Професійна система управління складськими рапортами',
    'home.welcome': 'Ласкаво просимо',
    'home.description': 'Створюйте детальні щоденні звіти про роботу складу з структурованими розділами для персоналу, завдань, інцидентів та підтримки.',
    'home.getStarted': 'Почати роботу',
    'home.viewReports': 'Переглянути рапорти',
    'home.totalReports': 'Всього рапортів',
    'home.thisMonth': 'Цього місяця',
    'home.avgTasks': 'Середньо завдань',
    'home.perReport': 'на рапорт',
    'home.criticalIncidents': 'Критичні інциденти',
    'home.thisWeek': 'Цього тижня',
    
    // Reports List
    'reports.title': 'Рапорти',
    'reports.subtitle': 'Управління та перегляд всіх щоденних складських рапортів',
    'reports.noReports': 'Рапортів ще немає',
    'reports.createFirst': 'Створити перший рапорт',
    'reports.dailyReport': 'Щоденний рапорт',
    'reports.preparedBy': 'Підготував',
    'reports.tasks': 'Завдання',
    'reports.incidents': 'Інциденти',
    'reports.anomalies': 'Аномалії',
    'reports.support': 'Підтримка',
    'reports.edit': 'Редагувати',
    'reports.delete': 'Видалити',
    'reports.deleteConfirm': 'Видалити рапорт?',
    'reports.deleteMessage': 'Ви впевнені, що хочете видалити цей рапорт? Цю дію не можна скасувати.',
    'reports.cancel': 'Скасувати',
    'reports.deleted': 'Рапорт видалено',
    
    // Report Editor
    'editor.title': 'Новий рапорт',
    'editor.editTitle': 'Редагувати рапорт',
    'editor.basicInfo': 'Основна інформація',
    'editor.date': 'Дата',
    'editor.shift': 'Зміна',
    'editor.shiftDay': 'Денна',
    'editor.shiftNight': 'Нічна',
    'editor.shiftDayNight': 'День-Ніч (12 годин)',
    'editor.location': 'Локація',
    'editor.preparedBy': 'Підготував',
    'editor.staff': 'Персонал на зміні',
    'editor.staffName': 'Ім\'я',
    'editor.staffNotes': 'Примітки',
    'editor.addStaff': 'Додати працівника',
    'editor.tasks': 'Виконані завдання',
    'editor.taskCategory': 'Категорія',
    'editor.taskDescription': 'Опис завдання',
    'editor.taskAssigned': 'Призначені співробітники',
    'editor.taskAssignedPlaceholder': 'Введіть імена через кому',
    'editor.addTask': 'Додати завдання',
    'editor.incidents': 'Критичні інциденти',
    'editor.incidentDescription': 'Опис інциденту',
    'editor.incidentActions': 'Вжиті заходи',
    'editor.addIncident': 'Додати інцидент',
    'editor.anomalies': 'Аномалії та спостереження',
    'editor.anomalySeverity': 'Рівень серйозності',
    'editor.anomalyInfo': 'Інформація',
    'editor.anomalyWarning': 'Попередження',
    'editor.anomalyCritical': 'Критично',
    'editor.anomalyDescription': 'Опис аномалії',
    'editor.anomalyNextShift': 'Рекомендації для наступної зміни',
    'editor.addAnomaly': 'Додати аномалію',
    'editor.support': 'Запити зовнішньої підтримки',
    'editor.supportType': 'Тип запиту',
    'editor.supportMaintenance': 'Технічне обслуговування',
    'editor.supportIT': 'ІТ підтримка',
    'editor.supportEquipment': 'Пошкодження обладнання',
    'editor.supportSystem': 'Проблема системи',
    'editor.supportOther': 'Інше',
    'editor.supportDescription': 'Опис проблеми',
    'editor.supportTicket': 'Номер квитка',
    'editor.addSupport': 'Додати запит',
    'editor.backToReports': 'Назад до рапортів',
    'editor.save': 'Зберегти',
    'editor.saving': 'Збереження...',
    'editor.generateReport': 'Генерувати рапорт',
    'editor.saved': 'Рапорт збережено',
    
    // Statistics
    'stats.title': 'Статистика',
    'stats.subtitle': 'Аналіз продуктивності та тренди',
    'stats.overview': 'Загальний огляд',
    'stats.totalReports': 'Всього рапортів',
    'stats.totalTasks': 'Всього завдань',
    'stats.totalIncidents': 'Всього інцидентів',
    'stats.totalAnomalies': 'Всього аномалій',
    'stats.reportsOverTime': 'Рапорти за період',
    'stats.reports': 'Рапорти',
    'stats.topCategories': 'Топ категорії завдань',
    'stats.tasks': 'Завдання',
    'stats.incidentTrends': 'Тренд інцидентів',
    'stats.incidents': 'Інциденти',
    'stats.severityDistribution': 'Розподіл по серйозності',
    'stats.count': 'Кількість',
    'stats.info': 'Інформація',
    'stats.warning': 'Попередження',
    'stats.critical': 'Критично',
    'stats.staffProductivity': 'Продуктивність персоналу',
    'stats.employee': 'Співробітник',
    'stats.tasksCompleted': 'Завершених завдань',
    'stats.supportRequests': 'Запити підтримки',
    'stats.type': 'Тип',
    'stats.shiftDistribution': 'Розподіл змін',
    'stats.day': 'День',
    'stats.night': 'Ніч',
    'stats.dayNight': 'День-Ніч',
    'stats.noData': 'Немає даних для відображення',
    
    // Common
    'common.loading': 'Завантаження...',
    'common.error': 'Помилка',
    'common.success': 'Успішно',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.reports': 'Reports',
    'nav.statistics': 'Statistics',
    'nav.newReport': 'New Report',
    
    // Home Page
    'home.title': 'Daily Reports System',
    'home.subtitle': 'Professional warehouse report management system',
    'home.welcome': 'Welcome',
    'home.description': 'Create detailed daily reports of warehouse operations with structured sections for staff, tasks, incidents, and support.',
    'home.getStarted': 'Get Started',
    'home.viewReports': 'View Reports',
    'home.totalReports': 'Total Reports',
    'home.thisMonth': 'This Month',
    'home.avgTasks': 'Avg Tasks',
    'home.perReport': 'per Report',
    'home.criticalIncidents': 'Critical Incidents',
    'home.thisWeek': 'This Week',
    
    // Reports List
    'reports.title': 'Reports',
    'reports.subtitle': 'Manage and view all daily warehouse reports',
    'reports.noReports': 'No reports yet',
    'reports.createFirst': 'Create Your First Report',
    'reports.dailyReport': 'Daily Report',
    'reports.preparedBy': 'Prepared by',
    'reports.tasks': 'Tasks',
    'reports.incidents': 'Incidents',
    'reports.anomalies': 'Anomalies',
    'reports.support': 'Support',
    'reports.edit': 'Edit',
    'reports.delete': 'Delete',
    'reports.deleteConfirm': 'Delete report?',
    'reports.deleteMessage': 'Are you sure you want to delete this report? This action cannot be undone.',
    'reports.cancel': 'Cancel',
    'reports.deleted': 'Report deleted',
    
    // Report Editor
    'editor.title': 'New Report',
    'editor.editTitle': 'Edit Report',
    'editor.basicInfo': 'Basic Information',
    'editor.date': 'Date',
    'editor.shift': 'Shift',
    'editor.shiftDay': 'Day',
    'editor.shiftNight': 'Night',
    'editor.shiftDayNight': 'Day-Night (12 hours)',
    'editor.location': 'Location',
    'editor.preparedBy': 'Prepared By',
    'editor.staff': 'Staff on Shift',
    'editor.staffName': 'Name',
    'editor.staffNotes': 'Notes',
    'editor.addStaff': 'Add Staff Member',
    'editor.tasks': 'Completed Tasks',
    'editor.taskCategory': 'Category',
    'editor.taskDescription': 'Task Description',
    'editor.taskAssigned': 'Assigned Employees',
    'editor.taskAssignedPlaceholder': 'Enter names separated by commas',
    'editor.addTask': 'Add Task',
    'editor.incidents': 'Critical Incidents',
    'editor.incidentDescription': 'Incident Description',
    'editor.incidentActions': 'Actions Taken',
    'editor.addIncident': 'Add Incident',
    'editor.anomalies': 'Anomalies and Observations',
    'editor.anomalySeverity': 'Severity Level',
    'editor.anomalyInfo': 'Info',
    'editor.anomalyWarning': 'Warning',
    'editor.anomalyCritical': 'Critical',
    'editor.anomalyDescription': 'Anomaly Description',
    'editor.anomalyNextShift': 'Recommendations for Next Shift',
    'editor.addAnomaly': 'Add Anomaly',
    'editor.support': 'External Support Requests',
    'editor.supportType': 'Request Type',
    'editor.supportMaintenance': 'Maintenance',
    'editor.supportIT': 'IT Support',
    'editor.supportEquipment': 'Equipment Damage',
    'editor.supportSystem': 'System Issue',
    'editor.supportOther': 'Other',
    'editor.supportDescription': 'Problem Description',
    'editor.supportTicket': 'Ticket Number',
    'editor.addSupport': 'Add Request',
    'editor.backToReports': 'Back to Reports',
    'editor.save': 'Save',
    'editor.saving': 'Saving...',
    'editor.generateReport': 'Generate Report',
    'editor.saved': 'Report saved',
    
    // Statistics
    'stats.title': 'Statistics',
    'stats.subtitle': 'Performance analysis and trends',
    'stats.overview': 'Overview',
    'stats.totalReports': 'Total Reports',
    'stats.totalTasks': 'Total Tasks',
    'stats.totalIncidents': 'Total Incidents',
    'stats.totalAnomalies': 'Total Anomalies',
    'stats.reportsOverTime': 'Reports Over Time',
    'stats.reports': 'Reports',
    'stats.topCategories': 'Top Task Categories',
    'stats.tasks': 'Tasks',
    'stats.incidentTrends': 'Incident Trends',
    'stats.incidents': 'Incidents',
    'stats.severityDistribution': 'Severity Distribution',
    'stats.count': 'Count',
    'stats.info': 'Info',
    'stats.warning': 'Warning',
    'stats.critical': 'Critical',
    'stats.staffProductivity': 'Staff Productivity',
    'stats.employee': 'Employee',
    'stats.tasksCompleted': 'Tasks Completed',
    'stats.supportRequests': 'Support Requests',
    'stats.type': 'Type',
    'stats.shiftDistribution': 'Shift Distribution',
    'stats.day': 'Day',
    'stats.night': 'Night',
    'stats.dayNight': 'Day-Night',
    'stats.noData': 'No data to display',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'uk';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'uk' ? 'en' : 'uk');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.uk] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
