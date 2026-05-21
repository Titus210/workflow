import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
interface StatCardProps {
  label: string;
  value: number;
  delta?: string;
  deltaType?: 'positive' | 'negative';
}
export function StatCard({ label, value, delta, deltaType }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-2xl font-semibold text-text-primary mt-1">{value}</p>
      {delta &&
      <div
        className={`flex items-center gap-1 mt-2 text-xs ${deltaType === 'positive' ? 'text-success' : 'text-error'}`}>
        
          {deltaType === 'positive' ?
        <TrendingUp size={14} /> :

        <TrendingDown size={14} />
        }
          <span>{delta} vs last month</span>
        </div>
      }
    </Card>);

}