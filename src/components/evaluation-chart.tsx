// src/components/evaluation-chart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/combined';
import { useTheme } from 'next-themes';

interface ChartData {
  name: string;
  "Calificación Promedio": number;
}

interface EvaluationChartProps {
  data: ChartData[];
}

export function EvaluationChart({ data }: EvaluationChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const axisColor = isDark ? '#888' : '#555';
  const gridColor = isDark ? '#444' : '#eee';
  const barColor = 'hsl(var(--primary))';
  const tooltipBackground = isDark ? 'hsl(var(--background))' : '#fff';
  const tooltipBorder = isDark ? 'hsl(var(--border))' : '#ccc';

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: axisColor, fontSize: 12 }} 
            tickLine={{ stroke: axisColor }}
          />
          <YAxis 
            tick={{ fill: axisColor, fontSize: 12 }} 
            tickLine={{ stroke: axisColor }}
            domain={[0, 10]}
          />
          <Tooltip
            cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
            contentStyle={{ 
              backgroundColor: tooltipBackground, 
              borderColor: tooltipBorder,
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{fontSize: "14px"}} />
          <Bar dataKey="Calificación Promedio" fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
