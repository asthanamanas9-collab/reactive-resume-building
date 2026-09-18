import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import { ArrowLeft, UserPlus, BookOpen, Calendar, Plus, Trash, Brain } from 'lucide-react';

const AddStudent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [studentDetails, setStudentDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    enrollment_number: '',
    date_of_birth: '',
    class_level: 'Grade 10',
    study_hours_per_week: 10,
    parent_collaboration: 5,
  });

  const [marksRecords, setMarksRecords] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Handle Input Changes
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails(prev => ({
      ...prev,
      [name]: name === 'study_hours_per_week' || name === 'parent_collaboration' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  // Dynamic Marks handlers
  const addMarkRow = () => {
    setMarksRecords(prev => [
      ...prev,
      { subject: '', exam_name: 'Midterm', marks_obtained: 75, max_marks: 100, date: new Date().toISOString().split('T')[0] }
    ]);
  };

  const updateMarkRow = (index, field, value) => {
    setMarksRecords(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        [field]: field === 'marks_obtained' || field === 'max_marks' ? parseFloat(value) || 0 : value
      };
    }));
  };

  const removeMarkRow = (index) => {
    setMarksRecords(prev => prev.filter((_, idx) => idx !== index));
  };

  // Dynamic Attendance handlers
  const addAttendanceRow = () => {
    setAttendanceRecords(prev => [
      ...prev,
      { date: new Date().toISOString().split('T')[0], status: 'Present', remarks: '' }
    ]);
  };

  const updateAttendanceRow = (index, field, value) => {
    setAttendanceRecords(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [field]: value };
    }));
  };

  const removeAttendanceRow = (index) => {
    setAttendanceRecords(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Student
      const studentPayload = { ...studentDetails };
      if (!studentPayload.email) delete studentPayload.email;
      if (!studentPayload.date_of_birth) delete studentPayload.date_of_birth;

      const studentResponse = await api.post('/api/students', studentPayload);
      const studentId = studentResponse.data.id;

      // 2. Add Marks if any
      for (const mark of marksRecords) {
        if (mark.subject.trim()) {
          await api.post(`/api/students/${studentId}/marks`, mark);
        }
      }

      // 3. Add Attendance if any
      for (const att of attendanceRecords) {
        await api.post(`/api/students/${studentId}/attendance`, att);
      }

      // 4. Trigger prediction immediately so we have prediction data
      try {
        await api.post(`/api/predict/${studentId}`);
      } catch (err) {
        console.warn("Auto-prediction trigger failed, can be run manually:", err);
      }

      // Redirect to Student details
      navigate(`/students/${studentId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save student details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Add New Student</h2>
            <p className="text-slate-500">Register a student and configure initial academic records for predictions.</p>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-8">
          {[
            { step: 1, label: 'Personal Details' },
            { step: 2, label: 'Study & Habits' },
            { step: 3, label: 'Initial Marks' },
            { step: 4, label: 'Attendance' }
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                step === s.step 
                  ? 'bg-blue-600 text-white' 
                  : step > s.step 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {s.step}
              </span>
              <span className={`text-sm font-medium hidden sm:inline ${
                step === s.step ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    name="first_name"
                    value={studentDetails.first_name}
                    onChange={handleDetailChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="e.g. Aarav"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    required
                    name="last_name"
                    value={studentDetails.last_name}
                    onChange={handleDetailChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="e.g. Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Enrollment Number *</label>
                  <input
                    type="text"
                    required
                    name="enrollment_number"
                    value={studentDetails.enrollment_number}
                    onChange={handleDetailChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="e.g. STU101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Class Level *</label>
                  <select
                    name="class_level"
                    value={studentDetails.class_level}
                    onChange={handleDetailChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={studentDetails.email}
                    onChange={handleDetailChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="e.g. aarav@school.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={studentDetails.date_of_birth}
                    onChange={handleDetailChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Study Habits & Parents */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Study Hours Per Week ({studentDetails.study_hours_per_week} hrs)
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  name="study_hours_per_week"
                  value={studentDetails.study_hours_per_week}
                  onChange={handleDetailChange}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0 hrs</span>
                  <span>20 hrs</span>
                  <span>40 hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Parent Collaboration Level ({studentDetails.parent_collaboration} / 10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  name="parent_collaboration"
                  value={studentDetails.parent_collaboration}
                  onChange={handleDetailChange}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 (Minimal Interaction)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Highly Engaged)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Marks */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-800 text-base">Record Initial Academic Marks</h3>
                <button
                  type="button"
                  onClick={addMarkRow}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  <Plus size={16} /> Add Subject Mark
                </button>
              </div>

              {marksRecords.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <BookOpen className="mx-auto mb-2 text-slate-400" size={28} />
                  <p className="text-sm">No initial marks added. You can skip this or add them later.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {marksRecords.map((m, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
                        <input
                          type="text"
                          required
                          value={m.subject}
                          onChange={(e) => updateMarkRow(idx, 'subject', e.target.value)}
                          placeholder="e.g. Mathematics"
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="w-[120px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Exam Type</label>
                        <select
                          value={m.exam_name}
                          onChange={(e) => updateMarkRow(idx, 'exam_name', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="Midterm">Midterm</option>
                          <option value="Final">Final</option>
                          <option value="Quiz 1">Quiz 1</option>
                          <option value="Quiz 2">Quiz 2</option>
                          <option value="Assignment">Assignment</option>
                        </select>
                      </div>
                      <div className="w-[90px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Obtained</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={m.marks_obtained}
                          onChange={(e) => updateMarkRow(idx, 'marks_obtained', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="w-[90px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Max Marks</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={m.max_marks}
                          onChange={(e) => updateMarkRow(idx, 'max_marks', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="w-[130px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={m.date}
                          onChange={(e) => updateMarkRow(idx, 'date', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMarkRow(idx)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg mt-5 self-start transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Initial Attendance */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-800 text-base">Record Attendance History</h3>
                <button
                  type="button"
                  onClick={addAttendanceRow}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  <Plus size={16} /> Add Attendance Date
                </button>
              </div>

              {attendanceRecords.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Calendar className="mx-auto mb-2 text-slate-400" size={28} />
                  <p className="text-sm">No attendance dates added. You can skip this or add them later.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {attendanceRecords.map((a, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-[150px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={a.date}
                          onChange={(e) => updateAttendanceRow(idx, 'date', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="w-[120px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                        <select
                          value={a.status}
                          onChange={(e) => updateAttendanceRow(idx, 'status', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Remarks (Optional)</label>
                        <input
                          type="text"
                          value={a.remarks}
                          onChange={(e) => updateAttendanceRow(idx, 'remarks', e.target.value)}
                          placeholder="e.g. Excused medical leave"
                          className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttendanceRow(idx)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg mt-5 self-start transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              disabled={step === 1 || loading}
            >
              Back
            </Button>
            
            {step < 4 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // Basic validation for Step 1
                  if (step === 1) {
                    if (!studentDetails.first_name || !studentDetails.last_name || !studentDetails.enrollment_number) {
                      setError('Please fill in all required fields marked with *');
                      return;
                    }
                    setError('');
                  }
                  nextStep();
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="gap-2"
              >
                {loading ? 'Creating Student...' : (
                  <>
                    <Brain size={18} /> Register & Generate prediction
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
