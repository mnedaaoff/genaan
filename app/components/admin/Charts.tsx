"use client";

interface DataPoint { date: string; revenue: number }

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 180, color = "#17583a" }: LineChartProps) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.revenue));
  const minVal = Math.min(...data.map(d => d.revenue));
  const range = maxVal - minVal || 1;

  const w = 600;
  const h = height;
  const pad = { top: 10, right: 10, bottom: 30, left: 50 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const xScale = (i: number) => (i / (data.length - 1)) * chartW;
  const yScale = (v: number) => chartH - ((v - minVal) / range) * chartH;

  // Build path
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.revenue)}`).join(" ");
  // Fill area
  const areaD = `${pathD} L ${xScale(data.length - 1)} ${chartH} L 0 ${chartH} Z`;

  // Y axis ticks
  const ticks = [minVal, (minVal + maxVal) / 2, maxVal];

  // X labels (every ~5 points)
  const xLabels = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {ticks.map((t, i) => (
        <g key={i} transform={`translate(${pad.left}, ${pad.top})`}>
          <line x1={0} y1={yScale(t)} x2={chartW} y2={yScale(t)} stroke="#e4ece7" strokeWidth="1" />
          <text x={-8} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="#8aab99">
            EGP {t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t.toFixed(0)}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <text key={i} x={pad.left + xScale(idx)} y={h - 5} textAnchor="middle" fontSize="9" fill="#8aab99">
            {d.date.slice(5)}
          </text>
        );
      })}

      {/* Area fill */}
      <g transform={`translate(${pad.left}, ${pad.top})`}>
        <path d={areaD} fill={color} fillOpacity="0.08" />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots at ends */}
        <circle cx={xScale(0)} cy={yScale(data[0].revenue)} r="3" fill={color} />
        <circle cx={xScale(data.length - 1)} cy={yScale(data[data.length - 1].revenue)} r="3" fill={color} />
      </g>
    </svg>
  );
}

interface BarData { category: string; stock: number; reserved: number }

export function BarChart({ data, height = 200 }: { data: BarData[]; height?: number }) {
  const maxVal = Math.max(...data.map(d => d.stock));
  const w = 500;
  const h = height;
  const pad = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const barW = (chartW / data.length) * 0.55;
  const gap = chartW / data.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {/* Y ticks */}
      {[0, maxVal * 0.5, maxVal].map((t, i) => (
        <g key={i} transform={`translate(${pad.left}, ${pad.top})`}>
          <line x1={0} y1={chartH - (t / maxVal) * chartH} x2={chartW} y2={chartH - (t / maxVal) * chartH} stroke="#e4ece7" strokeWidth="1" />
          <text x={-6} y={chartH - (t / maxVal) * chartH + 4} textAnchor="end" fontSize="9" fill="#8aab99">{Math.round(t)}</text>
        </g>
      ))}

      {data.map((d, i) => {
        const x = pad.left + i * gap + gap * 0.225;
        const stockH = (d.stock / maxVal) * chartH;
        const resvH = (d.reserved / maxVal) * chartH;
        return (
          <g key={i}>
            {/* Stock bar */}
            <rect x={x} y={pad.top + chartH - stockH} width={barW} height={stockH} rx="3" fill="#17583a" fillOpacity="0.15" />
            {/* Reserved */}
            <rect x={x} y={pad.top + chartH - resvH} width={barW} height={resvH} rx="3" fill="#17583a" />
            {/* Label */}
            <text x={x + barW / 2} y={h - 6} textAnchor="middle" fontSize="9" fill="#8aab99">{d.category.slice(0, 4)}</text>
          </g>
        );
      })}
    </svg>
  );
}
