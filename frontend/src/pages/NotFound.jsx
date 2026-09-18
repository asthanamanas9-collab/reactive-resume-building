import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mt-4 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFound;
