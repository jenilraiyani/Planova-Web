import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Plus, Sun, Moon, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';

const titles = {
  '/': 'Dashboard',
  '/tasks': 'My Tasks',
  '/today': 'Today',
  '/recurring': 'Recurring',
  '/settings': 'Settings',
};

const Header = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { setSidebarOpen, openAddModal, searchQuery, setSearchQuery } = useUI();
  const title = titles[location.pathname] || 'Planova';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/80">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-[12px] p-2 text-text-main hover:bg-bg dark:text-dark-text dark:hover:bg-dark-card lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-semibold text-text-main dark:text-dark-text sm:text-xl">
            {title}
          </h2>
        </div>

        <div className="hidden items-center md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-56 rounded-[12px] border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:placeholder:text-dark-text-secondary lg:w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            className="relative rounded-[12px] p-2 text-text-secondary transition hover:bg-bg hover:text-primary dark:hover:bg-dark-card dark:hover:text-dark-lavender"
            aria-label="Notifications"
            title="Notifications coming soon"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="rounded-[12px] p-2 text-text-secondary transition hover:bg-bg hover:text-primary dark:hover:bg-dark-card dark:hover:text-dark-lavender"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>

          <div className="hidden items-center gap-2 rounded-[12px] border border-border px-2.5 py-1.5 dark:border-dark-border sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-lavender text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="pr-1">
              <p className="text-xs font-semibold text-text-main dark:text-dark-text">You</p>
              <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary">
                Personal
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-[12px] bg-primary px-3 py-2 text-sm font-medium text-white shadow-md shadow-primary/25 transition hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-border px-4 py-2 md:hidden dark:border-dark-border">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-[12px] border border-border bg-bg py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
