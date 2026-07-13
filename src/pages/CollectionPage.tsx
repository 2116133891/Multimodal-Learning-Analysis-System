// ===== 数据采集页面 =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { Database, CheckCircle, FileText, MessageSquare, BarChart3 } from 'lucide-react';

const typeConfig = {
  behavior: { label: '学习行为数据', icon: BarChart3, color: 'bg-blue-500', desc: '登录频次、视频观看时长、讨论区发帖数' },
  process: { label: '学习过程数据', icon: Database, color: 'bg-emerald-500', desc: '作业提交、在线测试、互动参与' },
  outcome: { label: '学习成果数据', icon: CheckCircle, color: 'bg-purple-500', desc: '考试成绩、作品评分、项目完成度' },
  evaluation: { label: '教师评价数据', icon: FileText, color: 'bg-orange-500', desc: '课堂表现评语、作业反馈' },
  feedback: { label: '课程反馈数据', icon: MessageSquare, color: 'bg-pink-500', desc: '学生问卷评分、满意度调查' },
};

export default function CollectionPage() {
  const { records, dataQuality } = useStore();
  const [selectedType, setSelectedType] = useState<string>('behavior');
  const [showGenerated, setShowGenerated] = useState(false);

  useEffect(() => {
    if (records.length === 0) {
      useStore.getState().fetchData();
    }
  }, [records.length]);

  const handleGenerate = () => {
    setShowGenerated(true);
    setTimeout(() => setShowGenerated(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">数据采集</h2>
          <p className="text-sm text-slate-500 mt-1">多模态学习数据体系构建 — 五种数据类型采集与管理</p>
        </div>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Database size={16} />
          一键生成模拟数据
        </button>
      </div>

      {/* 生成提示 */}
      {showGenerated && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700">模拟数据生成成功！共 {records.length} 条记录。</p>
        </div>
      )}

      {/* 数据质量概览 */}
      {dataQuality && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">数据完整性</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${dataQuality.completeness}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{dataQuality.completeness}%</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">数据及时性</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${dataQuality.timeliness}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{dataQuality.timeliness}%</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">数据准确性</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${dataQuality.accuracy}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{dataQuality.accuracy}%</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">总记录数</p>
            <p className="text-2xl font-bold text-slate-800">{records.length.toLocaleString()} 条</p>
          </div>
        </div>
      )}

      {/* 五类数据展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          const count = records.filter(r => r.type === type).length;
          const avg = records.filter(r => r.type === type);
          const avgVal = avg.length > 0 ? Math.round(avg.reduce((s, r) => s + r.value, 0) / avg.length) : 0;

          return (
            <div key={type} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedType(type)}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${config.color} text-white`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{count} 条</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800">{config.label}</h4>
              <p className="text-xs text-slate-500 mt-1 mb-3">{config.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">平均值</span>
                <span className="font-semibold text-slate-700">{avgVal} 分</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 选中类型的数据预览 */}
      <CardChart
        title={`${typeConfig[selectedType as keyof typeof typeConfig]?.label} — 周分布统计`}
        option={{
          tooltip: { trigger: 'axis' as const },
          xAxis: {
            type: 'category' as const,
            data: Array.from({ length: 16 }, (_, i) => `第${i + 1}周`),
            axisLabel: { rotate: 45 },
          },
          yAxis: { type: 'value' as const, axisLabel: { formatter: '{value} 条' } },
          series: [{
            type: 'bar' as const,
            data: Array.from({ length: 16 }, (_, week) => {
              const w = week + 1;
              return records.filter(r => r.type === selectedType && r.week === w).length;
            }),
            itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
          }],
          grid: { left: 60, right: 20, top: 20, bottom: 60 },
        }}
        height={300}
      />
    </div>
  );
}
