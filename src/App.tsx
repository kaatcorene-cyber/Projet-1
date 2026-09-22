/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Invest } from './pages/Invest';
import { Team } from './pages/Team';
import { History } from './pages/History';
import { Deposit } from './pages/Deposit';
import { Withdraw } from './pages/Withdraw';
import { Admin } from './pages/Admin';
import { Setup } from './pages/Setup';
import { Support } from './pages/Support';
import { Activity } from './pages/Activity';
import WithdrawInfo from './pages/WithdrawInfo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup" element={<Setup />} />
        
        <Route element={<Layout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/team" element={<Team />} />
          <Route path="/history" element={<History />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/commissions" element={<Navigate to="/team" replace />} />
          <Route path="/withdraw-info" element={<WithdrawInfo />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/support" element={<Support />} />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/profile" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

