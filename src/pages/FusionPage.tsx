// ===== 数据融合页面（重构：多模态特征融合可视化） =====
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { GitMerge, Film, MessageSquare, MousePointer2, Activity } from 'lucide-react';

const modalityIcons: Record<string, typeof Film> = {
  video_emotion: Film,
  text_semantic: MessageSquare,
  interaction_behavior: MousePointer2,
  traditional_data: Activity,
};

const modalityLabels: Record<string, string> = {
  video_emotion: '视频微表情',
  text_semantic: '文本语义',
  interaction_behavior: '交互行为',
  traditional_data: '传统学习数据',
};

const modalityColors: Record<string, string> = {
  video_emotion: '#3b82f6',
  text_semantic: '#10b981',
  interaction_behavior: '#f59e0b',
  traditional_data: '#6366f1',
};

export default function FusionPage() {
  const { records, multimodalFeatures, courseInfo, fetchData } = useStore();
  const [selectedWeek, setSelectedWeek] = useState(8);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 按周统计三种模态的平均特征
  const weeklyModalities = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const week = i + 1;
      const weekFeatures = multimodalFeatures.filter(f => f.week === week);
      if (weekFeatures.length === 0) return { week, video: 0, text: 0, interaction: 0, traditional: 0 };

      const videoScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'video_emotion').map(m => m.score));
      const textScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'text_semantic').map(m => m.score));
      const interactionScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'interaction_behavior').map(m => m.score));
      const traditionalScores = weekFeatures.flatMap(f => f.modalityFeatures.filter(m => m.modality === 'traditional_data').map(m => m.score));

      return {
        week,
        video: videoScores.length > 0 ? Math.round(videoScores.reduce((a, b) => a + b, 0) / videoScores.length) : 0,
        text: textScores.length > 0 ? Math.round(textScores.reduce((a, b) => a + b, 0) / textScores.length) : 0,
        interaction: interactionScores.length > 0 ? Math.round(interactionScores.reduce((a, b) => a + b, 0) / interactionScores.length) : 0,
        traditional: traditionalScores.length > 0 ? Math.round(traditionalScores.reduce((a, b) => a + b, 0) / traditionalScores.length) : 0,
      };
    });
  }, [multimodalFeatures]);

  // 选中周的融合特征详情
  const selectedFeatures = multimodalFeatures.filter(f => f.week === selectedWeek);
  const avgEarlyFusion = selectedFeatures.length > 0
    ? Math.round(selectedFeatures.reduce((s, f) => s + f.earlyFusionScore, 0) / selectedFeatures.length)
    : 0;
  const avgLateFusion = selectedFeatures.length > 0
    ? Math.round(selectedFeatures.reduce((s, f) => s + f.lateFusionScore, 0) / selectedFeatures.length)
    : 0;
  const avgConsistency = selectedFeatures.length > 0
    ? Math.round(selectedFeatures.reduce((s, f) => s + f.modalityConsistency, 0) / selectedFeatures.length)
    : 0;

  // 单学生示例融合特征
  const exampleFeature = selectedFeatures.length > 0 ? selectedFeatures[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">数据融合</h2>
        <p className="text-sm text-slate-500 mt-1">多模态特征融合引擎 — 视频微表情、文本语义、交互行为的时序对齐与融合表征</p>
      </div>

      {/* 周选择器 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-600">选择周次：</label>
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(Number(e.target.value))}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i + 1} value={i + 1}>第{i + 1}周</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          该周 {selectedFeatures.length} 名学生的融合特征
        </span>
      </div>

      {/* 三种模态特征融合对比图 */}
      <CardChart
        title="三种模态特征在时间轴上的对齐与融合"
        option={{
          tooltip: { trigger: 'axis' as const },
          legend: { data: ['视频微表情', '文本语义', '交互行为', '传统数据', '早融合', '晚融合'], bottom: 0 },
          xAxis: { type: 'category' as const, data: Array.from({ length: 16 }, (_, i) => `第${i + 1}周`) },
          yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
          series: [
            { name: '视频微表情', type: 'line' as const, data: weeklyModalities.map(w => w.video), smooth: true, itemStyle: { color: '#3b82f6' }, areaStyle: { opacity: 0.1 } },
            { name: '文本语义', type: 'line' as const, data: weeklyModalities.map(w => w.text), smooth: true, itemStyle: { color: '#10b981' }, areaStyle: { opacity: 0.1 } },
            { name: '交互行为', type: 'line' as const, data: weeklyModalities.map(w => w.interaction), smooth: true, itemStyle: { color: '#f59e0b' }, areaStyle: { opacity: 0.1 } },
            { name: '传统数据', type: 'line' as const, data: weeklyModalities.map(w => w.traditional), smooth: true, itemStyle: { color: '#6366f1' }, areaStyle: { opacity: 0.1 } },
            { name: '早融合', type: 'line' as const, data: weeklyModalities.map(w => Math.round((w.video * 0.3 + w.text * 0.25 + w.interaction * 0.25 + w.traditional * 0.2))), smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#ef4444' } },
            { name: '晚融合', type: 'line' as const, data: weeklyModalities.map(w => Math.round((w.video * 0.3 + w.text * 0.25 + w.interaction * 0.25 + w.traditional * 0.2) * 0.95)), smooth: true, lineStyle: { width: 2, type: 'dashed' }, itemStyle: { color: '#8b5cf6' } },
          ],
          grid: { left: 60, right: 20, top: 20, bottom: 60 },
        }}
        height={380}
      />

      {/* 融合策略对比 + 模态特征详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 早融合 vs 晚融合 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">融合策略对比（第{selectedWeek}周）</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <GitMerge size={18} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">早融合 (Early Fusion)</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">{avgEarlyFusion}</p>
              <p className="text-xs text-blue-600 mt-1">综合得分</p>
              <p className="text-xs text-slate-500 mt-2">特征级拼接 → 统一编码</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <GitMerge size={18} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">晚融合 (Late Fusion)</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">{avgLateFusion}</p>
              <p className="text-xs text-purple-600 mt-1">综合得分</p>
              <p className="text-xs text-slate-500 mt-2">独立推理 → 加权投票</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">模态一致性：<span className="font-semibold text-slate-700">{avgConsistency}%</span></p>
            <div className="bg-slate-200 rounded-full h-1.5 mt-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${avgConsistency}%` }} />
            </div>
          </div>
        </div>

        {/* 模态特征详情 */}
        {exampleFeature && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              学生 {exampleFeature.studentId} · 第{exampleFeature.week}周 模态特征
            </h3>
            <div className="space-y-3">
              {exampleFeature.modalityFeatures.map((mf, i) => {
                const Icon = modalityIcons[mf.modality] || Activity;
                const color = modalityColors[mf.modality] || '#94a3b8';
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">{modalityLabels[mf.modality]}</span>
                        <span className="text-sm font-bold" style={{ color }}>{mf.score}分</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${mf.score}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-xs text-slate-400">w={mf.weight}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 课程目标达成度 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">课程目标达成度</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {courseInfo?.objectives.map(obj => {
            const objRecords = records.filter(r => r.objectiveId === obj.id);
            const avgScore = objRecords.length > 0
              ? Math.round(objRecords.reduce((s, r) => s + r.value, 0) / objRecords.length)
              : 0;
            const achievement = Math.min(100, Math.round((avgScore / obj.targetScore) * 100));
            return (
              <div key={obj.id} className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{obj.dimension === 'knowledge' ? '📖' : obj.dimension === 'skill' ? '🔧' : '💡'} {obj.name}</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-2xl font-bold text-slate-800">{avgScore}</span>
                  <span className="text-xs text-slate-400 mb-1">/ {obj.targetScore}</span>
                </div>
                <div className="bg-slate-200 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${achievement >= 90 ? 'bg-emerald-500' : achievement >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${achievement}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">达成率 {achievement}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
