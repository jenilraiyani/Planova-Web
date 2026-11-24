import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import AddTaskModal from './AddTaskModal';
import Toast from './Toast';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg dark:bg-dark-bg">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <AddTaskModal />
      <Toast />
    </div>
  );
};

export default Layout;
