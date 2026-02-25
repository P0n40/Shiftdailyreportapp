import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FileText, BarChart3, Plus, ClipboardList, Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/reports';
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      path: '/reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      path: '/statistics',
      label: 'Statistics',
      icon: BarChart3,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1f1f1f]' : 'bg-gray-50'} flex`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#2b2b2b] border-r border-[#3a3a3a] flex flex-col transition-transform duration-300`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-[#3a3a3a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Warehouse</h1>
                <p className="text-zinc-400 text-xs">Operations</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-orange-600 text-white'
                      : 'text-zinc-400 hover:bg-[#353535] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* New Report Button */}
          <div className="mt-6">
            <Button
              onClick={() => handleNavigate('/reports/new')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#3a3a3a] space-y-2">
          <p className="text-zinc-500 text-xs text-center pt-2">
            Warehouse Operations v1.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden bg-[#2b2b2b] border-b border-[#3a3a3a] p-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-orange-500 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}