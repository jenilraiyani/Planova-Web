import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-deep-purple/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="relative w-full max-w-md rounded-[18px] border border-border bg-white p-6 shadow-xl dark:border-dark-border dark:bg-dark-card"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
            <h3 className="font-display text-xl font-semibold text-text-main dark:text-dark-text">
              {title}
            </h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
              {message}
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="rounded-[12px] border border-border px-4 py-2.5 text-sm font-medium text-text-main transition hover:bg-bg dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`rounded-[12px] px-4 py-2.5 text-sm font-medium text-white transition ${
                  danger
                    ? 'bg-danger hover:bg-danger/90'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
