import React, { useEffect, useRef } from 'react';

interface DensityChartProps {
  data: {
    id: string;
    name: string;
    density: number;
  }[];
}

export const DensityChart = ({ data }: DensityChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI retina screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 35;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw chart background / panel border
    ctx.fillStyle = '#070B14'; // slate-950
    ctx.fillRect(0, 0, width, height);

    // Draw reference horizontal grid lines and percentage labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94A3B8'; // slate-400
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    const gridLines = [0, 25, 50, 75, 100];
    gridLines.forEach((pct) => {
      const y = padding + chartHeight * (1 - pct / 100);
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Draw text label
      ctx.fillText(`${pct}%`, padding - 6, y + 3);
    });

    // Draw bars
    const barCount = data.length;
    const barWidth = (chartWidth / barCount) * 0.55;
    const gap = (chartWidth / barCount) * 0.45;

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + gap) + gap / 2;
      const barHeight = (item.density / 100) * chartHeight;
      const y = height - padding - barHeight;

      // Create beautiful color gradients for bars
      const grad = ctx.createLinearGradient(x, y, x, height - padding);
      if (item.density >= 75) {
        // Critical Red
        grad.addColorStop(0, '#F43F5E');
        grad.addColorStop(1, '#991B1B');
      } else if (item.density >= 55) {
        // Warning Orange/Yellow
        grad.addColorStop(0, '#F59E0B');
        grad.addColorStop(1, '#9A3412');
      } else {
        // Safe Emerald Green
        grad.addColorStop(0, '#10B981');
        grad.addColorStop(1, '#065F46');
      }

      // Draw shadow glow for hot/warm zones
      if (item.density >= 55) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = item.density >= 75 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.3)';
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]) : ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]) : ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fill();
      }

      // Draw value text labels on top of bars
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.density}%`, x + barWidth / 2, Math.min(y - 5, height - padding - 5));

      // Draw horizontal x-axis labels (Zone IDs)
      ctx.fillStyle = '#64748B'; // slate-500
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      
      const zoneLabel = item.id.replace('zone-', '').toUpperCase();
      ctx.fillText(zoneLabel, x + barWidth / 2, height - padding + 15);
    });

    // Draw X-Axis Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

  }, [data]);

  return (
    <div className="w-full h-full min-h-[220px]">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full min-h-[220px] rounded-xl border border-slate-850/50 block shadow-inner"
      />
    </div>
  );
};
