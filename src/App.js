import React, { useState, useEffect } from 'react';
import { Search, Filter, X, AlertCircle, LogOut, Users, Copy, Check, Menu, Contact, Edit2, Sun, Moon, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// Initialize Supabase Client
// Replace anon_key with your Supabase Anon Key from Settings -> API
const supabaseUrl = 'https://mfvegfwlqpjwtlcoebgz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdmVnZndscXBqd3RsY29lYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTU5MDAsImV4cCI6MjA4Nzc5MTkwMH0.KTaX3IvkiIwYLpR7L3fqyVj36-UMudO4DwPvj2tdbN8';
const supabase = createClient(supabaseUrl, supabaseKey);/* ── Dark / Light Mode Toggle Component ── */
function ModeToggle({ dark, onToggle }) {
  return (
    <button className="mode-toggle" onClick={onToggle} title={dark ? 'Switch to Light' : 'Switch to Dark'}>
      <div className="toggle-track">
        <div className={`toggle-knob ${dark ? 'on' : ''}`} />
      </div>
      {dark
        ? <><Moon size={13} style={{ color: 'var(--text-secondary)' }} /><span className="toggle-label">Dark</span></>
        : <><Sun size={13} style={{ color: 'var(--text-secondary)' }} /><span className="toggle-label">Light</span></>
      }
    </button>
  );
}

export default function LectureFinderApp() {
  /* ── Dark mode ── */
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  /* ── Auth ── */
  const [token, setToken] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── Search ── */
  const [minStudents, setMinStudents] = useState('');
  const [erpId, setErpId] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  /* ── Layout ── */
  const [activeTab, setActiveTab] = useState('search');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ── ID Pass ── */
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
      if (item.branches) item.branches.split(',').forEach(b => branches.add(b.trim()));
    });
    return Array.from(branches).filter(Boolean).sort();
  }, [idPassList]);

  const fetchIdPass = async () => {
    setDbLoading(true); setDbError('');
    try {
      const { data, error } = await supabase.from('id_pass').select('*');
      if (error) throw error;
      setIdPassList(data || []);
    } catch (err) { setDbError(err.message); }
    setDbLoading(false);
  };

  const handleSaveIdPass = async (e) => {
    e.preventDefault(); setDbLoading(true); setDbError('');
    try {
      if (isEditingDb) {
        const { error } = await supabase
          .from('id_pass')
          .update({ id: idPassForm.id, name: idPassForm.name, branches: idPassForm.branches })
          .eq('id', originalEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('id_pass')
          .insert([{ id: idPassForm.id, name: idPassForm.name, branches: idPassForm.branches }]);
        if (error) throw error;
      }

      setIdPassForm({ id: '', name: '', branches: '' });
      setIsEditingDb(false); setOriginalEditId(null); setShowIdPassForm(false);
      fetchIdPass();
    } catch (err) { setDbError(err.message); }
    setDbLoading(false);
  };

  const editIdPass = (item) => { setIdPassForm(item); setOriginalEditId(item.id); setIsEditingDb(true); setShowIdPassForm(true); };
  const cancelEdit = () => { setIdPassForm({ id: '', name: '', branches: '' }); setIsEditingDb(false); setOriginalEditId(null); setShowIdPassForm(false); };

  const handleDeleteIdPass = async (id) => {
    if (!window.confirm(`Are you sure you want to delete the record for ID: ${id}?`)) return;
    setDbLoading(true); setDbError('');
    try {
      const { error } = await supabase
        .from('id_pass')
        .delete()
        .eq('id', id);
      if (error) throw error;

      cancelEdit();
      fetchIdPass();
    } catch (err) {
      setDbError(err.message);
    }
    setDbLoading(false);
  };

  const filteredIdPassList = React.useMemo(() => idPassList.filter(item => {
    const sm = !dbSearchQuery || item.id.toLowerCase().includes(dbSearchQuery.toLowerCase()) || item.name.toLowerCase().includes(dbSearchQuery.toLowerCase());
    const bm = !dbSelectedBranch || (item.branches && item.branches.split(',').map(b => b.trim()).includes(dbSelectedBranch));
    return sm && bm;
  }), [idPassList, dbSearchQuery, dbSelectedBranch]);

  React.useEffect(() => {
    if (token && activeTab === 'idpass') fetchIdPass();
    // eslint-disable-next-line
  }, [token, activeTab]);

  const handleCopyLink = (lectureId) => {
    const link = `http://erp.tcetmumbai.in/TimeTable/Test/AttendanceStudListRegularNew.aspx?subid=11068&sec=AIML-B&subjt=BAI(THEORY)PCC%20-%20AIML403&Time=08:30%20AM%C2%B5TO%C2%B509:30%20AM%C2%B5%C2%B5(1)%C2%B5%C2%B5[REGULAR]%20(ALL)&applno=1&sectid=276&perdsqno=1&perdType=REGULAR&BatchdeId=8942&exttid=0&seqno=1023054&seqnointer=1013555&Date=04/02/2026&periodstatus=NOTMARKED&tdsplanID=39787&SEMESTERMSTID=4&STUMRKLOCKID=${lectureId}&STATUS=PERIOD_TAKEN&Remark=&Centrecode=TENGG_SC&SUB_STATUS=&ATTEND_LOCK=N&DATE_QUESTR=`;
    navigator.clipboard.writeText(link).then(() => { setCopiedId(lectureId); setTimeout(() => setCopiedId(null), 2000); });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError(''); setLoginLoading(true);
    try {
      // Hardcoded login bypasses the old Hugging Face backend entirely
      if (loginId !== 'admin' || loginPassword !== '#7Attendance') {
        throw new Error('Invalid credentials');
      }
      setToken('logged_in'); // Any truthy local token un-hides the UI
      setLoginId(''); setLoginPassword('');
    } catch (err) { setLoginError(err.message); }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setToken(null); setResults([]); setSearched(false);
    setMinStudents(''); setErpId(''); setName(''); setStatus(''); setError('');
  };

  const handleSearch = async () => {
    if (!token) { setError('Please log in first'); return; }
    setLoading(true); setError(''); setSearched(true);
    try {
      let query = supabase.from('attendance').select('*, lectures!inner(lecture_id, total_students, remark)');

      if (erpId) query = query.ilike('erp_id', `%${erpId}%`);
      if (name) query = query.ilike('name', `%${name}%`);
      if (status) query = query.eq('status', status);
      if (minStudents) query = query.gte('lectures.total_students', parseInt(minStudents));

      const { data, error } = await query;
      if (error) throw error;

      // Group flat attendance rows by their respective lecture so the UI stays the same
      const grouped = {};
      data.forEach(row => {
        const l_id = row.lecture_id;
        if (!grouped[l_id]) {
          grouped[l_id] = {
            lecture_id: l_id,
            total_students: row.lectures.total_students,
            remark: row.lectures.remark,
            matching_students: [],
            match_count: 0
          };
        }
        grouped[l_id].matching_students.push({
          erp_id: row.erp_id,
          name: row.name,
          roll_no: row.roll_no,
          status: row.status
        });
        grouped[l_id].match_count += 1;
      });

      setResults(Object.values(grouped));
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleReset = () => { setMinStudents(''); setErpId(''); setName(''); setStatus(''); setResults([]); setSearched(false); setError(''); };

  /* ─────────── Shared style helpers ─────────── */
  const S = {
    flex: { display: 'flex' },
    col: { display: 'flex', flexDirection: 'column' },
    center: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    between: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  };

  /* ─────────── LOGIN PAGE ─────────── */
  if (!token) {
    return (
      <div className="glass-root" style={{ ...S.center, minHeight: '100vh' }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Mode toggle top-right */}
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}>
          <ModeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        </div>

        <div style={{ width: '100%', maxWidth: 400, padding: '0 20px', position: 'relative', zIndex: 1 }} className="animate-fadeUp">

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--accent)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              boxShadow: '0 8px 24px rgba(232,98,26,0.35)'
            }}>
              <Search size={24} color="#fff" />
            </div>
            <h1 style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: 28, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.03em'
            }}>
              Lecture Finder
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Admin Portal</p>
          </div>

          {/* Card */}
          <div className="glass-card" style={{ padding: 32 }}>
            <form onSubmit={handleLogin}>
              <div style={{ ...S.col, gap: 18 }}>
                <div>
                  <label className="label">Admin ID</label>
                  <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)}
                    placeholder="Enter admin ID" className="glass-input" required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••" className="glass-input" required />
                </div>

                {loginError && (
                  <div className="glass-error">
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{loginError}</span>
                  </div>
                )}

                <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
            For authorised use only
          </p>
        </div>
      </div>
    );
  }

  /* ─────────── MAIN APP ─────────── */
  return (
    <div className="glass-root" style={{ ...S.flex }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <div className={`glass-sidebar app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Sidebar header */}
        <div style={{ ...S.between, padding: '22px 18px 18px', borderBottom: '1px solid var(--divider)' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Admin Panel
          </span>
          <button onClick={() => setIsSidebarOpen(false)} className="btn-icon desktop-hide">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '14px 10px', ...S.col, gap: 4, flex: 1 }}>
          <button onClick={() => { setActiveTab('search'); setIsSidebarOpen(false); }}
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}>
            <Search size={16} /> Search Lectures
          </button>
          <button onClick={() => { setActiveTab('idpass'); setIsSidebarOpen(false); }}
            className={`nav-item ${activeTab === 'idpass' ? 'active' : ''}`}>
            <Contact size={16} /> ID Pass DB
          </button>
        </nav>

        {/* Mode toggle + logout */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid var(--divider)', ...S.col, gap: 8 }}>
          <div style={{ padding: '0 4px' }} className="desktop-hide">
            <ModeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>
          <button onClick={handleLogout} className="btn-danger">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, ...S.col, minWidth: 0, maxHeight: '100vh', overflowY: 'auto', position: 'relative', zIndex: 1 }}>

        {/* Mobile header */}
        <div className="glass-mobile-header mobile-header" style={{
          ...S.flex, alignItems: 'center', padding: '12px 16px',
          position: 'sticky', top: 0, zIndex: 30
        }}>
          <button onClick={() => setIsSidebarOpen(true)} className="btn-icon">
            <Menu size={18} />
          </button>
          <span style={{ marginLeft: 12, fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
            {activeTab === 'search' ? 'Lecture Finder' : 'ID Pass Database'}
          </span>
          <div style={{ marginLeft: 'auto' }}>
            <ModeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>
        </div>

        {/* Desktop top-right controls */}
        <div className="desktop-only" style={{ padding: '24px 32px 0 0', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <ModeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        </div>

        <div className="main-content-layout" style={{ width: '100%' }}>

          {/* ════ SEARCH TAB ════ */}
          {activeTab === 'search' && (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  fontSize: 38, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.03em'
                }}>Lecture Finder</h1>
                <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Search and manage lectures</p>
              </div>

              {/* Search card */}
              <div className="glass-card animate-fadeUp" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ ...S.flex, alignItems: 'center', gap: 9, marginBottom: 24 }}>
                  <Filter size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>Filter Lectures</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                  {[
                    { label: 'Min. Students', val: minStudents, set: setMinStudents, type: 'number', ph: 'e.g. 30' },
                    { label: 'ERP ID', val: erpId, set: setErpId, type: 'text', ph: 'e.g. 1032252630' },
                    { label: 'Student Name', val: name, set: setName, type: 'text', ph: 'e.g. Kevin Pimenta' },
                  ].map(({ label, val, set, type, ph }) => (
                    <div key={label}>
                      <label className="label">{label}</label>
                      <input type={type} value={val} onChange={e => set(e.target.value)}
                        placeholder={ph} className="glass-input" />
                    </div>
                  ))}
                  <div>
                    <label className="label">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="glass-input" style={{ cursor: 'pointer' }}>
                      <option value="">— Any Status —</option>
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="NOTMARKED">Not Marked</option>
                    </select>
                  </div>
                </div>

                <div style={{ ...S.flex, gap: 10 }}>
                  <button onClick={handleSearch} disabled={loading} className="btn-accent" style={{ flex: 1 }}>
                    <Search size={16} /> {loading ? 'Searching…' : 'Search'}
                  </button>
                  <button onClick={handleReset} className="btn-secondary">
                    <X size={15} /> Reset
                  </button>
                </div>

                {error && (
                  <div className="glass-error" style={{ marginTop: 16 }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Results */}
              {searched && (
                <div className="glass-card animate-fadeUp" style={{ padding: 28 }}>
                  <div style={{ ...S.between, marginBottom: 20 }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
                      Results
                    </span>
                    <span className="badge">{results.length} found</span>
                  </div>

                  {results.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 15 }}>
                      No lectures match your criteria.
                    </div>
                  ) : (
                    <div style={{ ...S.col, gap: 12 }}>
                      {results.map((lecture) => {
                        const lid = lecture.strmlkid || lecture.lecture_id;
                        return (
                          <div key={lid} className="result-card">
                            <div style={{ ...S.flex, alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent-text)' }}>
                                Lecture ID: {lid}
                              </span>
                              <button onClick={() => handleCopyLink(lid)} className="btn-icon" title="Copy Link">
                                {copiedId === lid
                                  ? <Check size={14} style={{ color: '#16a34a' }} />
                                  : <Copy size={14} />}
                              </button>
                            </div>

                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '3px 0' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Total Students: </span>
                              {lecture.total_students}
                            </p>

                            {lecture.remark && (
                              <p style={{ fontSize: 14, color: '#c07a20', margin: '3px 0' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Remark: </span>{lecture.remark}
                              </p>
                            )}

                            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 14, marginTop: 14 }}>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, ...S.flex, alignItems: 'center', gap: 5 }}>
                                <Users size={13} /> Matching Students ({lecture.match_count})
                              </p>
                              <div style={{ ...S.col, gap: 7 }}>
                                {lecture.matching_students.map((student, idx) => (
                                  <div key={idx} className="student-card">
                                    <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>
                                      <span style={{ color: 'var(--text-muted)' }}>Name: </span>{student.name}
                                    </p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                      Roll: {student.roll_no} · {student.status}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ════ ID PASS TAB ════ */}
          {activeTab === 'idpass' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  fontSize: 38, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.03em'
                }}>ID Pass Database</h1>
                <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Manage student ID records</p>
              </div>

              {/* Controls */}
              <div style={{ ...S.flex, flexWrap: 'wrap', gap: 16, marginBottom: 20, alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={() => { setIdPassForm({ id: '', name: '', branches: '' }); setIsEditingDb(false); setOriginalEditId(null); setShowIdPassForm(true); }}
                  className="btn-accent"
                >
                  + Add Record
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, flex: 1, minWidth: 280, width: '100%', maxWidth: '100%' }} className="responsive-controls">
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="text" value={dbSearchQuery} onChange={e => setDbSearchQuery(e.target.value)}
                      placeholder="Search ID or Name…" className="glass-input" style={{ paddingLeft: 36, width: '100%' }} />
                  </div>
                  <select value={dbSelectedBranch} onChange={e => setDbSelectedBranch(e.target.value)}
                    className="glass-input" style={{ width: 150, cursor: 'pointer' }}>
                    <option value="">All Branches</option>
                    {availableBranches.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Form Modal */}
              {showIdPassForm && (
                <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 50, ...S.center, padding: 16 }}>
                  <div className="glass-card animate-scaleIn" style={{ padding: 28, width: '100%', maxWidth: 430, position: 'relative', overflow: 'visible' }}>
                    <button onClick={cancelEdit} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
                      <X size={16} />
                    </button>
                    <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 22 }}>
                      {isEditingDb ? 'Edit Record' : 'Add New Record'}
                    </h2>

                    <form onSubmit={handleSaveIdPass} style={{ ...S.col, gap: 16 }}>
                      {[
                        { label: 'ID', key: 'id', type: 'text' },
                        { label: 'Name', key: 'name', type: 'text' },
                      ].map(({ label, key, type }) => (
                        <div key={key}>
                          <label className="label">{label}</label>
                          <input type={type} value={idPassForm[key]}
                            onChange={e => setIdPassForm({ ...idPassForm, [key]: e.target.value })}
                            required className="glass-input" />
                        </div>
                      ))}

                      <div>
                        <label className="label">Branch(s)</label>
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              minHeight: 48, padding: '8px 12px',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--input-border)',
                              borderRadius: 14, display: 'flex', flexWrap: 'wrap',
                              gap: 6, alignItems: 'center', cursor: 'text'
                            }}
                            onClick={() => setBranchDropdownOpen(true)}
                          >
                            {idPassForm.branches.split(',').filter(Boolean).map(b => b.trim()).map((branch, idx) => (
                              <span key={idx} className="branch-tag">
                                {branch}
                                <X size={12} style={{ cursor: 'pointer' }} onClick={e => {
                                  e.stopPropagation();
                                  const nb = idPassForm.branches.split(',').map(b => b.trim()).filter(b => b && b !== branch).join(', ');
                                  setIdPassForm({ ...idPassForm, branches: nb });
                                }} />
                              </span>
                            ))}
                            <input
                              type="text"
                              value={newBranchInput}
                              onChange={e => { setNewBranchInput(e.target.value); setBranchDropdownOpen(true); }}
                              onFocus={() => setBranchDropdownOpen(true)}
                              onBlur={() => setTimeout(() => setBranchDropdownOpen(false), 200)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newBranchInput.trim()) {
                                    const cb = idPassForm.branches.split(',').map(b => b.trim()).filter(Boolean);
                                    if (!cb.includes(newBranchInput.trim())) cb.push(newBranchInput.trim());
                                    setIdPassForm({ ...idPassForm, branches: cb.join(', ') });
                                    setNewBranchInput('');
                                  }
                                }
                              }}
                              placeholder={idPassForm.branches ? '' : 'Select or type…'}
                              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', flex: 1, minWidth: 100, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                            />
                          </div>

                          <input type="text" name="branches" value={idPassForm.branches} readOnly required style={{ opacity: 0, position: 'absolute', height: 0, width: 0, zIndex: -1 }} />

                          {branchDropdownOpen && (
                            <div className="glass-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 180, overflowY: 'auto', zIndex: 50 }}>
                              {availableBranches.filter(b => b.toLowerCase().includes(newBranchInput.toLowerCase()) && !idPassForm.branches.split(',').map(x => x.trim()).includes(b)).map((branch, idx) => (
                                <div key={idx} className="glass-dropdown-item" onClick={() => {
                                  const cb = idPassForm.branches.split(',').map(b => b.trim()).filter(Boolean);
                                  if (!cb.includes(branch)) cb.push(branch);
                                  setIdPassForm({ ...idPassForm, branches: cb.join(', ') });
                                  setNewBranchInput(''); setBranchDropdownOpen(false);
                                }}>{branch}</div>
                              ))}
                              {newBranchInput.trim() && !availableBranches.includes(newBranchInput.trim()) && (
                                <div className="glass-dropdown-item" style={{ color: 'var(--accent-text)', fontStyle: 'italic' }} onClick={() => {
                                  const cb = idPassForm.branches.split(',').map(b => b.trim()).filter(Boolean);
                                  if (!cb.includes(newBranchInput.trim())) cb.push(newBranchInput.trim());
                                  setIdPassForm({ ...idPassForm, branches: cb.join(', ') });
                                  setNewBranchInput(''); setBranchDropdownOpen(false);
                                }}>Add "{newBranchInput.trim()}"</div>
                              )}
                              {!newBranchInput.trim() && availableBranches.filter(b => !idPassForm.branches.split(',').map(x => x.trim()).includes(b)).length === 0 && (
                                <div className="glass-dropdown-item" style={{ color: 'var(--text-muted)' }}>Type to add a new branch.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {dbError && (
                        <div className="glass-error"><span>{dbError}</span></div>
                      )}

                      <div style={{ ...S.flex, gap: 10, paddingTop: 4 }}>
                        <button type="submit" disabled={dbLoading} className="btn-accent" style={{ flex: 1 }}>
                          {dbLoading ? 'Saving…' : 'Save'}
                        </button>
                        <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>
                      </div>

                      {isEditingDb && (
                        <div style={{ paddingTop: 16, marginTop: 4, borderTop: '1px solid var(--divider)', display: 'flex' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteIdPass(originalEditId)}
                            disabled={dbLoading}
                            className="btn-danger"
                            style={{ flex: 1 }}
                          >
                            <Trash2 size={15} /> {dbLoading ? 'Deleting…' : 'Delete Record'}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="glass-card" style={{ overflow: 'hidden', ...S.col, maxHeight: 'calc(100vh - 260px)' }}>
                <div style={{ ...S.between, padding: '18px 22px', borderBottom: '1px solid var(--divider)' }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Records</span>
                  <span className="badge">{filteredIdPassList.length} total</span>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Branch(s)</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIdPassList.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '44px 16px', color: 'var(--text-muted)', fontSize: 14 }}>
                            {dbLoading ? 'Loading records…' : 'No records found.'}
                          </td>
                        </tr>
                      ) : filteredIdPassList.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{item.id}</td>
                          <td>{item.name}</td>
                          <td><span className="branch-tag">{item.branches}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => editIdPass(item)} className="btn-icon" title="Edit">
                              <Edit2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}