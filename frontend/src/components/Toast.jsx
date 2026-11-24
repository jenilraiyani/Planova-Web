import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const Toast = () => {
  const { toast, clearToast } = useTasks();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 3200);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-[14px] border border-border bg-white px-4 py-3 shadow-lg dark:border-dark-border dark:bg-dark-card"
        >
          {toast.type === 'error' ? (
            <XCircle className="h-5 w-5 shrink-0 text-danger" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          )}
          <p className="flex-1 text-sm font-medium text-text-main dark:text-dark-text">
            {toast.message}
          </p>
          <button
            onClick={clearToast}
            className="rounded-lg p-1 text-text-secondary hover:bg-bg dark:hover:bg-dark-bg"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
