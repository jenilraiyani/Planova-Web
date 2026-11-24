require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const { generateAllActive } = require('./services/occurrenceGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    try {
      const result = await generateAllActive();
      console.log(
        `Recurring sync: ${result.schedules} schedules, ${result.created} created`
      );
    } catch (err) {
      console.error('Initial recurring sync failed:', err.message);
    }

    // Catch up missed/upcoming occurrences periodically
    setInterval(async () => {
      try {
        await generateAllActive();
      } catch (err) {
        console.error('Recurring sync error:', err.message);
      }
    }, 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

const allowedOrigins = (
  process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174'
).split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // personal local app — allow all origins in V1
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Planova API is running' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recurring-tasks', recurringRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Planova API running on port ${PORT}`);
});
