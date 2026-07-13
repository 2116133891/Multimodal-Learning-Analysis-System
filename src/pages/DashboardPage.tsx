// ===== 系统总览页面 =====
import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import StatCard from '../components/StatCard';
import CardChart from '../components/CardChart';
import { TrendingUp, Users, AlertTriangle, Target } from 'lucide-react';

export default function DashboardPage() {
  const { courseInfo, records, alerts, vitalityScores, loading, fetchData } = useStore();
  const [healthScore, setHealthScore] = useState(75);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (records.length > 0) {
      const week8 = records.filter(r => r.week === 8 && r.type === 'behavior');
      const avg = week8.length > 0 ? Math.round(week8.reduce((s, r) => s + r.value, 0) / week8.length) : 75;
      setHealthScore(avg);
    }
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">系统总览</h2>
        <p className="text-sm text-slate-500 mt-1">
          {courseInfo?.name} · {courseInfo?.semester} · {courseInfo?.type}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="课程健康度"
          value={`${healthScore}%`}
          icon={<TrendingUp size={20} />}
          trend="up"
          color="green"
        />
        <StatCard
          label="学生总数"
          value={courseInfo?.totalStudents || 0}
          icon={<Users size={20} />}
          color="blue"
        />
        <StatCard
          label="诊断告警"
          value={alerts.length}
          icon={<AlertTriangle size={20} />}
          color="orange"
        />
        <StatCard
          label="课程目标"
          value={courseInfo?.objectives.length || 0}
          icon={<Target size={20} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">课程模块</h3>
          <div className="space-y-3">
            {courseInfo?.modules.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">{mod.name}</p>
                  <p className="text-xs text-slate-400">{mod.description}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  第{mod.weekRange[0]}-{mod.weekRange[1]}周
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">近期诊断告警</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-orange-400' : 'bg-yellow-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    第{alert.week}周 · {alert.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CardChart
        title="课程生命力趋势"
        option={{
          tooltip: { trigger: 'axis' as const },
          legend: { data: ['总体', '课堂活力', '创造力', '学习感知', '资源延续', '课程进化'], bottom: 0 },
          xAxis: { type: 'category' as const, data: vitalityScores.map(v => `第${v.week}周`) },
          yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
          series: [
            { name: '总体', type: 'line', data: vitalityScores.map(v => v.overall), smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#3b82f6' } },
            { name: '课堂活力', type: 'line', data: vitalityScores.map(v => v.classroomVitality), smooth: true, itemStyle: { color: '#10b981' } },
            { name: '创造力', type: 'line', data: vitalityScores.map(v => v.creativity), smooth: true, itemStyle: { color: '#f59e0b' } },
            { name: '学习感知', type: 'line', data: vitalityScores.map(v => v.learningPerception), smooth: true, itemStyle: { color: '#6366f1' } },
            { name: '资源延续', type: 'line', data: vitalityScores.map(v => v.resourceExtension), smooth: true, itemStyle: { color: '#ec4899' } },
            { name: '课程进化', type: 'line', data: vitalityScores.map(v => v.courseEvolution), smooth: true, itemStyle: { color: '#8b5cf6' } },
          ],
        }}
        height={300}
      />
    </div>
  );
}
