import React from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
interface HeaderProps {
  onMenuClick: () => void;
}
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const initials = user?.initial || 'U';
  const name = user?.name || 'User';
  return (
    <header className="h-14 bg-card-bg border-b border-border-color flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-secondary hover:text-text-primary">
          
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-text-secondary hover:text-text-primary">
          <Search size={20} />
        </button>
        <button
          onClick={toggleTheme}
          className="text-text-secondary hover:text-text-primary">
          
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="text-text-secondary hover:text-text-primary relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 ml-2 border-l border-border-color pl-4">
          <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-medium">{initials}</span>
          </div>
          <span className="text-sm font-medium text-text-primary hidden sm:block">
            {name}
          </span>
          <button
            onClick={async () => {
              await logout();
              navigate('/login', { replace: true });
            }}
            className="ml-2 text-text-secondary hover:text-error"
            title="Sign Out">
            
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>);

}
