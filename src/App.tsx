/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Invest } from './pages/Invest';
import { Team } from './pages/Team';
import { History } from './pages/History';
import { Deposit } from './pages/Deposit';
import { Withdraw } from './pages/Withdraw';
import { Admin } from './pages/Admin';
import { Setup } from './pages/Setup';
import { Bank } from './pages/Bank';
import { Products } from './pages/Products';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ className: 'text-sm font-bold', style: { borderRadius: '16px', background: '#333', color: '#fff' } }} />
      <AnimatedBackground />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup" element={<Setup />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Dashboard />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/team" element={<Team />} />
          <Route path="/history" element={<History />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bank" element={<Bank />} />
          <Route path="/products" element={<Products />} />
        </Route>

        <Route path="/" element={<Navigate to="/invest" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

