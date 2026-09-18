import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import Loader from '../components/common/Loader';

const PredictionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, loading: studentLoading, error: studentError } = useFetch(`/api/students/${id}`);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/predict/${id}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  if (studentLoading) return <Loader fullScreen />;
  if (studentError) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to load prediction context</h2>
        <p className="text-slate-500 max-w-md mb-6">
          {studentError?.message || "There was an error communicating with the server."}
        </p>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(`/students/${id}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Student Profile
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <BrainCircuit size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Performance Prediction</h2>
        <p className="text-slate-500 max-w-lg mx-auto mb-8">
          Run our trained ML model to analyze {student?.first_name}'s recent marks, attendance, and behavioral data to predict their academic trajectory.
        </p>

        {!result ? (
          <Button onClick={runPrediction} disabled={loading} className="px-8 py-3 text-lg">
            {loading ? 'Analyzing Data...' : 'Run Analysis Now'}
          </Button>
        ) : (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl text-left border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-4 text-center">Prediction Results</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 text-center">
                <p className="text-sm text-slate-500 mb-1">Risk Status</p>
                <p className={`text-xl font-bold ${
                  result.risk_status === 'Low' ? 'text-emerald-600' :
                  result.risk_status === 'Medium' ? 'text-amber-600' : 'text-red-600'
                }`}>{result.risk_status}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 text-center">
                <p className="text-sm text-slate-500 mb-1">Confidence</p>
                <p className="text-xl font-bold text-slate-800">{(result.confidence_score * 100).toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button onClick={() => navigate(`/students/${id}`)} variant="secondary">
                View Full Profile
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionPage;
