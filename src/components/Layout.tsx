// ===== 企业级侧边栏布局组件 =====
import { useState } from 'react';
import { LayoutDashboard, Database, GitMerge, Activity, Brain, HeartPulse, Repeat2, User, BarChart3, Menu, X, Sparkles, ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type Page = 'dashboard' | 'collection' | 'fusion' | 'diagnosis' | 'ai' | 'vitality' | 'improvement' | 'profile' | 'efficacy';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard; section?: string; badge?: string; badgeColor?: string }[] = [
  { id: 'dashboard', label: '系统总览', icon: LayoutDashboard },
  { id: 'collection', label: '数据采集', icon: Database },
  { id: 'fusion', label: '数据融合', icon: GitMerge },
  { id: 'diagnosis', label: '动态诊断', icon: Activity },
  { id: 'ai', label: 'AI 决策支持', icon: Brain, badge: 'AI', badgeColor: 'bg-violet-500' },
  { id: 'vitality', label: '课程生命力', icon: HeartPulse },
  { id: 'improvement', label: '持续改进闭环', icon: Repeat2 },
  { id: 'profile', label: '课程画像详情', icon: User, section: '多维评估' },
  { id: 'efficacy', label: '干预成效验证', icon: BarChart3, section: '多维评估' },
];

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const withSection = navItems.filter(n => n.section);
  const withoutSection = navItems.filter(n => !n.section);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* ── 侧边栏 ─────────────────────────────────────────── */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } relative flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-30`}
      >
        {/* 毛玻璃背景 */}
        <div className="absolute inset-0 glass-card" />

        <div className="relative flex flex-col h-full">
          {/* Logo 区 */}
          <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-slate-800 truncate">多模态课程分析</h1>
                  <p className="text-[10px] text-slate-400 leading-tight">企业级 SaaS 面板</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100/80 rounded-lg transition-colors flex-shrink-0"
              title={sidebarOpen ? '收起侧栏' : '展开侧栏'}
            >
              {sidebarOpen ? <ChevronLeft size={16} className="text-slate-400" /> : <Menu size={18} className="text-slate-400" />}
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {withoutSection.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
                  }`}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/40 rounded-r-full" />
                  )}
                  <Icon size={18} className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {item.badge && sidebarOpen && (
                    <span className={`ml-auto text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {sidebarOpen && withSection.length > 0 && (
              <>
                <div className="pt-5 pb-2 px-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">多维评估</p>
                </div>
              </>
            )}

            {withSection.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/40 rounded-r-full" />
                  )}
                  <Icon size={18} className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-slate-200/60">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 mb-1">多模态课程分析系统</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  基于多模态数据联动的<br/>高校课程持续改进机制
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── 主内容区 ───────────────────────────────────────── */}
      <main className="flex-1 overflow-auto relative min-w-0">
        {/* 顶部装饰渐变条 */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />
        <div className="p-6 max-w-[90rem] mx-auto w-full page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
