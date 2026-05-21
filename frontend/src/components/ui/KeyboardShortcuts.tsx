import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement)
      {
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        navigate('/applications/create');
      } else if (e.key === '/') {
        e.preventDefault();
        // Find and focus the first search input
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]'
        ) as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Keyboard Shortcuts">
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-border-color">
          <span className="text-sm text-text-primary">
            Create new application
          </span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-border-color rounded text-xs font-mono text-text-secondary">
            N
          </kbd>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border-color">
          <span className="text-sm text-text-primary">Focus search bar</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-border-color rounded text-xs font-mono text-text-secondary">
            /
          </kbd>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-text-primary">Show this help menu</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-border-color rounded text-xs font-mono text-text-secondary">
            ?
          </kbd>
        </div>
      </div>
    </Modal>);

}