// ===== 学习者多模态画像页面（重构：Recharts 学术图表） =====
import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import RechartsCard from '../components/RechartsCard';
import {
  User, Brain, AlertCircle, Lightbulb, TrendingUp,
  Activity, Film, MousePointer2,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Tooltip as RTooltip, Legend as RLegend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { StudentMultimodalProfile } from '../types';

// ── 学术配色 ──────────────────────────────────────────────
const COLORS = {
  primary: '#2563eb',      // 科技蓝
  primaryAlpha: 'rgba(37, 99, 235, 0.15)',
  secondary: '#059669',    // 护眼绿
  accent: '#7c3aed',       // 紫罗兰
  warning: '#dc2626',      // 警示红
  amber: '#d97706',        // 琥珀橙
  slate: '#475569',        // 石灰色
};

const RADAR_DIMENSIONS = [
  { key: 'knowledge', label: '知识掌握' },
  { key: 'skill', label: '技能应用' },
  { key: 'creativity', label: '创新能力' },
  { key: 'collaboration', label: '协作能力' },
  { key: 'attitude', label: '学习态度' },
] as const;

export default function StudentProfilePage() {
  const { students, records, fetchData, studentProfiles } = useStore();
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [profile, setProfile] = useState<StudentMultimodalProfile | null>(null);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 优先从 API 获取画像数据，回退到本地模拟 ────────────
  useEffect(() => {
    if (!selectedStudent || students.length === 0) return;
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    // 尝试从 API 加载
    const apiProfile = studentProfiles.find(p => p.studentId === selectedStudent);
    if (apiProfile) {
      setProfile(apiProfile);
      return;
    }

    // 本地模拟数据（回退）
    const studentRecords = records.filter(r => r.studentId === selectedStudent);
    const week16Records = studentRecords.filter(r => r.week === 16);
    const behaviorRecords = week16Records.filter(r => r.type === 'behavior');
    const avgEngagement = behaviorRecords.length > 0
      ? Math.round(behaviorRecords.reduce((s, r) => s + r.value, 0) / behaviorRecords.length)
      : 60;

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
  }, [selectedStudent, students, records, studentProfiles]);

  // ── 雷达图数据 ──────────────────────────────────────────
  const radarData = useMemo(() => {
    if (!profile) return [];
    return RADAR_DIMENSIONS.map(dim => ({
      subject: dim.label,
      value: profile.abilityRadar[dim.key],
      fullMark: 100,
    }));
  }, [profile]);

  // ── 轨迹折线图数据 ──────────────────────────────────────
  const trajectoryData = useMemo(() => {
    if (!profile?.trajectory) return [];
    return profile.trajectory.map(t => ({
      week: `第${t.week}周`,
      knowledge: t.abilityRadar.knowledge,
      skill: t.abilityRadar.skill,
      creativity: t.abilityRadar.creativity,
      collaboration: t.abilityRadar.collaboration,
      attitude: t.abilityRadar.attitude,
    }));
  }, [profile]);

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
          <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>{profile.engagementScore}</p>
          <p className="text-xs text-slate-500">综合投入度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 五维能力雷达图 ──────────────────────────────── */}
        <RechartsCard title="五维能力雷达图">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.slate, fontSize: 13 }} />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
            />
            <Radar
              name={profile.studentName}
              dataKey="value"
              stroke={COLORS.primary}
              strokeWidth={2.5}
              fill={COLORS.primary}
              fillOpacity={0.2}
            />
            <RTooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
            />
            <RLegend wrapperStyle={{ marginTop: '12px', fontSize: '13px' }} />
          </RadarChart>
        </RechartsCard>

        {/* ── AI 精准诊断 ───────────────────────────────── */}
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
              <div className="flex items-center gap-2">
                <Film size={16} className="text-blue-500" />
                <span className="text-sm text-blue-700">视频专注度</span>
              </div>
              <span className="text-lg font-bold text-blue-800">{profile.videoEmotionAvg}分</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" />
                <span className="text-sm text-emerald-700">文本情感</span>
              </div>
              <span className="text-lg font-bold text-emerald-800">{profile.textSentimentAvg}分</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MousePointer2 size={16} className="text-amber-500" />
                <span className="text-sm text-amber-700">交互活跃度</span>
              </div>
              <span className="text-lg font-bold text-amber-800">{profile.interactionAvg}分</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 学习能力发展轨迹 ──────────────────────────────── */}
      <RechartsCard title="学习能力发展轨迹（近4周）">
        <LineChart data={trajectoryData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="week" tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis domain={[30, 100]} tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
          <RTooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <RLegend wrapperStyle={{ fontSize: '12px', marginTop: '8px' }} />
          <Line
            type="monotone" dataKey="knowledge"
            name="知识掌握" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 3 }}
          />
          <Line
            type="monotone" dataKey="skill"
            name="技能应用" stroke={COLORS.secondary} strokeWidth={2.5} dot={{ r: 3 }}
          />
          <Line
            type="monotone" dataKey="creativity"
            name="创新能力" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 3 }}
          />
          <Line
            type="monotone" dataKey="collaboration"
            name="协作能力" stroke={COLORS.amber} strokeWidth={2.5} dot={{ r: 3 }}
          />
          <Line
            type="monotone" dataKey="attitude"
            name="学习态度" stroke={COLORS.warning} strokeWidth={2.5} dot={{ r: 3 }}
          />
        </LineChart>
      </RechartsCard>

      {/* ── AI 个性化建议 ───────────────────────────────── */}
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
