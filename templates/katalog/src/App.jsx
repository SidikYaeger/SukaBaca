import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DeskShell } from './components/DeskShell';
import { CabinetPage } from './pages/CabinetPage';
import { CardDetailPage } from './pages/CardDetailPage';
import { IntakePage } from './pages/IntakePage';
import { BorrowerSlipPage } from './pages/BorrowerSlipPage';
import { MemberCardPage } from './pages/MemberCardPage';
import { LoginPage, RegisterPage } from './pages/AuthDeskPages';

export default function App() {
  return (
    <DeskShell>
      <Routes>
        <Route path="/" element={<CabinetPage />} />
        <Route path="/journal/:id" element={<CardDetailPage />} />
        <Route path="/upload" element={<IntakePage />} />
        <Route path="/history" element={<BorrowerSlipPage />} />
        <Route path="/subscription" element={<MemberCardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DeskShell>
  );
}
