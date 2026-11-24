import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { UIProvider } from './context/UIContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Today from './pages/Today';
import Recurring from './pages/Recurring';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <UIProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/today" element={<Today />} />
                <Route path="/recurring" element={<Recurring />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UIProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
