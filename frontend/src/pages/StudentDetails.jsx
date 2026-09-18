import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import api from '../services/api';
import { ArrowLeft, BrainCircuit, Plus, Calendar, BookOpen, Trash } from 'lucide-react';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, loading, error, refetch } = useFetch(`/api/students/${id}`);

  // Modals state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Form states
  const [markForm, setMarkForm] = useState({
    subject: '',
    exam_name: 'Midterm',
    marks_obtained: '',
    max_marks: 100,
    date: new Date().toISOString().split('T')[0]
  });

  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (loading) return <Loader fullScreen />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to load student details</h2>
        <p className="text-slate-500 max-w-md mb-6">
          {error?.message || "There was an error communicating with the server."}
        </p>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
      </div>
    );
  }
  if (!student) return <div className="p-8 text-center text-slate-500">Student not found</div>;

  const latestPrediction = student.predictions && student.predictions.length > 0 
    ? student.predictions[student.predictions.length - 1] 
    : null;

  // Handle Mark Submit
  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post(`/api/students/${id}/marks`, {
        ...markForm,
        marks_obtained: parseFloat(markForm.marks_obtained),
        max_marks: parseFloat(markForm.max_marks)
      });
      setIsMarkModalOpen(false);
      setMarkForm({
        subject: '',
        exam_name: 'Midterm',
        marks_obtained: '',
        max_marks: 100,
        date: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add marks record');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Attendance Submit
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post(`/api/students/${id}/attendance`, attendanceForm);
      setIsAttendanceModalOpen(false);
      setAttendanceForm({
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        remarks: ''
      });
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add attendance record');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const deleteMark = async (markId) => {
    if (!window.confirm("Are you sure you want to delete this marks record?")) return;
    try {
      await api.delete(`/api/students/marks/${markId}`);
      refetch();
    } catch (err) {
      alert("Failed to delete marks record");
    }
  };

  const deleteAttendance = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
    try {
      await api.delete(`/api/students/attendance/${attendanceId}`);
      refetch();
    } catch (err) {
      alert("Failed to delete attendance record");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{student.first_name} {student.last_name}</h2>
          <p className="text-slate-500 mt-1">Enrollment: {student.enrollment_number} &bull; Class: {student.class_level}</p>
          <div className="flex gap-4 mt-2 text-xs text-slate-400">
            <span>Study Hours: {student.study_hours_per_week || 0} hrs/wk</span>
            <span>Parent Collaboration: {student.parent_collaboration || 0}/10</span>
          </div>
        </div>
        <Button onClick={() => navigate(`/students/${id}/predict`)} className="gap-2">
          <BrainCircuit size={18} /> Run AI Prediction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LATEST PREDICTION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Latest Prediction</h3>
          {latestPrediction ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                  latestPrediction.risk_status === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                  latestPrediction.risk_status === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  latestPrediction.risk_status === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {latestPrediction.risk_status} Risk
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Confidence</p>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(latestPrediction.confidence_score * 100).toFixed(0)}%` }}></div>
                </div>
                <p className="text-xs text-right mt-1 text-slate-500">{(latestPrediction.confidence_score * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Generated At</p>
                <p className="text-sm font-medium text-slate-800">{new Date(latestPrediction.created_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No predictions generated yet.
            </div>
          )}
        </div>

        {/* MARKS RECORD */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Recent Marks</h3>
              <button 
                onClick={() => setIsMarkModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded-lg transition-colors"
                title="Add Marks"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {student.marks_records && student.marks_records.length > 0 ? student.marks_records.map((m, i) => (
                <div key={m.id || i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{m.subject}</p>
                    <p className="text-[10px] text-slate-400">{m.exam_name} &bull; {m.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600 text-sm">{m.marks_obtained} / {m.max_marks}</span>
                    <button 
                      onClick={() => deleteMark(m.id)}
                      className="text-red-500 hover:text-red-700 hidden group-hover:block transition-colors p-1"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-slate-400 text-sm">
                  <BookOpen className="mx-auto mb-1 text-slate-300" size={20} />
                  No marks recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ATTENDANCE RECORD */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Recent Attendance</h3>
              <button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded-lg transition-colors"
                title="Add Attendance"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {student.attendance_records && student.attendance_records.length > 0 ? student.attendance_records.map((a, i) => (
                <div key={a.id || i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{a.date}</p>
                    {a.remarks && <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{a.remarks}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {a.status}
                    </span>
                    <button 
                      onClick={() => deleteAttendance(a.id)}
                      className="text-red-500 hover:text-red-700 hidden group-hover:block transition-colors p-1"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-slate-400 text-sm">
                  <Calendar className="mx-auto mb-1 text-slate-300" size={20} />
                  No attendance records.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD MARK MODAL */}
      <Modal isOpen={isMarkModalOpen} onClose={() => setIsMarkModalOpen(false)} title="Add Marks Record">
        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
            {formError}
          </div>
        )}
        <form onSubmit={handleMarkSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mathematics"
              value={markForm.subject}
              onChange={(e) => setMarkForm({ ...markForm, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type *</label>
            <select
              value={markForm.exam_name}
              onChange={(e) => setMarkForm({ ...markForm, exam_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none bg-white"
            >
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Quiz 1">Quiz 1</option>
              <option value="Quiz 2">Quiz 2</option>
              <option value="Assignment">Assignment</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Obtained Marks *</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={markForm.marks_obtained}
                onChange={(e) => setMarkForm({ ...markForm, marks_obtained: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks *</label>
              <input
                type="number"
                required
                min="1"
                step="0.1"
                value={markForm.max_marks}
                onChange={(e) => setMarkForm({ ...markForm, max_marks: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={markForm.date}
              onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsMarkModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Mark'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD ATTENDANCE MODAL */}
      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title="Add Attendance Record">
        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
            {formError}
          </div>
        )}
        <form onSubmit={handleAttendanceSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={attendanceForm.date}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status *</label>
            <select
              value={attendanceForm.status}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none bg-white"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Present, Late, Absent reason"
              value={attendanceForm.remarks}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsAttendanceModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDetails;
