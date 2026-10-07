import express, { type ErrorRequestHandler } from 'express';
import { healthRouter } from './routes/health.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use('/api', healthRouter);

// Здесь позже подключим роутеры заказов и платежей — в ходе обучения.
app.use((_req, res) => res.status(404).json({ error: 'Маршрут не найден.' }));
const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'Некорректный JSON.' });
    return;
  }
  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') {
    res.status(413).json({ error: 'Слишком большой запрос.' });
    return;
  }
  console.error('Ошибка сервера:', error instanceof Error ? error.name : 'UnknownError');
  res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
};
app.use(handleError);

// Отдельный app без listen — его можно импортировать в тесты и использовать на Vercel.
export default app;
