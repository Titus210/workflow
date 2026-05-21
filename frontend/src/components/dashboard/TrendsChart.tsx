import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { Card } from '../ui/Card';
import { TrendDataPoint } from '../../types/application';
interface TrendsChartProps {
  data: TrendDataPoint[];
  onPeriodChange: (period: '7d' | '30d' | '90d') => void;
}
export function TrendsChart({ data, onPeriodChange }: TrendsChartProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d') => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Application Trends
        </h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) =>
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-2 py-1 text-xs rounded transition-colors ${period === p ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            
              {p}
            </button>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 12,
              fill: '#6B7280'
            }}
            tickFormatter={(value) =>
            new Date(value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })
            } />
          
          <YAxis
            tick={{
              fontSize: 12,
              fill: '#6B7280'
            }} />
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '4px'
            }}
            labelFormatter={(value) =>
            new Date(value).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
            } />
          
          <Bar dataKey="count" fill="#2563EB" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>);

}