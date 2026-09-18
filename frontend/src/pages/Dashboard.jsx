import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import Loader from '../components/common/Loader';
import { Users, AlertTriangle, Clock, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const Dashboard = () => {
  const { data: summary, loading: summaryLoading, error: summaryError } = useFetch('/api/dashboard/summary');
  const { data: students, loading: studentsLoading, error: studentsError } = useFetch('/api/students');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  if (summaryLoading || studentsLoading) return <Loader fullScreen />;

  if (summaryError || studentsError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to load dashboard</h2>
        <p className="text-slate-500 max-w-md">
          {summaryError?.message || studentsError?.message || "There was an error communicating with the server. Please check if the backend is running."}
        </p>
      </div>
    );
  }

  const chartData = summary?.risk_distribution 
    ? Object.entries(summary.risk_distribution).map(([key, value]) => ({
        name: key,
        count: value
      }))
    : [];

  const getRiskColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'low': return '#10b981'; // emerald-500
      case 'medium': return '#f59e0b'; // amber-500
      case 'high': return '#ef4444'; // red-500
      default: return '#94a3b8'; // slate-400
    }
  };

  const getRiskBadge = (student) => {
    // If student has predictions, get the latest one
    if (student.predictions && student.predictions.length > 0) {
      const latest = student.predictions[student.predictions.length - 1];
      const colorClass = latest.risk_status === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                         latest.risk_status === 'Medium' ? 'bg-amber-100 text-amber-700' :
                         latest.risk_status === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700';
      return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClass}`}>{latest.risk_status} Risk</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-500">Unpredicted</span>;
  };

  const filteredStudents = students?.filter(s => 
    s.first_name.toLowerCase().includes(search.toLowerCase()) || 
    s.last_name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary?.total_students || 0}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">At-Risk Students</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary?.risk_distribution?.High || 0}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Study Hours</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary?.average_study_hours || 0}h / wk</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Performance Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-800">Student Directory</h3>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Search students..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
              />
              <Button onClick={() => navigate('/students/new')} className="gap-2 shrink-0">
                <UserPlus size={16} /> Add Student
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Enrollment</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{student.enrollment_number}</td>
                    <td className="px-6 py-4">{student.first_name} {student.last_name}</td>
                    <td className="px-6 py-4">{student.class_level}</td>
                    <td className="px-6 py-4">{getRiskBadge(student)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
