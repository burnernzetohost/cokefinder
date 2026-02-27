import React, { useState } from 'react';
import { Search, Filter, X, AlertCircle, LogOut, Users, Copy, Check } from 'lucide-react';

export default function LectureFinderApp() {
  const [token, setToken] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [minStudents, setMinStudents] = useState('');
  const [erpId, setErpId] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (lectureId) => {
    const link = `http://erp.tcetmumbai.in/TimeTable/Test/AttendanceStudListRegularNew.aspx?subid=11068&sec=AIML-B&subjt=BAI(THEORY)PCC%20-%20AIML403&Time=08:30%20AM%C2%B5TO%C2%B509:30%20AM%C2%B5%C2%B5(1)%C2%B5%C2%B5[REGULAR]%20(ALL)&applno=1&sectid=276&perdsqno=1&perdType=REGULAR&BatchdeId=8942&exttid=0&seqno=1023054&seqnointer=1013555&Date=04/02/2026&periodstatus=NOTMARKED&tdsplanID=39787&SEMESTERMSTID=4&STUMRKLOCKID=${lectureId}&STATUS=PERIOD_TAKEN&Remark=&Centrecode=TENGG_SC&SUB_STATUS=&ATTEND_LOCK=N&DATE_QUESTR=`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(lectureId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const API_BASE_URL = 'https://NZE77-cokefinder.hf.space';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loginId, password: loginPassword })
      });

      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      setToken(data.access_token);
      setLoginId('');
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.message);
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setResults([]);
    setSearched(false);
    setMinStudents('');
    setErpId('');
    setName('');
    setStatus('');
    setError('');
  };

  const handleSearch = async () => {
    if (!token) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          min_students: minStudents ? parseInt(minStudents) : null,
          erp_id: erpId || null,
          name: name || null,
          status: status || null
        })
      });

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.lectures || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setMinStudents('');
    setErpId('');
    setName('');
    setStatus('');
    setResults([]);
    setSearched(false);
    setError('');
  };

  // Login Page
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-12 max-w-md h-screen flex items-center">
          <div className="w-full">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-3">Lecture Finder</h1>
              <p className="text-slate-400">Admin Portal</p>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-8">
              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Admin ID</label>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="Enter admin ID"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  {loginError && (
                    <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-red-300 text-sm">{loginError}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {loginLoading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">Lecture Finder</h1>
            <p className="text-slate-400 text-lg">Search and manage lectures</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Search Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <Filter className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Search Lectures</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Min. Students</label>
              <input
                type="number"
                value={minStudents}
                onChange={(e) => setMinStudents(e.target.value)}
                placeholder="e.g., 30"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ERP ID</label>
              <input
                type="text"
                value={erpId}
                onChange={(e) => setErpId(e.target.value)}
                placeholder="e.g., 1032252630"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Student Name (Fuzzy Search)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kevin Pimenta"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Status --</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="NOTMARKED">Not Marked</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Search size={18} /> {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-2 transition"
            >
              <X size={18} /> Reset
            </button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mt-6 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {searched && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Results <span className="text-blue-400">({results.length} found)</span>
            </h3>

            {results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-lg">No lectures match your criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((lecture) => (
                  <div key={lecture.strmlkid || lecture.lecture_id} className="bg-slate-700 border border-slate-600 rounded-lg p-6 hover:border-blue-500/50 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-blue-400">Lecture ID: {lecture.strmlkid || lecture.lecture_id}</h4>
                      <button
                        onClick={() => handleCopyLink(lecture.strmlkid || lecture.lecture_id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-600 rounded-md transition border border-slate-600"
                        title="Copy Link"
                      >
                        {copiedId === (lecture.strmlkid || lecture.lecture_id) ? (
                          <Check size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} className="text-slate-400 hover:text-white" />
                        )}
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm"><span className="text-slate-400">Total Students:</span> {lecture.total_students}</p>

                    {lecture.remark && (
                      <p className="text-slate-300 text-sm mt-2">
                        <span className="text-slate-400">Remark:</span> <span className="text-yellow-400">{lecture.remark}</span>
                      </p>
                    )}

                    <div className="border-t border-slate-600 pt-4 mt-4">
                      <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                        <Users size={16} /> Matching Students ({lecture.match_count})
                      </p>
                      <div className="space-y-2">
                        {lecture.matching_students.map((student, idx) => (
                          <div key={idx} className="bg-slate-800 rounded p-3 text-sm">
                            <p className="text-slate-200"><span className="text-slate-400">Name:</span> {student.name}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              <span>Roll: {student.roll_no}</span> · <span>{student.status}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}