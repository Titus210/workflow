import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip } from
'recharts';
import { Card } from '../ui/Card';
import { StatusDistribution } from '../../types/application';
interface StatusDonutProps {
  data: StatusDistribution[];
}
export function StatusDonut({ data }: StatusDonutProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="count">
            
            {data.map((entry, index) =>
            <Cell key={`cell-${index}`} fill={entry.color} />
            )}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '4px'
            }} />
          
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="square"
            formatter={(value, entry: any) =>
            <span className="text-xs text-text-secondary">
                {value} ({entry.payload.count})
              </span>
            } />
          
        </PieChart>
      </ResponsiveContainer>
    </Card>);

}