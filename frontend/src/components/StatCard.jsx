import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, delay = 0, accent = 'primary' }) => {
  const accents = {
    primary: 'from-primary/15 to-lavender/20 text-primary dark:from-dark-primary/20 dark:to-lavender/10 dark:text-dark-lavender',
    success: 'from-success/15 to-emerald-100/50 text-success dark:from-success/20 dark:to-emerald-900/20',
    warning: 'from-warning/15 to-amber-100/50 text-warning dark:from-warning/20 dark:to-amber-900/20',
    lavender: 'from-lavender/30 to-light-purple/40 text-deep-purple dark:from-lavender/20 dark:to-dark-primary/20 dark:text-dark-lavender',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-[14px] border border-border bg-white p-5 shadow-sm transition hover:shadow-md dark:border-dark-border dark:bg-dark-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-text-main dark:text-dark-text">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br ${accents[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
