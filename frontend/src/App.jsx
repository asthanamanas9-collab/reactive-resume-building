import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDetails from './pages/StudentDetails';
import AddStudent from './pages/AddStudent';
import PredictionPage from './pages/PredictionPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students/new" element={<AddStudent />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/students/:id/predict" element={<PredictionPage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
