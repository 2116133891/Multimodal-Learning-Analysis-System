// ===== Recharts 图表封装组件（学术风格） =====
import { ResponsiveContainer } from 'recharts';

interface RechartsCardProps {
  title: string;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
}

/**
 * 学术风格卡片容器
 * - 白色背景 + 细边框 + 柔和阴影
 * - 标题栏带底部分隔线
 * - 响应式宽度
 */
export default function RechartsCard({ title, children, toolbar }: RechartsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {toolbar}
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={350}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
