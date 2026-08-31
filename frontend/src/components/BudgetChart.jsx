import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { IndianRupee, Sparkles, TrendingUp, ShieldCheck, Wallet } from 'lucide-react';
import { tripsAPI } from '../services/api';

export default function BudgetChart({ tripId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      loadStats();
    }
  }, [tripId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await tripsAPI.getTripStats(tripId);
      setStats(res.data);
    } catch (err) {
      console.warn('Trip stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading budget analytics...</div>;
  }

  if (!stats) return null;

  const data = (stats.budget_breakdown || []).filter(item => item.amount > 0);
  const totalBudget = stats.total_budget || 25000;
  const totalSpent = stats.total_estimated_cost || 21850;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <div className="space-y-6">
      
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            Total Budget
          </div>
          <div className="text-xl font-bold text-slate-900">₹{totalBudget.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1">Planned trip ceiling</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
            Estimated Spending
          </div>
          <div className="text-xl font-bold text-brand-700">₹{totalSpent.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1">{percentUsed}% of budget utilized</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Remaining Buffer
          </div>
          <div className="text-xl font-bold text-emerald-700">₹{remaining.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1">Safe contingency reserve</p>
        </div>
      </div>

      {/* Recharts Donut Chart & Category Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle">
        <h4 className="text-sm font-bold text-slate-900 mb-4">Expense Category Allocation</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          
          {/* Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Estimated Cost']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-2 text-xs">
            {data.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-smooth">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                  <span className="font-semibold text-slate-700">{cat.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-900">₹{cat.amount.toLocaleString()}</span>
                  <span className="text-slate-400 font-medium w-12 text-right">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* AI Budget Insight Card */}
      {stats.ai_budget_insight && (
        <div className="bg-gradient-to-r from-brand-50 to-indigo-50/70 border border-brand-200 rounded-xl p-4 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-brand-100/80 text-brand-700 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-brand-950">AI Smart Budget Insight</h5>
            <p className="text-xs text-brand-900/90 mt-0.5 leading-relaxed">
              {stats.ai_budget_insight}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
