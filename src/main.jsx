import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import AppCycles from './composantsCycles/AppCycles';
import AppShifts from './composantsShifts/AppShifts';
import AppIndicateurs from './composantsIndicateurs/AppIndicateurs';
import AppContraintes from './composantsContraintes/AppContraintes';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/cycles" element={<AppCycles />} />
      <Route path="/shifts" element={<AppShifts />} />
      <Route path="/indicateurs" element={<AppIndicateurs />} />
      <Route path="/contraintes" element={<AppContraintes />} />
    </Routes>
    </Router>
  </StrictMode>
);