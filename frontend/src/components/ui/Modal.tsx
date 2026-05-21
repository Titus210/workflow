import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose} />
        
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="bg-card-bg rounded border border-border-color shadow-sm w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="flex items-start justify-between p-4 border-b border-border-color">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {title}
                  </h2>
                  {subtitle &&
                <p className="text-sm text-text-secondary mt-1">
                      {subtitle}
                    </p>
                }
                </div>
                <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors">
                
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">{children}</div>
            </motion.div>
          </div>
        </>
      }
    </AnimatePresence>);

}