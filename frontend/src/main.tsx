import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/play/cyrillic-400.css';
import '@fontsource/play/cyrillic-700.css';
import '@fontsource/play/latin-400.css';
import '@fontsource/play/latin-700.css';
import './styles-cyberpunk.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
