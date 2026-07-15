// ===== 企业级数据指标卡片（毛玻璃 + Sparkline + Count-Up） =====
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: string;
  sparklineData?: Array<{ value: number }>;
  size?: 'sm' | 'md' | 'lg';
  accentBorder?: boolean;
  delay?: number;
}

const colorMap: Record<string, { gradient: string; ring: string; text: string; sparkline: string }> = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-500/20',
    text: 'text-blue-500',
    sparkline: '#3b82f6',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/20',
    text: 'text-emerald-500',
    sparkline: '#10b981',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-500/20',
    text: 'text-amber-500',
    sparkline: '#f59e0b',
  },
  red: {
    gradient: 'from-red-500 to-rose-600',
    ring: 'ring-red-500/20',
    text: 'text-red-500',
    sparkline: '#ef4444',
  },
  purple: {
    gradient: 'from-purple-500 to-violet-600',
    ring: 'ring-purple-500/20',
    text: 'text-purple-500',
    sparkline: '#8b5cf6',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-600',
    ring: 'ring-indigo-500/20',
    text: 'text-indigo-500',
    sparkline: '#6366f1',
  },
  cyan: {
    gradient: 'from-cyan-500 to-teal-600',
    ring: 'ring-cyan-500/20',
    text: 'text-cyan-500',
    sparkline: '#06b6d4',
  },
};

function AnimatedNumber({ value, size = 'lg' }: { value: string | number; size: 'sm' | 'md' | 'lg' }) {
  const [display, setDisplay] = useState('0');
  const numRef = useRef(0);
  const target = typeof value === 'number' ? value : parseFloat(value) || 0;
  const duration = 800;
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      numRef.current = Math.round(eased * target);
      setDisplay(String(numRef.current));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(String(target));
    };
    requestAnimationFrame(animate);
  }, [target]);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-3xl',
  };

  return <span className={`tabular-nums font-bold ${sizeClasses[size]}`}>{display}</span>;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
  sparklineData,
  size = 'md',
  accentBorder = false,
  delay = 0,
}: StatCardProps) {
  const colors = colorMap[color] || colorMap.blue;
  const trendColors = {
    up: 'text-emerald-600 bg-emerald-50/80 border-emerald-200/60',
    down: 'text-red-600 bg-red-50/80 border-red-200/60',
    stable: 'text-slate-500 bg-slate-50/80 border-slate-200/60',
  };
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendLabel = trend === 'up' ? '上升' : trend === 'down' ? '下降' : '持平';

  const sizePadding = size === 'sm' ? 'p-4' : 'p-5';
  const sizeValue = size === 'sm' ? 'text-xl' : 'text-3xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -3 }}
      className={`
        relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-xl
        transition-all duration-300 ease-out group cursor-default
        ${accentBorder ? 'border-blue-200/60 shadow-lg shadow-blue-500/5' : 'border-slate-200/60 shadow-sm'}
        hover:border-blue-300/50 hover:shadow-lg hover:shadow-blue-500/[0.06]
        ${sizePadding}
      `}
    >
      {/* 背景装饰 — 右上角光晕 */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.07] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-500"
        style={{ background: `radial-gradient(circle, ${colors.sparkline}, transparent 70%)` }}
      />

      {/* 顶部渐变条 */}
      {accentBorder && (
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl">
          <div className={`h-full rounded-t-2xl bg-gradient-to-r ${colors.gradient}`} />
        </div>
      )}

      <div className="relative">
        {/* 头部：标签 + 图标 */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-500 transition-colors duration-300">
              {label}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-md ring-4 ring-white/50 group-hover:shadow-lg group-hover:ring-white/60 transition-all duration-300`}>
              <div className="w-4 h-4">{icon}</div>
            </div>
          )}
        </div>

        {/* 主数字 */}
        <div className="flex items-baseline gap-2 mb-2">
          <AnimatedNumber value={value} size={size} />
          {trend && trendValue && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${trendColors[trend]}`}>
              <TrendIcon size={12} />
              {trendValue}
            </span>
          )}
        </div>

        {/* 趋势标签 */}
        {trend && (
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${trendColors[trend]}`}>
              <TrendIcon size={11} />
              {trendLabel}
            </span>
          </div>
        )}

        {/* Sparkline 微图表 */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-3 h-10 -mx-1">
            <ResponsiveContainer width="calc(100% + 8px)" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.sparkline} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={colors.sparkline} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.sparkline}
                  strokeWidth={1.5}
                  fill={`url(#spark-${color})`}
                  dot={false}
                  isAnimationActive={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="px-2 py-1 text-xs bg-slate-800 text-white rounded-md shadow-lg">
                        {payload[0].value}
                      </div>
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
