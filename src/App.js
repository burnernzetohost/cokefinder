import React, { useState } from 'react';
import { Search, Filter, X, AlertCircle, LogOut, Users, Copy, Check, Menu, Contact, Edit2 } from 'lucide-react';

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

  // Layout State
  const [activeTab, setActiveTab] = useState('search');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ID Pass State
  const [idPassList, setIdPassList] = useState([]);
  const [idPassForm, setIdPassForm] = useState({ id: '', name: '', branches: '' });
  const [isEditingDb, setIsEditingDb] = useState(false);
  const [originalEditId, setOriginalEditId] = useState(null);
  const [showIdPassForm, setShowIdPassForm] = useState(false);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbSelectedBranch, setDbSelectedBranch] = useState('');
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState('');

  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [newBranchInput, setNewBranchInput] = useState('');

  const availableBranches = React.useMemo(() => {
    const branches = new Set();
    idPassList.forEach(item => {
      if (item.branches) {
        item.branches.split(',').forEach(b => branches.add(b.trim()));
      }
    });
    return Array.from(branches).filter(Boolean).sort();
  }, [idPassList]);

  const fetchIdPass = async () => {
    setDbLoading(true);
    setDbError('');
    try {
      const response = await fetch(`${API_BASE_URL}/id_pass`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch ID Pass list');
      const data = await response.json();
      setIdPassList(data.data || []);
    } catch (err) {
      setDbError(err.message);
    }
    setDbLoading(false);
  };

  const handleSaveIdPass = async (e) => {
    e.preventDefault();
    setDbLoading(true);
    setDbError('');
    try {
      const url = isEditingDb
        ? `${API_BASE_URL}/id_pass/${originalEditId}`
        : `${API_BASE_URL}/id_pass`;
      const method = isEditingDb ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(idPassForm)
      });
      if (!response.ok) throw new Error('Failed to save record. ID might already exist.');

      setIdPassForm({ id: '', name: '', branches: '' });
      setIsEditingDb(false);
      setOriginalEditId(null);
      setShowIdPassForm(false);
      fetchIdPass();
    } catch (err) {
      setDbError(err.message);
    }
    setDbLoading(false);
  };

  const editIdPass = (item) => {
    setIdPassForm(item);
    setOriginalEditId(item.id);
    setIsEditingDb(true);
    setShowIdPassForm(true);
  };

  const cancelEdit = () => {
    setIdPassForm({ id: '', name: '', branches: '' });
    setIsEditingDb(false);
    setOriginalEditId(null);
    setShowIdPassForm(false);
  };

  const filteredIdPassList = React.useMemo(() => {
    return idPassList.filter(item => {
      const searchMatch = !dbSearchQuery ||
        item.id.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(dbSearchQuery.toLowerCase());

      const branchMatch = !dbSelectedBranch ||
        (item.branches && item.branches.split(',').map(b => b.trim()).includes(dbSelectedBranch));

      return searchMatch && branchMatch;
    });
  }, [idPassList, dbSearchQuery, dbSelectedBranch]);

  React.useEffect(() => {
    if (token && activeTab === 'idpass') {
      fetchIdPass();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTab]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('search'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'search' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            <Search size={20} /> Search Lectures
          </button>

          <button
            onClick={() => { setActiveTab('idpass'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'idpass' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            <Contact size={20} /> ID Pass DB
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg transition justify-center"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto w-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 border-b border-slate-700 bg-slate-800 sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300 hover:text-white">
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-white">
            {activeTab === 'search' ? 'Lecture Finder' : 'ID Pass Database'}
          </h1>
        </div>

        <div className="p-4 py-8 lg:p-12 w-full max-w-5xl mx-auto">

          {/* SEARCH TAB */}
          {activeTab === 'search' && (
            <>
              <div className="hidden lg:block mb-12">
                <h1 className="text-5xl font-bold text-white mb-3">Lecture Finder</h1>
                <p className="text-slate-400 text-lg">Search and manage lectures</p>
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Student Name</label>
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
            </>
          )}

          {/* ID PASS TAB */}
          {activeTab === 'idpass' && (
            <>
              <div className="hidden lg:block mb-6">
                <h1 className="text-5xl font-bold text-white mb-3">ID Pass Database</h1>
                <p className="text-slate-400 text-lg">same id pass database</p>
              </div>

              {/* Top Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                <button
                  onClick={() => {
                    setIdPassForm({ id: '', name: '', branches: '' });
                    setIsEditingDb(false);
                    setOriginalEditId(null);
                    setShowIdPassForm(true);
                  }}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 rounded-lg shadow-lg border border-blue-500/50 transition whitespace-nowrap"
                >
                  <Search size={18} className="rotate-90 hidden" /> Add an id
                </button>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1 md:justify-end">
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={dbSearchQuery}
                      onChange={(e) => setDbSearchQuery(e.target.value)}
                      placeholder="Search ID or Name..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={dbSelectedBranch}
                    onChange={(e) => setDbSelectedBranch(e.target.value)}
                    className="w-full md:w-48 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Branches</option>
                    {availableBranches.map((branch, idx) => (
                      <option key={idx} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Form Overlay Section (Modal) */}
                {showIdPassForm && (
                  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                      <button
                        onClick={cancelEdit}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                      <h2 className="text-xl font-semibold text-white mb-6">
                        {isEditingDb ? 'Edit Record' : 'Add New Record'}
                      </h2>
                      <form onSubmit={handleSaveIdPass} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">ID</label>
                          <input
                            type="text"
                            value={idPassForm.id}
                            onChange={(e) => setIdPassForm({ ...idPassForm, id: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                          <input
                            type="text"
                            value={idPassForm.name}
                            onChange={(e) => setIdPassForm({ ...idPassForm, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Branch(s)</label>
                          <div className="relative">
                            <div
                              className="min-h-[50px] w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus-within:border-blue-500 flex flex-wrap gap-2 items-center cursor-text"
                              onClick={() => setBranchDropdownOpen(true)}
                            >
                              {idPassForm.branches.split(',').filter(Boolean).map(b => b.trim()).map((branch, idx) => (
                                <span key={idx} className="bg-blue-600 px-2 py-1 rounded text-sm flex items-center gap-1">
                                  {branch}
                                  <X size={14} className="hover:text-red-300 cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    const newBranches = idPassForm.branches.split(',').map(b => b.trim()).filter(b => b && b !== branch).join(', ');
                                    setIdPassForm({ ...idPassForm, branches: newBranches });
                                  }} />
                                </span>
                              ))}
                              <input
                                type="text"
                                value={newBranchInput}
                                onChange={(e) => {
                                  setNewBranchInput(e.target.value);
                                  setBranchDropdownOpen(true);
                                }}
                                onFocus={() => setBranchDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setBranchDropdownOpen(false), 200)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newBranchInput.trim()) {
                                      const currentBranches = idPassForm.branches.split(',').map(b => b.trim()).filter(Boolean);
                                      if (!currentBranches.includes(newBranchInput.trim())) {
                                        currentBranches.push(newBranchInput.trim());
                                        setIdPassForm({ ...idPassForm, branches: currentBranches.join(', ') });
                                      }
                                      setNewBranchInput('');
                                    }
                                  }
                                }}
                                placeholder={idPassForm.branches ? '' : 'Select or type...'}
                                className="bg-transparent border-none outline-none text-white flex-1 min-w-[120px] py-1"
                              />
                            </div>

                            <input
                              type="text"
                              name="branches"
                              value={idPassForm.branches}
                              readOnly
                              required
                              className="opacity-0 absolute h-0 w-0 -z-10"
                            />

                            {branchDropdownOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                {availableBranches.filter(b => b.toLowerCase().includes(newBranchInput.toLowerCase()) && !idPassForm.branches.split(',').map(x => x.trim()).includes(b)).map((branch, idx) => (
                                  <div
                                    key={idx}
                                    className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-slate-200 border-b border-slate-700/50 last:border-0"
                                    onClick={() => {
                                      const currentBranches = idPassForm.branches.split(',').map(b => b.trim()).filter(Boolean);
                                      if (!currentBranches.includes(branch)) {
                                        currentBranches.push(branch);
                                        setIdPassForm({ ...idPassForm, branches: currentBranches.join(', ') });
                                      }
                                      setNewBranchInput('');
                                      setBranchDropdownOpen(false);
                                    }}
                                  >
                                    {branch}
                                  </div>
                                ))}
                                {newBranchInput.trim() && !availableBranches.includes(newBranchInput.trim()) && (
                                  <div
                                    className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-blue-400 italic"
                                    onClick={() => {
                                      const currentBranches = idPassForm.branches.split(',').map(b => b.trim()).filter(Boolean);
                                      if (!currentBranches.includes(newBranchInput.trim())) {
                                        currentBranches.push(newBranchInput.trim());
                                        setIdPassForm({ ...idPassForm, branches: currentBranches.join(', ') });
                                      }
                                      setNewBranchInput('');
                                      setBranchDropdownOpen(false);
                                    }}
                                  >
                                    Add "{newBranchInput.trim()}"
                                  </div>
                                )}
                                {!newBranchInput.trim() && availableBranches.filter(b => !idPassForm.branches.split(',').map(x => x.trim()).includes(b)).length === 0 && (
                                  <div className="px-4 py-3 text-slate-400 text-sm">
                                    No additional branches. Type to add a new one.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {dbError && (
                          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                            <p className="text-red-300 text-sm">{dbError}</p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <button
                            type="submit"
                            disabled={dbLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                          >
                            {dbLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Table Section */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-220px)]">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-white">Database Records</h2>
                      <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                        {filteredIdPassList.length} total
                      </span>
                    </div>

                    <div className="overflow-y-auto flex-1 p-0">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 sticky top-0 backdrop-blur z-10">
                          <tr>
                            <th className="p-4 border-b border-slate-700 text-slate-300 font-semibold">ID</th>
                            <th className="p-4 border-b border-slate-700 text-slate-300 font-semibold">Name</th>
                            <th className="p-4 border-b border-slate-700 text-slate-300 font-semibold">Branch(s)</th>
                            <th className="p-4 border-b border-slate-700 text-slate-300 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIdPassList.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="p-12 text-center text-slate-400">
                                {dbLoading ? 'Loading...' : 'No records found matching your filters.'}
                              </td>
                            </tr>
                          ) : (
                            filteredIdPassList.map((item) => (

                              <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                                <td className="p-4 text-blue-400 font-medium">{item.id}</td>
                                <td className="p-4 text-slate-200">{item.name}</td>
                                <td className="p-4 text-slate-300">
                                  <span className="px-2 py-1 bg-slate-700 rounded text-xs">{item.branches}</span>
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => editIdPass(item)}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}