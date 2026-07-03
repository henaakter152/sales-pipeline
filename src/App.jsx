import React, { useState, useMemo } from 'react';
import {
  Search, BarChart3, Layers, Users, Calendar, TrendingUp, DollarSign, Target, Trophy, Flame,
  Building2, Mail, Phone, Plus, Trash2, X, ChevronRight, Activity, CheckCircle2, Circle,
  PhoneCall, Mails, CalendarDays, StickyNote, ListTodo, Briefcase
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function safe(v) { return String(v ?? '').trim(); }
function fmtMoney(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'k';
  return '$' + v.toLocaleString();
}
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return safe(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function daysUntil(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - Date.now()) / 86400000);
}

const ACCENT = { lilac: '#B8A9E8', amber: '#F5A623', teal: '#4ECDC4', coral: '#FF6B6B', green: '#4ADE80', ink: '#1A1A1A' };

// Standalone mock data (runs without Zaro)
const MOCK_DEALS = [
  { id: 1, name: 'Enterprise Platform Migration', company: 'TechCorp Inc.', contact: 'Sarah Chen', amount: 85000, stage: 'negotiation', probability: 70, owner: 'Hena Akter', source: 'inbound', close_date: '2026-07-30', created_at: '2026-06-01', notes: 'Finalizing contract terms.' },
  { id: 2, name: 'Cloud Infrastructure Setup', company: 'DataFlow Ltd', contact: 'Mike Ross', amount: 120000, stage: 'proposal', probability: 55, owner: 'Hena Akter', source: 'referral', close_date: '2026-08-15', created_at: '2026-06-10', notes: 'Proposal sent, awaiting feedback.' },
  { id: 3, name: 'CRM Implementation', company: 'RetailMax', contact: 'Anna White', amount: 45000, stage: 'qualified', probability: 40, owner: 'Hena Akter', source: 'outbound', close_date: '2026-09-01', created_at: '2026-06-20', notes: '' },
  { id: 4, name: 'Security Audit Package', company: 'SecureNet', contact: 'Tom Hardy', amount: 65000, stage: 'lead', probability: 15, owner: 'Hena Akter', source: 'event', close_date: '2026-10-10', created_at: '2026-07-01', notes: 'Initial contact at security conference.' },
  { id: 5, name: 'Mobile App Development', company: 'AppNova', contact: 'Lisa Park', amount: 95000, stage: 'won', probability: 100, owner: 'Hena Akter', source: 'inbound', close_date: '2026-06-15', created_at: '2026-05-01', notes: 'Signed and onboarding.' },
  { id: 6, name: 'Data Analytics Platform', company: 'InsightIQ', contact: 'Raj Patel', amount: 75000, stage: 'lost', probability: 0, owner: 'Hena Akter', source: 'partner', close_date: '2026-06-30', created_at: '2026-05-15', notes: 'Lost to competitor.' },
  { id: 7, name: 'E-commerce Overhaul', company: 'ShopFlow', contact: 'Emily Davis', amount: 110000, stage: 'proposal', probability: 55, owner: 'Hena Akter', source: 'inbound', close_date: '2026-08-20', created_at: '2026-06-25', notes: '' },
];

const MOCK_CONTACTS = [
  { id: 1, name: 'Sarah Chen', company: 'TechCorp Inc.', title: 'CTO', email: 'sarah@techcorp.com', phone: '+1 (415) 555-0101', tier: 'hot', last_contact: '2026-07-01' },
  { id: 2, name: 'Mike Ross', company: 'DataFlow Ltd', title: 'VP Engineering', email: 'mike@dataflow.io', phone: '+1 (415) 555-0102', tier: 'warm', last_contact: '2026-06-28' },
  { id: 3, name: 'Anna White', company: 'RetailMax', title: 'Director of IT', email: 'anna@retailmax.com', phone: '+1 (415) 555-0103', tier: 'warm', last_contact: '2026-06-25' },
  { id: 4, name: 'Tom Hardy', company: 'SecureNet', title: 'CISO', email: 'tom@securenet.com', phone: '+1 (415) 555-0104', tier: 'cold', last_contact: '2026-06-15' },
  { id: 5, name: 'Lisa Park', company: 'AppNova', title: 'CEO', email: 'lisa@appnova.com', phone: '+1 (415) 555-0105', tier: 'hot', last_contact: '2026-07-02' },
  { id: 6, name: 'Raj Patel', company: 'InsightIQ', title: 'Head of Data', email: 'raj@insightiq.com', phone: '+1 (415) 555-0106', tier: 'cold', last_contact: '2026-06-10' },
  { id: 7, name: 'Emily Davis', company: 'ShopFlow', title: 'COO', email: 'emily@shopflow.com', phone: '+1 (415) 555-0107', tier: 'warm', last_contact: '2026-06-30' },
];

const MOCK_ACTIVITIES = [
  { id: 1, deal_id: 1, type: 'call', subject: 'Contract negotiation call', date: '2026-07-03', owner: 'Hena Akter', done: false },
  { id: 2, deal_id: 1, type: 'email', subject: 'Sent revised terms', date: '2026-07-01', owner: 'Hena Akter', done: true },
  { id: 3, deal_id: 2, type: 'meeting', subject: 'Proposal review meeting', date: '2026-07-05', owner: 'Hena Akter', done: false },
  { id: 4, deal_id: 3, type: 'task', subject: 'Prepare demo environment', date: '2026-07-04', owner: 'Hena Akter', done: false },
  { id: 5, deal_id: 4, type: 'note', subject: 'Follow up after conference', date: '2026-07-02', owner: 'Hena Akter', done: true },
  { id: 6, deal_id: 7, type: 'call', subject: 'Initial discovery call', date: '2026-07-06', owner: 'Hena Akter', done: false },
];

const STAGES = [
  { id: 'lead',        label: 'Lead',        color: ACCENT.lilac, text: '#5B21B6' },
  { id: 'qualified',   label: 'Qualified',   color: ACCENT.teal,  text: '#115E59' },
  { id: 'proposal',    label: 'Proposal',    color: ACCENT.amber, text: '#92400E' },
  { id: 'negotiation', label: 'Negotiation', color: ACCENT.coral, text: '#DC2626' },
  { id: 'won',         label: 'Won',         color: ACCENT.green, text: '#166534' },
  { id: 'lost',        label: 'Lost',        color: '#9B9B9B',    text: '#6B6B6B' },
];
const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.id, s]));

const TIER_META = {
  hot:  { color: ACCENT.coral, text: '#DC2626', icon: Flame },
  warm: { color: ACCENT.amber, text: '#92400E', icon: TrendingUp },
  cold: { color: ACCENT.teal,  text: '#115E59', icon: Circle },
};

const ACTIVITY_META = {
  call:    { color: ACCENT.teal,  text: '#115E59', icon: PhoneCall },
  email:   { color: ACCENT.lilac, text: '#5B21B6', icon: Mails },
  meeting: { color: ACCENT.amber, text: '#92400E', icon: CalendarDays },
  note:    { color: ACCENT.green, text: '#166534', icon: StickyNote },
  task:    { color: ACCENT.coral, text: '#DC2626', icon: ListTodo },
};

export default function App() {
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);

  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showNewDeal, setShowNewDeal] = useState(false);

  // ---- Derived ----
  const owners = useMemo(() => [...new Set(deals.map(d => safe(d.owner)).filter(Boolean))], [deals]);

  const filteredDeals = useMemo(() =>
    deals
      .filter(d => !search
        || safe(d.name).toLowerCase().includes(search.toLowerCase())
        || safe(d.company).toLowerCase().includes(search.toLowerCase())
        || safe(d.contact).toLowerCase().includes(search.toLowerCase()))
      .filter(d => stageFilter === 'all' || safe(d.stage) === stageFilter)
      .filter(d => ownerFilter === 'all' || safe(d.owner) === ownerFilter),
    [deals, search, stageFilter, ownerFilter]);

  const totalPipeline = deals.filter(d => !['won', 'lost'].includes(safe(d.stage))).reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const weighted = deals.filter(d => !['won', 'lost'].includes(safe(d.stage))).reduce((s, d) => s + (Number(d.amount) || 0) * (Number(d.probability) || 0) / 100, 0);
  const wonAmount = deals.filter(d => safe(d.stage) === 'won').reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const wonCount = deals.filter(d => safe(d.stage) === 'won').length;
  const closedCount = deals.filter(d => ['won', 'lost'].includes(safe(d.stage))).length;
  const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;
  const openCount = deals.filter(d => !['won', 'lost'].includes(safe(d.stage))).length;

  const stageBreakdown = STAGES.map(s => {
    const rows = deals.filter(d => safe(d.stage) === s.id);
    return { ...s, count: rows.length, value: rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) };
  });

  const pipelineByStage = stageBreakdown.filter(s => !['won', 'lost'].includes(s.id));

  const forecastByMonth = useMemo(() => {
    const map = {};
    deals.filter(d => !['lost'].includes(safe(d.stage))).forEach(d => {
      const dt = new Date(d.close_date);
      if (isNaN(dt.getTime())) return;
      const key = dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { month: key, weighted: 0, closed: 0, order: dt.getTime() };
      const amt = Number(d.amount) || 0;
      if (safe(d.stage) === 'won') map[key].closed += amt;
      else map[key].weighted += amt * (Number(d.probability) || 0) / 100;
    });
    return Object.values(map).sort((a, b) => a.order - b.order);
  }, [deals]);

  const upcomingActivities = useMemo(() =>
    activities
      .filter(a => !a.done)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8),
    [activities]);

  const topDeals = useMemo(() =>
    deals.filter(d => !['won', 'lost'].includes(safe(d.stage)))
      .sort((a, b) => (Number(b.amount) || 0) * (Number(b.probability) || 0) - (Number(a.amount) || 0) * (Number(a.probability) || 0))
      .slice(0, 5),
    [deals]);

  const ownerLeaderboard = useMemo(() => {
    const map = {};
    deals.forEach(d => {
      const o = safe(d.owner) || 'Unassigned';
      if (!map[o]) map[o] = { owner: o, pipeline: 0, won: 0, deals: 0 };
      map[o].deals += 1;
      const amt = Number(d.amount) || 0;
      if (safe(d.stage) === 'won') map[o].won += amt;
      else if (safe(d.stage) !== 'lost') map[o].pipeline += amt;
    });
    return Object.values(map).sort((a, b) => (b.pipeline + b.won) - (a.pipeline + a.won));
  }, [deals]);

  // ---- Actions ----
  function updateStage(deal, newStage) {
    const prob = { lead: 15, qualified: 40, proposal: 55, negotiation: 70, won: 100, lost: 0 }[newStage] ?? deal.probability;
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: newStage, probability: prob } : d));
    setSelectedDeal(sd => sd && sd.id === deal.id ? { ...sd, stage: newStage, probability: prob } : sd);
    // Stage updated locally
  }

  function deleteDeal(deal) {
    setDeals(prev => prev.filter(d => d.id !== deal.id));
    setSelectedDeal(null);
    // Deal deleted locally
  }

  function addDeal(form) {
    const nextId = (deals.reduce((m, d) => Math.max(m, Number(d.id) || 0), 0)) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const row = {
      id: nextId,
      name: form.name || 'Untitled deal',
      company: form.company || '',
      contact: form.contact || '',
      amount: Number(form.amount) || 0,
      stage: form.stage || 'lead',
      probability: Number(form.probability) || 15,
      owner: form.owner || (owners[0] || 'Hena Akter'),
      source: form.source || 'inbound',
      close_date: form.close_date || today,
      created_at: today,
      notes: form.notes || ''
    };
    setDeals(prev => [...prev, row]);
    setShowNewDeal(false);
    // Deal added locally
  }

  function toggleActivity(act) {
    const newDone = !act.done;
    setActivities(prev => prev.map(a => a.id === act.id ? { ...a, done: newDone } : a));
    // Activity toggled locally
  }

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: BarChart3 },
    { id: 'pipeline',  label: 'Pipeline',  icon: Layers },
    { id: 'deals',     label: 'Deals',     icon: Briefcase },
    { id: 'contacts',  label: 'Contacts',  icon: Users },
    { id: 'activity',  label: 'Activity',  icon: Calendar },
  ];

  const stats = [
    { l: 'Open pipeline', v: fmtMoney(totalPipeline), sub: `${openCount} deals`,       i: Layers,     c: ACCENT.lilac },
    { l: 'Weighted',      v: fmtMoney(weighted),      sub: 'probability adjusted',      i: Target,     c: ACCENT.amber },
    { l: 'Closed won',    v: fmtMoney(wonAmount),     sub: `${wonCount} deals`,         i: Trophy,     c: ACCENT.green },
    { l: 'Win rate',      v: winRate + '%',           sub: `${closedCount} closed`,     i: TrendingUp, c: ACCENT.teal  },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
                <DollarSign size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Sales Pipeline</h1>
                <p className="text-[11px] text-[#9B9B9B] mt-0.5">{deals.length} deals · {fmtMoney(totalPipeline)} open pipeline</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewDeal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#B8A9E8] text-[#1A1A1A] rounded-full text-sm font-semibold hover:bg-[#A89AD8] shadow-sm hover:shadow-md transition-all duration-200">
              <Plus size={14} /> New deal
            </button>
          </div>
          <div className="flex gap-1 mt-5 bg-[#F0F0F0]/60 rounded-full p-1 w-fit">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${active ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}>
                  <Icon size={14} />{t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div key={activeTab} className="animate-[fadeIn_300ms_ease-out]">

          {/* ---------------- OVERVIEW ---------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => {
                  const Icon = s.i;
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-[#F0F0F0] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.c + '15' }}>
                          <Icon size={14} style={{ color: s.c }} />
                        </div>
                        <span className="text-2xl font-bold text-[#1A1A1A]">{s.v}</span>
                      </div>
                      <p className="text-[11px] text-[#9B9B9B] font-medium">{s.l}</p>
                      <p className="text-[10px] text-[#9B9B9B] mt-0.5">{s.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Forecast + Stage donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F0F0F0] p-6">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#F5A623]" /> Forecast by month
                  </h3>
                  {forecastByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={forecastByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9B9B9B' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9B9B9B' }} tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'} />
                        <Tooltip formatter={v => fmtMoney(v)} contentStyle={{ borderRadius: 12, border: '1px solid #F0F0F0', fontSize: 12 }} />
                        <Bar dataKey="closed" stackId="a" fill={ACCENT.green} radius={[0, 0, 0, 0]} name="Closed won" />
                        <Bar dataKey="weighted" stackId="a" fill={ACCENT.lilac} radius={[6, 6, 0, 0]} name="Weighted pipeline" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-[#9B9B9B] text-center py-12">No forecast data</p>
                  )}
                  <div className="flex gap-4 mt-3">
                    <span className="text-[11px] text-[#6B6B6B] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ACCENT.green }} /> Closed won
                    </span>
                    <span className="text-[11px] text-[#6B6B6B] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ACCENT.lilac }} /> Weighted pipeline
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Layers size={14} className="text-[#B8A9E8]" /> Stage distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={stageBreakdown.filter(s => s.count > 0)} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {stageBreakdown.filter(s => s.count > 0).map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0F0F0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {stageBreakdown.filter(s => s.count > 0).map(s => (
                      <div key={s.id} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-2 text-[#6B6B6B]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}
                        </span>
                        <span className="text-[#1A1A1A] font-semibold">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top deals + Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Flame size={14} className="text-[#FF6B6B]" /> Top open deals
                  </h3>
                  <div className="space-y-2">
                    {topDeals.map(d => {
                      const s = STAGE_MAP[safe(d.stage)] || STAGE_MAP.lead;
                      return (
                        <button key={d.id} onClick={() => setSelectedDeal(d)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAFAF8] transition-colors text-left">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '15' }}>
                            <Building2 size={14} style={{ color: s.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{safe(d.name)}</p>
                            <p className="text-[11px] text-[#9B9B9B] truncate">{safe(d.company)} · {safe(d.owner)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#1A1A1A]">{fmtMoney(d.amount)}</p>
                            <p className="text-[10px]" style={{ color: s.text }}>{d.probability}%</p>
                          </div>
                        </button>
                      );
                    })}
                    {topDeals.length === 0 && <p className="text-sm text-[#9B9B9B] text-center py-6">No open deals</p>}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Trophy size={14} className="text-[#4ADE80]" /> Rep leaderboard
                  </h3>
                  <div className="space-y-3">
                    {ownerLeaderboard.map((o, i) => {
                      const maxTotal = Math.max(...ownerLeaderboard.map(x => x.pipeline + x.won), 1);
                      const total = o.pipeline + o.won;
                      const pct = (total / maxTotal) * 100;
                      const colors = [ACCENT.lilac, ACCENT.amber, ACCENT.teal, ACCENT.coral, ACCENT.green];
                      const c = colors[i % colors.length];
                      return (
                        <div key={o.owner}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-[#1A1A1A] flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: c + '20', color: c }}>{i + 1}</span>
                              {o.owner}
                            </span>
                            <span className="text-xs font-semibold text-[#1A1A1A]">{fmtMoney(total)}</span>
                          </div>
                          <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: pct + '%', backgroundColor: c }} />
                          </div>
                          <p className="text-[10px] text-[#9B9B9B] mt-1">{o.deals} deals · {fmtMoney(o.won)} won · {fmtMoney(o.pipeline)} open</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- PIPELINE (KANBAN) ---------------- */}
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#F0F0F0] rounded-full bg-white text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:border-[#E0E0E0] focus:ring-2 focus:ring-[#1A1A1A]/5 transition-all"
                    placeholder="Search deals…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="text-sm border border-[#F0F0F0] rounded-full px-4 py-2.5 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
                  value={ownerFilter}
                  onChange={e => setOwnerFilter(e.target.value)}>
                  <option value="all">All owners</option>
                  {owners.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <span className="text-[11px] text-[#9B9B9B] font-medium">{filteredDeals.length} deals</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAGES.filter(s => s.id !== 'lost').map(s => {
                  const stageDeals = filteredDeals.filter(d => safe(d.stage) === s.id);
                  const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
                  return (
                    <div key={s.id} className="bg-[#FAFAF8] rounded-2xl border border-[#F0F0F0] p-3 min-h-[400px]">
                      <div className="flex items-center justify-between px-2 py-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-sm font-semibold text-[#1A1A1A]">{s.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: s.color + '1A', color: s.text }}>{stageDeals.length}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#6B6B6B]">{fmtMoney(stageValue)}</span>
                      </div>
                      <div className="space-y-2">
                        {stageDeals.map(d => {
                          const dLeft = daysUntil(d.close_date);
                          const urgent = dLeft !== null && dLeft <= 14 && dLeft >= 0;
                          return (
                            <button key={d.id} onClick={() => setSelectedDeal(d)}
                              className="w-full text-left bg-white rounded-xl border border-[#F0F0F0] p-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                              <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2 mb-1.5">{safe(d.name)}</p>
                              <div className="flex items-center gap-1 mb-2">
                                <Building2 size={10} className="text-[#B8A9E8]" />
                                <span className="text-[11px] text-[#6B6B6B] truncate">{safe(d.company)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[#1A1A1A]">{fmtMoney(d.amount)}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border" style={{ backgroundColor: s.color + '1A', color: s.text, borderColor: s.color + '33' }}>{d.probability}%</span>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0F0F0]">
                                <span className="text-[10px] text-[#9B9B9B] flex items-center gap-1">
                                  <Users size={9} className="text-[#B8A9E8]" />{safe(d.owner).split(' ')[0]}
                                </span>
                                <span className={`text-[10px] flex items-center gap-1 ${urgent ? 'text-[#DC2626] font-semibold' : 'text-[#9B9B9B]'}`}>
                                  <Calendar size={9} />{fmtDate(d.close_date)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                        {stageDeals.length === 0 && (
                          <div className="text-center py-6 text-[11px] text-[#9B9B9B]">No deals</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- DEALS TABLE ---------------- */}
          {activeTab === 'deals' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-md min-w-[200px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#F0F0F0] rounded-full bg-white text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:border-[#E0E0E0] focus:ring-2 focus:ring-[#1A1A1A]/5 transition-all"
                    placeholder="Search deals…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="text-sm border border-[#F0F0F0] rounded-full px-4 py-2.5 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}>
                  <option value="all">All stages</option>
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select
                  className="text-sm border border-[#F0F0F0] rounded-full px-4 py-2.5 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
                  value={ownerFilter}
                  onChange={e => setOwnerFilter(e.target.value)}>
                  <option value="all">All owners</option>
                  {owners.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <span className="text-[11px] text-[#9B9B9B] font-medium ml-auto">{filteredDeals.length} results · {fmtMoney(filteredDeals.reduce((s, d) => s + (Number(d.amount) || 0), 0))}</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_120px_100px_110px_120px] gap-3 px-5 py-3 border-b border-[#F0F0F0] bg-[#FAFAF8]">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Deal</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Contact</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Owner</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B] text-right">Amount</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B] text-center">Prob.</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Stage</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">Close</span>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                  {filteredDeals.map(d => {
                    const s = STAGE_MAP[safe(d.stage)] || STAGE_MAP.lead;
                    return (
                      <button key={d.id} onClick={() => setSelectedDeal(d)}
                        className="w-full md:grid md:grid-cols-[2fr_1fr_1fr_120px_100px_110px_120px] gap-3 px-5 py-3.5 hover:bg-[#FAFAF8] transition-colors duration-150 items-center text-left flex flex-col">
                        <div className="flex items-center gap-2 min-w-0 w-full">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{safe(d.name)}</p>
                            <p className="text-[10px] text-[#9B9B9B] truncate">{safe(d.company)}</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#6B6B6B] truncate">{safe(d.contact) || '—'}</span>
                        <span className="text-xs text-[#6B6B6B] flex items-center gap-1 truncate">
                          <Users size={10} className="text-[#B8A9E8]" />{safe(d.owner) || '—'}
                        </span>
                        <span className="text-sm font-semibold text-[#1A1A
A] md:text-right">{fmtMoney(d.amount)}</span>
                        <span className="text-xs text-[#6B6B6B] md:text-center">{d.probability}%</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide border w-fit"
                          style={{ backgroundColor: s.color + '1A', color: s.text, borderColor: s.color + '33' }}>{s.label}</span>
                        <span className="text-xs text-[#6B6B6B] flex items-center gap-1">
                          <Calendar size={10} className="text-[#F5A623]" />{fmtDate(d.close_date)}
                        </span>
                      </button>
                    );
                  })}
                  {filteredDeals.length === 0 && (
                    <div className="text-center py-12">
                      <Briefcase size={28} className="mx-auto mb-3 text-[#E0E0E0]" />
                      <p className="text-sm text-[#9B9B9B]">No deals match your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- CONTACTS ---------------- */}
          {activeTab === 'contacts' && (
            <div className="space-y-5">
              <div className="relative max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#F0F0F0] rounded-full bg-white text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:border-[#E0E0E0] focus:ring-2 focus:ring-[#1A1A1A]/5 transition-all"
                  placeholder="Search contacts…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts
                  .filter(c => !search
                    || safe(c.name).toLowerCase().includes(search.toLowerCase())
                    || safe(c.company).toLowerCase().includes(search.toLowerCase())
                    || safe(c.email).toLowerCase().includes(search.toLowerCase()))
                  .map(c => {
                    const meta = TIER_META[safe(c.tier)] || TIER_META.cold;
                    const Icon = meta.icon;
                    const dealCount = deals.filter(d => safe(d.contact) === safe(c.name)).length;
                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-[#F0F0F0] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm" style={{ backgroundColor: meta.color + '15', color: meta.text }}>
                            {safe(c.name).split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{safe(c.name)}</p>
                            <p className="text-[11px] text-[#6B6B6B] truncate">{safe(c.title)}</p>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border flex items-center gap-1"
                            style={{ backgroundColor: meta.color + '1A', color: meta.text, borderColor: meta.color + '33' }}>
                            <Icon size={9} />{safe(c.tier)}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1.5 text-[11px] text-[#6B6B6B]">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 size={10} className="text-[#B8A9E8]" />{safe(c.company)}
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail size={10} className="text-[#F5A623]" />{safe(c.email)}
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone size={10} className="text-[#4ECDC4]" />{safe(c.phone)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F0F0]">
                          <span className="text-[10px] text-[#9B9B9B]">Last contact {fmtDate(c.last_contact)}</span>
                          <span className="text-[10px] font-semibold text-[#5B21B6] bg-[#B8A9E8]/15 border border-[#B8A9E8]/30 px-2 py-0.5 rounded-full">{dealCount} {dealCount === 1 ? 'deal' : 'deals'}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ---------------- ACTIVITY ---------------- */}
          {activeTab === 'activity' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F0F0F0] p-6">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-[#F5A623]" /> Upcoming & recent
                  </h3>
                  <div className="divide-y divide-[#F0F0F0]">
                    {activities.length === 0 && (
                      <div className="text-center py-8">
                        <Activity size={24} className="mx-auto mb-2 text-[#E0E0E0]" />
                        <p className="text-sm text-[#9B9B9B]">No activities yet</p>
                      </div>
                    )}
                    {activities.map(a => {
                      const meta = ACTIVITY_META[safe(a.type)] || ACTIVITY_META.note;
                      const Icon = meta.icon;
                      const deal = deals.find(d => d.id === a.deal_id);
                      const dLeft = daysUntil(a.date);
                      return (
                        <div key={a.id} className="flex items-center gap-3 py-3 hover:bg-[#FAFAF8] transition-colors -mx-3 px-3 rounded-lg">
                          <button onClick={() => toggleActivity(a)} className="shrink-0">
                            {a.done
                              ? <CheckCircle2 size={18} className="text-[#4ADE80]" />
                              : <Circle size={18} className="text-[#E0E0E0] hover:text-[#B8A9E8]" />}
                          </button>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + '15' }}>
                            <Icon size={13} style={{ color: meta.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${a.done ? 'text-[#9B9B9B] line-through' : 'text-[#1A1A1A]'}`}>{safe(a.subject)}</p>
                            <p className="text-[11px] text-[#9B9B9B] truncate">
                              {deal ? safe(deal.name) : 'No deal'} · {safe(a.owner)}
                            </p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border shrink-0"
                            style={{ backgroundColor: meta.color + '1A', color: meta.text, borderColor: meta.color + '33' }}>
                            {safe(a.type)}
                          </span>
                          <span className={`text-[11px] shrink-0 min-w-[80px] text-right ${dLeft !== null && dLeft < 0 && !a.done ? 'text-[#DC2626] font-semibold' : 'text-[#6B6B6B]'}`}>
                            {fmtDate(a.date)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <ListTodo size={14} className="text-[#B8A9E8]" /> To-do next
                  </h3>
                  <div className="space-y-2">
                    {upcomingActivities.map(a => {
                      const meta = ACTIVITY_META[safe(a.type)] || ACTIVITY_META.note;
                      return (
                        <div key={a.id} className="p-3 rounded-xl border border-[#F0F0F0] hover:bg-[#FAFAF8] transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: meta.text }}>{safe(a.type)}</span>
                          </div>
                          <p className="text-sm font-medium text-[#1A1A1A] mb-1">{safe(a.subject)}</p>
                          <p className="text-[10px] text-[#9B9B9B]">{fmtDate(a.date)} · {safe(a.owner)}</p>
                        </div>
                      );
                    })}
                    {upcomingActivities.length === 0 && <p className="text-sm text-[#9B9B9B] text-center py-4">All caught up ✓</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- DEAL DETAIL DRAWER ---------------- */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedDeal(null)}>
          <div className="absolute inset-0 bg-[#1A1A1A]/20 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto border-l border-[#F0F0F0] animate-[slideIn_250ms_ease-out]" onClick={e => e.stopPropagation()}>
            {(() => {
              const d = selectedDeal;
              const s = STAGE_MAP[safe(d.stage)] || STAGE_MAP.lead;
              const dealActivities = activities.filter(a => a.deal_id === d.id);
              const contact = contacts.find(c => safe(c.name) === safe(d.contact));
              return (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                        <Building2 size={16} style={{ color: s.color }} />
                      </div>
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border"
                          style={{ backgroundColor: s.color + '1A', color: s.text, borderColor: s.color + '33' }}>{s.label}</span>
                        <h2 className="text-base font-bold text-[#1A1A1A] mt-1.5">{safe(d.name)}</h2>
                        <p className="text-[11px] text-[#9B9B9B]">{safe(d.company)}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedDeal(null)} className="p-1.5 rounded-full hover:bg-[#F0F0F0] transition-colors">
                      <X size={16} className="text-[#6B6B6B]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-[#FAFAF8] rounded-xl p-3">
                      <p className="text-[10px] text-[#9B9B9B] font-medium mb-1">Amount</p>
                      <p className="text-xl font-bold text-[#1A1A1A]">{fmtMoney(d.amount)}</p>
                    </div>
                    <div className="bg-[#FAFAF8] rounded-xl p-3">
                      <p className="text-[10px] text-[#9B9B9B] font-medium mb-1">Weighted</p>
                      <p className="text-xl font-bold text-[#1A1A1A]">{fmtMoney((Number(d.amount) || 0) * (Number(d.probability) || 0) / 100)}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-[10px] text-[#9B9B9B] font-semibold uppercase tracking-wide mb-2">Move to stage</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STAGES.map(st => (
                        <button key={st.id} onClick={() => updateStage(d, st.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide border transition-all ${safe(d.stage) === st.id ? '' : 'opacity-50 hover:opacity-100'}`}
                          style={{ backgroundColor: st.color + '1A', color: st.text, borderColor: st.color + '33' }}>
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-5 text-sm">
                    <Row label="Contact" value={safe(d.contact) || '—'} icon={Users} iconColor={ACCENT.lilac} />
                    <Row label="Owner" value={safe(d.owner) || '—'} icon={Users} iconColor={ACCENT.amber} />
                    <Row label="Source" value={safe(d.source) || '—'} icon={Target} iconColor={ACCENT.teal} />
                    <Row label="Probability" value={d.probability + '%'} icon={TrendingUp} iconColor={ACCENT.green} />
                    <Row label="Close date" value={fmtDate(d.close_date)} icon={Calendar} iconColor={ACCENT.coral} />
                    <Row label="Created" value={fmtDate(d.created_at)} icon={Calendar} iconColor={ACCENT.lilac} />
                  </div>

                  {contact && (
                    <div className="mb-5 p-4 rounded-xl border border-[#F0F0F0] bg-[#FAFAF8]">
                      <p className="text-[10px] text-[#9B9B9B] font-semibold uppercase tracking-wide mb-2">Contact card</p>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{safe(contact.name)} · {safe(contact.title)}</p>
                      <div className="mt-2 space-y-1 text-[11px] text-[#6B6B6B]">
                        <div className="flex items-center gap-1.5"><Mail size={10} className="text-[#F5A623]" />{safe(contact.email)}</div>
                        <div className="flex items-center gap-1.5"><Phone size={10} className="text-[#4ECDC4]" />{safe(contact.phone)}</div>
                      </div>
                    </div>
                  )}

                  {safe(d.notes) && (
                    <div className="mb-5">
                      <p className="text-[10px] text-[#9B9B9B] font-semibold uppercase tracking-wide mb-2">Notes</p>
                      <p className="text-sm text-[#1A1A1A] p-3 rounded-xl bg-[#FAFAF8] border border-[#F0F0F0] leading-relaxed">{safe(d.notes)}</p>
                    </div>
                  )}

                  <div className="mb-5">
                    <p className="text-[10px] text-[#9B9B9B] font-semibold uppercase tracking-wide mb-2">Activity ({dealActivities.length})</p>
                    <div className="space-y-1.5">
                      {dealActivities.map(a => {
                        const meta = ACTIVITY_META[safe(a.type)] || ACTIVITY_META.note;
                        const Icon = meta.icon;
                        return (
                          <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#FAFAF8] transition-colors">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + '15' }}>
                              <Icon size={12} style={{ color: meta.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${a.done ? 'text-[#9B9B9B] line-through' : 'text-[#1A1A1A]'}`}>{safe(a.subject)}</p>
                              <p className="text-[10px] text-[#9B9B9B]">{fmtDate(a.date)}</p>
                            </div>
                          </div>
                        );
                      })}
                      {dealActivities.length === 0 && <p className="text-xs text-[#9B9B9B] text-center py-3">No activity logged</p>}
                    </div>
                  </div>

                  <button onClick={() => deleteDeal(d)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#FF6B6B]/30 text-[#DC2626] rounded-full text-sm font-semibold hover:bg-[#FF6B6B]/10 transition-all duration-200">
                    <Trash2 size={13} /> Delete deal
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ---------------- NEW DEAL MODAL ---------------- */}
      {showNewDeal && <NewDealModal owners={owners} onClose={() => setShowNewDeal(false)} onSave={addDeal} />}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}} />
    </div>
  );
}

function Row({ label, value, icon: Icon, iconColor }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-[#9B9B9B] flex items-center gap-1.5 font-medium">
        <Icon size={11} style={{ color: iconColor }} />{label}
      </span>
      <span className="text-sm text-[#1A1A1A] font-medium">{value}</span>
    </div>
  );
}

function NewDealModal({ owners, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', company: '', contact: '', amount: '', stage: 'lead',
    probability: 15, owner: owners[0] || 'Hena Akter', source: 'inbound',
    close_date: '', notes: ''
  });
  const [saving, setSaving] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#1A1A1A]/30 backdrop-blur-sm" />
      <form onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl border border-[#F0F0F0] shadow-xl animate-[fadeIn_200ms_ease-out]">
        <div className="flex items-center justify-between p-5 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT.lilac + '15' }}>
              <Plus size={14} style={{ color: ACCENT.lilac }} />
            </div>
            <h2 className="text-base font-bold text-[#1A1A1A]">New deal</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F0F0F0] transition-colors">
            <X size={16} className="text-[#6B6B6B]" />
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <Field label="Deal name" required>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]" />
            </Field>
            <Field label="Primary contact">
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount ($)">
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]" />
            </Field>
            <Field label="Probability %">
              <input type="number" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stage">
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]">
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Source">
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]">
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="referral">Referral</option>
                <option value="event">Event</option>
                <option value="partner">Partner</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner">
              <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                list="owners-list"
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]" />
              <datalist id="owners-list">{owners.map(o => <option key={o} value={o} />)}</datalist>
            </Field>
            <Field label="Close date">
              <input type="date" value={form.close_date} onChange={e => setForm(f => ({ ...f, close_date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8]" />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#F0F0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20 focus:border-[#B8A9E8] resize-none" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-[#F0F0F0]">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Cancel</button>
          <button type="submit" disabled={saving || !form.name}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#B8A9E8] text-[#1A1A1A] rounded-full text-sm font-semibold hover:bg-[#A89AD8] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : 'Create deal'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-[#6B6B6B] mb-1 block">{label}{required && <span className="text-[#DC2626]"> *</span>}</span>
      {children}
    </label>
  );
}
