// ===== 企业级图表卡片容器（毛玻璃 + 渐变顶条 + 优雅标题栏） =====
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RechartsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  accent?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'cyan';
  delay?: number;
}

const accentGradients: Record<string, string> = {
  blue: 'from-blue-500 to-indigo-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  purple: 'from-purple-500 to-violet-500',
  red: 'from-red-500 to-rose-500',
  cyan: 'from-cyan-500 to-blue-500',
};

const accentDots: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-500',
};

export default function RechartsCard({
  title,
  description,
  children,
  toolbar,
  accent = 'blue',
  delay = 0,
}: RechartsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: delay * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden group hover:shadow-lg hover:shadow-slate-500/5 hover:border-slate-300/50 transition-all duration-300"
    >
      {/* 顶部渐变装饰条 */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentGradients[accent]} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* 标题栏 */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100/80 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {/* 彩色圆点指示器 */}
            <span className={`w-2 h-2 rounded-full ${accentDots[accent]} flex-shrink-0`} />
            <h3 className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 transition-colors duration-200 truncate">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-[11px] text-slate-400 mt-1 ml-4 leading-relaxed">{description}</p>
          )}
        </div>
        {toolbar && <div className="flex-shrink-0">{toolbar}</div>}
      </div>

      {/* 图表区域 */}
      <div className="p-4 pt-3 min-h-[350px]">{children}</div>
    </motion.div>
  );
}
