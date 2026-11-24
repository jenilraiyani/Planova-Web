import { useEffect, useState } from 'react';
import { Sun, Moon, Trash2, LayoutList, LayoutGrid, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

const Settings = () => {
  const { theme, setLight, setDark, isDark } = useTheme();
  const { clearAllTasks, tasks } = useTasks();
  const [confirmClear, setConfirmClear] = useState(false);
  const [defaultView, setDefaultView] = useState(
    () =>
      localStorage.getItem('planova-view') ||
      localStorage.getItem('taskora-view') ||
      'list'
  );

  useEffect(() => {
    const prefs = { defaultView };
    localStorage.setItem('planova-prefs', JSON.stringify(prefs));
    localStorage.setItem('planova-view', defaultView);
  }, [defaultView]);

  const handleClear = async () => {
    await clearAllTasks();
    setConfirmClear(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-main dark:text-dark-text">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
          Customize your Planova experience
        </p>
      </div>

      {/* Appearance */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[14px] border border-border bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary dark:text-dark-lavender" />
          <h2 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
            Appearance
          </h2>
        </div>
        <p className="mb-4 text-sm text-text-secondary dark:text-dark-text-secondary">
          Choose light or dark mode. Your preference is saved automatically.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={setLight}
            className={`flex items-center gap-3 rounded-[14px] border-2 p-4 text-left transition ${
              !isDark
                ? 'border-primary bg-lavender/20'
                : 'border-border hover:border-lavender dark:border-dark-border'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-bg">
              <Sun className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-text-main dark:text-dark-text">Light Mode</p>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                Soft Purple Haze
              </p>
            </div>
          </button>

          <button
            onClick={setDark}
            className={`flex items-center gap-3 rounded-[14px] border-2 p-4 text-left transition ${
              isDark
                ? 'border-dark-primary bg-dark-primary/20'
                : 'border-border hover:border-lavender dark:border-dark-border'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-deep-purple">
              <Moon className="h-5 w-5 text-lavender" />
            </div>
            <div>
              <p className="font-medium text-text-main dark:text-dark-text">Dark Mode</p>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                Deep Purple Haze
              </p>
            </div>
          </button>
        </div>

        {/* Theme preview */}
        <div className="mt-5 rounded-[14px] border border-border p-4 dark:border-dark-border">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary">
            Purple Haze Preview · {theme}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { c: '#211A35', n: 'Deep' },
              { c: '#7656D6', n: 'Primary' },
              { c: '#B69AF7', n: 'Lavender' },
              { c: '#F5F1FC', n: 'BG' },
              { c: '#D9C9F5', n: 'Light' },
            ].map((swatch) => (
              <div key={swatch.n} className="text-center">
                <div
                  className="h-10 w-10 rounded-[10px] border border-border shadow-sm dark:border-dark-border"
                  style={{ backgroundColor: swatch.c }}
                />
                <p className="mt-1 text-[10px] text-text-secondary dark:text-dark-text-secondary">
                  {swatch.n}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Display preferences */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[14px] border border-border bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-6"
      >
        <h2 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
          Task Display
        </h2>
        <p className="mt-1 mb-4 text-sm text-text-secondary dark:text-dark-text-secondary">
          Default view for My Tasks page
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDefaultView('list')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] border-2 px-4 py-3 text-sm font-medium transition ${
              defaultView === 'list'
                ? 'border-primary bg-lavender/20 text-primary'
                : 'border-border text-text-secondary hover:border-lavender dark:border-dark-border'
            }`}
          >
            <LayoutList className="h-4 w-4" />
            List View
          </button>
          <button
            onClick={() => setDefaultView('grid')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] border-2 px-4 py-3 text-sm font-medium transition ${
              defaultView === 'grid'
                ? 'border-primary bg-lavender/20 text-primary'
                : 'border-border text-text-secondary hover:border-lavender dark:border-dark-border'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid View
          </button>
        </div>
      </motion.section>

      {/* Danger zone */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[14px] border border-danger/30 bg-white p-5 shadow-sm dark:border-danger/40 dark:bg-dark-card sm:p-6"
      >
        <h2 className="font-display text-lg font-semibold text-danger">Danger Zone</h2>
        <p className="mt-1 mb-4 text-sm text-text-secondary dark:text-dark-text-secondary">
          Permanently delete all {tasks.length} task{tasks.length !== 1 ? 's' : ''} from your
          workspace. This cannot be undone.
        </p>
        <button
          onClick={() => setConfirmClear(true)}
          disabled={tasks.length === 0}
          className="inline-flex items-center gap-2 rounded-[12px] bg-danger px-4 py-2.5 text-sm font-medium text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Tasks
        </button>
      </motion.section>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all tasks?"
        message="This will permanently delete every task in your workspace. This action cannot be undone."
        confirmLabel="Clear Everything"
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};

export default Settings;
