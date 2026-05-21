import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Settings,
  X,
  Grid3x3,
  BookOpen } from
'lucide-react';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const links = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    to: '/applications',
    icon: FileText,
    label: 'Applications'
  },
  {
    to: '/kanban',
    icon: Grid3x3,
    label: 'Kanban Board'
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Settings'
  },
  {
    to: '/docs',
    icon: BookOpen,
    label: 'Documentation'
  }];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen &&
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        onClick={onClose} />

      }

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-card-bg border-r border-border-color z-40 transform transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">IP</span>
            </div>
            <span className="font-semibold text-text-primary">
              Workflow Tracker
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-text-secondary hover:text-text-primary">
            
            <X size={20} />
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {links.map((link) =>
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${isActive ? 'text-accent bg-blue-50 dark:bg-blue-900/20 border-l-2 border-accent' : 'text-text-secondary hover:text-text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
            }>
            
              <link.icon size={18} />
              {link.label}
            </NavLink>
          )}
        </nav>
      </aside>
    </>);

}