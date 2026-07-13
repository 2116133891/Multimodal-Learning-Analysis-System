// ===== 学习者多模态画像页面 =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import CardChart from '../components/CardChart';
import { User, Brain, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import type { StudentMultimodalProfile } from '../types';

export default function StudentProfilePage() {
  const { students, records, fetchData } = useStore();
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [profile, setProfile] = useState<StudentMultimodalProfile | null>(null);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 模拟生成学生画像数据（实际应从API获取）
  useEffect(() => {
    if (!selectedStudent || students.length === 0) return;
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    // 基于真实数据计算
    const studentRecords = records.filter(r => r.studentId === selectedStudent);
    const week16Records = studentRecords.filter(r => r.week === 16);
    const behaviorRecords = week16Records.filter(r => r.type === 'behavior');

    const avgEngagement = behaviorRecords.length > 0
      ? Math.round(behaviorRecords.reduce((s, r) => s + r.value, 0) / behaviorRecords.length)
      : 60;

    // 根据学生ID模拟不同的画像特征
    const numId = parseInt(selectedStudent.replace('s', ''));
    const isStruggling = numId <= 5;

    setProfile({
      studentId: selectedStudent,
      studentName: student.name,
      week: 16,
      abilityRadar: {
        knowledge: isStruggling ? 45 + numId * 3 : 65 + (numId % 20),
        skill: isStruggling ? 40 + numId * 2 : 60 + (numId % 25),
        creativity: 50 + (numId % 35),
        collaboration: 55 + (numId % 30),
        attitude: isStruggling ? 50 + numId * 2 : 70 + (numId % 20),
      },
      videoEmotionAvg: isStruggling ? 35 + numId * 3 : 65 + (numId % 25),
      textSentimentAvg: 40 + (numId % 45),
      interactionAvg: isStruggling ? 25 + numId * 2 : 60 + (numId % 30),
      engagementScore: avgEngagement,
      bottleneck: isStruggling ? '视频学习专注度下降，交互行为减少' : '无明显瓶颈，学习状态良好',
      bottleneckScore: isStruggling ? 65 + numId * 2 : 15,
      recommendations: isStruggling
        ? ['增加视频互动环节', '设置分段学习目标', '引入同伴互助机制']
        : ['保持当前学习节奏', '可尝试拓展高阶内容'],
      trajectory: Array.from({ length: 4 }, (_, i) => {
        const w = 13 + i;
        const base = 55 + w * 2 + (numId % 15);
        return {
          week: w,
          engagementScore: Math.min(100, Math.max(30, Math.round(base + Math.random() * 10))),
          abilityRadar: {
            knowledge: Math.min(100, Math.max(30, Math.round(base * 0.9 + Math.random() * 10))),
            skill: Math.min(100, Math.max(30, Math.round(base * 0.85 + Math.random() * 10))),
            creativity: Math.min(100, Math.max(30, Math.round(base * 0.8 + Math.random() * 10))),
            collaboration: Math.min(100, Math.max(30, Math.round(base * 0.85 + Math.random() * 10))),
            attitude: Math.min(100, Math.max(30, Math.round(base * 0.95 + Math.random() * 10))),
          },
        };
      }),
    });
  }, [selectedStudent, students, records]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">请选择一名学生</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">学习者多模态画像</h2>
          <p className="text-sm text-slate-500 mt-1">以个体为单位的多模态特征分析与 AI 精准诊断</p>
        </div>
        <select
          value={selectedStudent}
          onChange={e => setSelectedStudent(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
        >
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name}（{s.id}）</option>
          ))}
        </select>
      </div>

      {/* 学生基本信息卡片 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {profile.studentName.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800">{profile.studentName}</h3>
          <p className="text-sm text-slate-500">ID: {profile.studentId} · 第{profile.week}周</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{profile.engagementScore}</p>
          <p className="text-xs text-slate-500">综合投入度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 五维能力雷达图 */}
        <CardChart
          title="五维能力雷达图"
          option={{
            tooltip: {},
            radar: {
              indicator: [
                { name: '知识掌握', max: 100 },
                { name: '技能应用', max: 100 },
                { name: '创新能力', max: 100 },
                { name: '协作能力', max: 100 },
                { name: '学习态度', max: 100 },
              ],
              shape: 'polygon', splitNumber: 5,
              axisName: { color: '#64748b' },
              splitArea: { areaStyle: { color: ['#f8fafc', '#fff'] } },
            },
            series: [{
              type: 'radar' as const,
              data: [{
                value: [
                  profile.abilityRadar.knowledge, profile.abilityRadar.skill,
                  profile.abilityRadar.creativity, profile.abilityRadar.collaboration,
                  profile.abilityRadar.attitude,
                ],
                name: profile.studentName,
                areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
                itemStyle: { color: '#3b82f6' },
                lineStyle: { color: '#3b82f6', width: 2 },
              }],
            }],
          }}
          height={350}
        />

        {/* AI 精准诊断 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Brain size={18} className="text-purple-600" />
            AI 精准诊断
          </h3>

          {/* 学习瓶颈 */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-red-700">学习瓶颈</span>
            </div>
            <p className="text-sm text-red-600">{profile.bottleneck}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-red-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${profile.bottleneckScore}%` }} />
              </div>
              <span className="text-xs font-bold text-red-700">{profile.bottleneckScore}分</span>
            </div>
            <p className="text-xs text-red-500 mt-1">瓶颈程度（越高越严重）</p>
          </div>

          {/* 三模态指标 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">📹 视频专注度</span>
              <span className="text-lg font-bold text-blue-800">{profile.videoEmotionAvg}分</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm text-emerald-700">💬 文本情感</span>
              <span className="text-lg font-bold text-emerald-800">{profile.textSentimentAvg}分</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-orange-700">🖱️ 交互活跃度</span>
              <span className="text-lg font-bold text-orange-800">{profile.interactionAvg}分</span>
            </div>
          </div>
        </div>
      </div>

      {/* 学习能力发展轨迹 */}
      <CardChart
        title="学习能力发展轨迹（近4周）"
        option={{
          tooltip: { trigger: 'axis' as const },
          legend: { data: ['知识', '技能', '创造力', '协作', '态度'], bottom: 0 },
          xAxis: { type: 'category' as const, data: profile.trajectory.map(t => `第${t.week}周`) },
          yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
          series: [
            { name: '知识', type: 'line' as const, data: profile.trajectory.map(t => t.abilityRadar.knowledge), smooth: true, itemStyle: { color: '#3b82f6' } },
            { name: '技能', type: 'line' as const, data: profile.trajectory.map(t => t.abilityRadar.skill), smooth: true, itemStyle: { color: '#10b981' } },
            { name: '创造力', type: 'line' as const, data: profile.trajectory.map(t => t.abilityRadar.creativity), smooth: true, itemStyle: { color: '#f59e0b' } },
            { name: '协作', type: 'line' as const, data: profile.trajectory.map(t => t.abilityRadar.collaboration), smooth: true, itemStyle: { color: '#6366f1' } },
            { name: '态度', type: 'line' as const, data: profile.trajectory.map(t => t.abilityRadar.attitude), smooth: true, itemStyle: { color: '#ec4899' } },
          ],
          grid: { left: 60, right: 20, top: 20, bottom: 60 },
        }}
        height={300}
      />

      {/* AI 个性化建议 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          AI 个性化建议
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profile.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <TrendingUp size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
