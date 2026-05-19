import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Filter, Clock, CheckCircle, Eye, AlertTriangle, Users, MessageSquare, GraduationCap, RefreshCw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import AlertPopup from '../../components/AlertPopup';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock,        dot: 'bg-amber-500' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-800 border-blue-200',    icon: Eye,          dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle, dot: 'bg-emerald-500' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, accent, sub, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-8 w-14 bg-gray-200 animate-pulse rounded mb-1" />
        ) : (
          <div className="text-2xl font-bold text-[#1A2744] leading-tight">{value}</div>
        )}
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
        {sub && !loading && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchData = async () => {
    try {
      setLoadingStats(true);
      setLoadingComplaints(true);
      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/complaints?limit=200')
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data.complaints || complaintsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingStats(false);
      setLoadingComplaints(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Derived data ---
  const categories = useMemo(() => {
    const cats = new Set(complaints.map(c => c.category).filter(Boolean));
    return ['all', ...Array.from(cats).sort()];
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch =
        (c.faculty_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (c.status || 'pending') === statusFilter;
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter]);

  // Category breakdown for the mini chart
  const categoryBreakdown = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      const cat = c.category || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  // Faculty with most complaints
  const facultyRanking = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      const name = c.faculty_name || 'Unknown';
      if (!map[name]) map[name] = { name, total: 0, pending: 0 };
      map[name].total++;
      if ((c.status || 'pending') === 'pending') map[name].pending++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [complaints]);

  // --- Actions ---
  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingStatus(complaintId);
    try {
      await api.patch(`/admin/complaints/${complaintId}/status?status=${newStatus}`);
      setComplaints(prev => prev.map(c =>
        (c.id || c._id) === complaintId ? { ...c, status: newStatus } : c
      ));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const pendingCount = complaints.filter(c => (c.status || 'pending') === 'pending').length;
  const reviewedCount = complaints.filter(c => c.status === 'reviewed').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <AlertPopup />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A2744] tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor complaints, manage faculty, and track resolution progress</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => navigate('/admin/manage')}
              className="bg-[#1A2744] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#111a2e] transition-colors flex items-center gap-2"
            >
              <Users size={16} />
              Manage Faculty
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={MessageSquare} label="Total Complaints" value={stats.total_complaints ?? 0}
            accent="bg-[#1A2744]" sub={`${pendingCount} need attention`} loading={loadingStats} />
          <StatCard icon={Clock} label="Pending" value={pendingCount}
            accent="bg-amber-500" sub="Awaiting review" loading={loadingStats} />
          <StatCard icon={CheckCircle} label="Resolved" value={resolvedCount}
            accent="bg-emerald-500" sub={complaints.length > 0 ? `${Math.round((resolvedCount / complaints.length) * 100)}% rate` : '—'} loading={loadingStats} />
          <StatCard icon={GraduationCap} label="Faculty" value={stats.total_faculty ?? 0}
            accent="bg-indigo-500" sub={`${stats.total_students ?? 0} students`} loading={loadingStats} />
        </div>

        {/* Middle Section: Category Breakdown + Faculty Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Complaints by Category</h3>
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400">No complaints yet</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(([cat, count]) => {
                  const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{cat}</span>
                        <span className="text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#1A2744] h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Faculty Ranking */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Faculty — Most Complaints</h3>
            {facultyRanking.length === 0 ? (
              <p className="text-sm text-gray-400">No complaints yet</p>
            ) : (
              <div className="space-y-3">
                {facultyRanking.map((f, i) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-red-100 text-red-700' : i === 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.total} total · {f.pending} pending</div>
                    </div>
                    {f.total >= 5 && (
                      <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Complaints Table Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">
                All Complaints
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredComplaints.length} of {complaints.length})
                </span>
              </h2>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none sm:w-56">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg py-2 pl-8 pr-8 text-sm bg-white focus:outline-none focus:border-[#1A2744] cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                </div>

                {/* Category Filter */}
                {categories.length > 2 && (
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm bg-white focus:outline-none focus:border-[#1A2744] cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                  </div>
                )}
              </div>
            </div>

            {/* Status Tab Pills */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {[
                { key: 'all', label: 'All', count: complaints.length },
                { key: 'pending', label: 'Pending', count: pendingCount },
                { key: 'reviewed', label: 'Reviewed', count: reviewedCount },
                { key: 'resolved', label: 'Resolved', count: resolvedCount },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-[#1A2744] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="py-3 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Faculty</th>
                  <th className="py-3 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="py-3 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-5 font-semibold text-xs text-gray-500 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingComplaints ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-4 px-5"><div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
                      <p className="text-gray-500 font-medium">No complaints found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Complaints will appear here when students submit them'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint, index) => {
                    const cid = complaint.id || complaint._id || index;
                    const status = complaint.status || 'pending';
                    const isExpanded = expandedRow === cid;
                    return (
                      <React.Fragment key={cid}>
                        <tr
                          onClick={() => toggleRow(cid)}
                          className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}
                        >
                          <td className="py-3.5 px-5 text-sm text-gray-900 font-medium">
                            {complaint.student_name || 'Anonymous'}
                          </td>
                          <td className="py-3.5 px-5 text-sm text-gray-700">
                            {complaint.faculty_name}
                          </td>
                          <td className="py-3.5 px-5 text-sm">
                            <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs text-gray-700 font-medium">
                              {complaint.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-sm text-gray-700 max-w-[200px] truncate">
                            {complaint.subject}
                          </td>
                          <td className="py-3.5 px-5">
                            <StatusBadge status={status} />
                          </td>
                          <td className="py-3.5 px-5 text-sm text-gray-500">
                            {new Date(complaint.timestamp || complaint.createdAt || complaint.date).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {isExpanded ? <ChevronUp size={16} className="inline text-gray-400" /> : <ChevronDown size={16} className="inline text-gray-400" />}
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr className="bg-[#f8fafc]">
                            <td colSpan="7" className="py-5 px-5">
                              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                                {/* Description */}
                                <div className="pl-4 border-l-3 border-[#1A2744]">
                                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Description</p>
                                  <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                    {complaint.description}
                                  </p>
                                </div>

                                {/* Status Actions */}
                                <div className="flex flex-col gap-2 min-w-[160px]">
                                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Update Status</p>
                                  {['pending', 'reviewed', 'resolved'].map(s => {
                                    const cfg = STATUS_CONFIG[s];
                                    const isCurrent = status === s;
                                    const isUpdating = updatingStatus === cid;
                                    return (
                                      <button
                                        key={s}
                                        onClick={(e) => { e.stopPropagation(); if (!isCurrent) handleStatusChange(cid, s); }}
                                        disabled={isCurrent || isUpdating}
                                        className={`text-xs px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                          isCurrent
                                            ? `${cfg.color} border cursor-default`
                                            : 'border border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                                        } ${isUpdating ? 'opacity-50' : ''}`}
                                      >
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        {cfg.label}
                                        {isCurrent && <span className="text-[10px] ml-auto opacity-60">Current</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
