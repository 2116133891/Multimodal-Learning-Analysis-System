// ===== 指标卡片组件 =====
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export default function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendColor}`}>
              {trendIcon} {trend === 'up' ? '上升' : trend === 'down' ? '下降' : '持平'}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${colorMap[color] || colorMap.blue} text-white`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
