import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Settings,
  X,
  Sparkles,
  Repeat,
} from 'lucide-react';
import { useUI } from '../context/UIContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/today', label: 'Today', icon: CalendarDays },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const SidebarContent = ({ onNavigate }) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center gap-3 px-5 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-lavender shadow-md shadow-primary/30">
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-white">
          Planova
        </h1>
        <p className="text-xs text-lavender/80">Personal Workspace</p>
      </div>
    </div>

    <nav className="mt-2 flex-1 space-y-1 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-[12px] px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-lavender/90 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-lavender'
                }`}
              />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    <div className="mx-4 mb-5 rounded-[14px] bg-white/5 p-4 border border-white/10">
      <p className="text-xs font-medium text-lavender">Stay focused</p>
      <p className="mt-1 text-[11px] leading-relaxed text-lavender/70">
        Small steps every day lead to big progress.
      </p>
    </div>
  </div>
);

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUI();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-deep-purple lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-deep-purple/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 bg-deep-purple lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-2 text-lavender hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
