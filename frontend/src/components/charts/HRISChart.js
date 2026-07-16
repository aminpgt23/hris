import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import './HRISChart.css';

// Design token palette for charts (derived from --color-* tokens)
const CHART_COLORS = ['#2F4B7C', '#C08552', '#4E8B6F', '#B54B4B', '#C98B3B', '#4A7BB5', '#8B6FAE', '#5D6675'];


const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

// ---------- Bar Chart ----------
export function HRISBarChart({ data, xKey = 'name', bars, height = 300 }) {
  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
          <Tooltip content={customTooltip} />
          {bars?.map((bar, i) => (
            <Bar
              key={bar.key || i}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color || CHART_COLORS[i % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Line Chart ----------
export function HRISLineChart({ data, xKey = 'name', lines, height = 300 }) {
  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
          <Tooltip content={customTooltip} />
          {lines?.map((line, i) => (
            <Line
              key={line.key || i}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color || CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4, fill: line.color || CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Pie Chart ----------
export function HRISPieChart({ data, dataKey = 'value', nameKey = 'name', height = 300, donut = false }) {
  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 60 : 0}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={customTooltip} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Area Chart ----------
export function HRISAreaChart({ data, xKey = 'name', areas, height = 300 }) {
  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
          <Tooltip content={customTooltip} />
          {areas?.map((area, i) => (
            <Area
              key={area.key || i}
              type="monotone"
              dataKey={area.key}
              name={area.name}
              stroke={area.color || CHART_COLORS[i % CHART_COLORS.length]}
              fill={area.color || CHART_COLORS[i % CHART_COLORS.length]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { CHART_COLORS };
