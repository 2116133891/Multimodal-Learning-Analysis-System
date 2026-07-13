// ===== 侧边栏布局组件 =====
import { useState } from 'react';
import { LayoutDashboard, Database, GitMerge, Activity, Brain, HeartPulse, Repeat2, Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';

type Page = 'dashboard' | 'collection' | 'fusion' | 'diagnosis' | 'ai' | 'vitality' | 'improvement';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: '系统总览', icon: LayoutDashboard },
  { id: 'collection', label: '数据采集', icon: Database },
  { id: 'fusion', label: '数据融合', icon: GitMerge },
  { id: 'diagnosis', label: '动态诊断', icon: Activity },
  { id: 'ai', label: 'AI决策支持', icon: Brain },
  { id: 'vitality', label: '课程生命力', icon: HeartPulse },
  { id: 'improvement', label: '持续改进闭环', icon: Repeat2 },
];

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-slate-800">多模态学习分析</h1>
              <p className="text-xs text-slate-500">课程管理系统</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* 底部信息 */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-200">
            <p className="text-xs text-slate-400">基于多模态学习分析</p>
            <p className="text-xs text-slate-400">的高校课程持续改进机制</p>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
