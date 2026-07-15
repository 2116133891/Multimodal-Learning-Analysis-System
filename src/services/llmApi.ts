// ===== AI 大模型 API 服务层（兼容 OpenAI 格式） =====
// 用于生成《AI 课程持续改进诊断报告》

// ── 环境变量读取（兼容 Vite 和 Node.js 测试环境） ─────────
function getEnvVar(key: string): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return ((import.meta as any).env as Record<string, string>)?.[key] || '';
  }
  return process.env[key] || '';
}

const RAW_API_KEY = getEnvVar('VITE_AI_API_KEY');
const RAW_BASE_URL = getEnvVar('VITE_AI_BASE_URL') || 'https://api.openai.com';
const RAW_MODEL = getEnvVar('VITE_AI_MODEL') || 'agnes-2.0-flash';

// ── URL 拼接：自动处理 /v1 前缀 ──────────────────────────
function buildApiUrl(baseUrl: string): string {
  const clean = baseUrl.replace(/\/+$/, '');
  // 如果已包含 /chat/completions，直接返回
  if (clean.endsWith('/chat/completions')) return clean;
  // 如果已包含 /v1，补 /chat/completions
  if (clean.includes('/v1')) return `${clean}/chat/completions`;
  // 都不含，补全 /v1/chat/completions
  return `${clean}/v1/chat/completions`;
}

const API_URL = buildApiUrl(RAW_BASE_URL);

// ── 常量配置 ──────────────────────────────────────────────
const DEFAULT_MODEL = 'agnes-2.0-flash';
const MAX_TOKENS = 4096;
const TEMPERATURE = 0.7;

// ── 系统提示词 ──────────────────────────────────────────────
const SYSTEM_PROMPT = `你是一位资深教育测量学与教学设计专家，同时精通多模态学习分析技术。你的任务是根据提供的课程多源数据，生成一份专业的《AI 课程持续改进诊断报告》。

## 数据维度说明

你将收到以下维度的课程数据：
1. **教师教学状态**：讲授语速、情绪饱满度、走动频次、眼神交流覆盖率、提问频次、讲授占比、语速变化系数
2. **课程平台资源**：课件完播率、难点回放率、资源下载量、视频观看深度、资料访问频次、内容覆盖率、资源满意度
3. **互动方式与教学方法**：师生问答频次、小组讨论热度、弹幕活跃度、讨论区活跃度、同伴互评次数、实时投票参与率、翻转课堂参与率
4. **课程健康度**：综合健康度评分（0-100）、健康等级（A/B/C/D）、风险标签、改善信号
5. **传统学习数据**：行为数据、过程数据、成果数据、教师评价、课程反馈
6. **多模态特征**：视频微表情、文本语义、交互行为、传统数据的融合分析
7. **AI 优化建议**：历史建议及采纳情况
8. **课程生命力评分**：五维生命力评估（课堂活力、创造力、学习感知、资源延续、课程进化）

## 报告要求

请严格按照以下结构输出报告（使用 Markdown 格式）：

### 一、课程概况
简要概述课程基本信息、数据规模和分析周期。

### 二、当前课程亮点
列出 3-5 个课程当前的优势领域，每个亮点需引用具体数据支撑。例如：
- 亮点名称
- 数据证据（引用具体数值）
- 简要分析

### 三、潜在教学危机
识别 3-5 个需要关注的风险点，按严重程度排序。每个危机需包含：
- 问题描述
- 数据依据
- 影响范围

### 四、教学方法改进建议
给出 3-5 条具体可执行的教学方法调整建议，每条建议需：
- 明确的操作步骤
- 预期的改善效果
- 所需资源或时间

### 五、课程资源优化建议
针对平台资源利用率，给出 2-3 条资源建设或调整建议。

### 六、互动方式优化方案
基于互动数据，提出 2-3 条提升课堂互动质量的方案。

### 七、综合改进优先级矩阵
用表格形式列出所有建议的优先级（高/中/低）和实施难度（简单/中等/困难）。

### 八、总结与展望
用 2-3 句话总结本次诊断的核心结论，并对课程后续改进方向给出展望。

## 注意事项
1. 所有结论必须基于提供的数据，不得凭空捏造
2. 语言风格专业但不晦涩，适合一线教师阅读
3. 建议要具体可执行，避免空泛的"加强""优化"类表述
4. 如涉及数据矛盾之处，请指出并给出你的判断
5. 报告总长度控制在 1500-2500 字`;

// ── 课程数据组装函数 ──────────────────────────────────────
interface CourseDataPayload {
  courseInfo: any;
  students: any[];
  records: any[];
  vitalityScores: any[];
  alerts: any[];
  multimodalFeatures: any[];
  suggestions: any[];
  interventions: any[];
  courseProfiles: any[];
  studentProfiles: any[];
  dataQuality: any;
}

function buildUserMessage(data: CourseDataPayload): string {
  const { courseInfo, students, records, vitalityScores, alerts, multimodalFeatures, suggestions, interventions, courseProfiles, studentProfiles, dataQuality } = data;

  // 最新周数据
  const latestWeek = courseProfiles.length > 0 ? courseProfiles[courseProfiles.length - 1] : null;

  // 模块统计
  const moduleNames: Record<string, string> = {
    m1: '色彩基础与原理',
    m2: '造型与构图',
    m3: '风格探索与创新',
    m4: '综合创作与展示',
  };

  const moduleStats = ['m1', 'm2', 'm3', 'm4'].map(modId => {
    const modRecords = records.filter(r => r.moduleId === modId);
    const behaviors = modRecords.filter(r => r.type === 'behavior');
    const outcomes = modRecords.filter(r => r.type === 'outcome');
    const processes = modRecords.filter(r => r.type === 'process');
    return {
      id: modId,
      name: moduleNames[modId] || modId,
      totalRecords: modRecords.length,
      avgBehavior: behaviors.length > 0 ? Math.round(behaviors.reduce((s, r) => s + r.value, 0) / behaviors.length) : 0,
      avgOutcome: outcomes.length > 0 ? Math.round(outcomes.reduce((s, r) => s + r.value, 0) / outcomes.length) : 0,
      avgProcess: processes.length > 0 ? Math.round(processes.reduce((s, r) => s + r.value, 0) / processes.length) : 0,
    };
  });

  // 多模态融合统计
  const modalityStats = ['video_emotion', 'text_semantic', 'interaction_behavior', 'traditional_data'].map(mod => {
    const vals = multimodalFeatures.flatMap(f =>
      f.modalityFeatures.filter(m => m.modality === mod).map(m => m.score)
    );
    return {
      modality: mod,
      avgScore: vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
      count: vals.length,
    };
  });

  // 教学状态趋势
  const teachingTrend = courseProfiles.map(cp => ({
    week: cp.week,
    ...cp.dimension.teachingState,
  }));

  // 资源利用率趋势
  const resourceTrend = courseProfiles.map(cp => ({
    week: cp.week,
    ...cp.dimension.resourceUtilization,
  }));

  // 互动方式趋势
  const interactionTrend = courseProfiles.map(cp => ({
    week: cp.week,
    ...cp.dimension.interactionMethod,
  }));

  // 健康度趋势
  const healthTrend = courseProfiles.map(cp => ({
    week: cp.week,
    health: cp.overallHealth,
    grade: cp.healthGrade,
    riskFlags: cp.riskFlags,
    improvementSignals: cp.improvementSignals,
  }));

  return `## 课程数据

### 课程基本信息
- 课程名称：${courseInfo?.name || '未知'}
- 课程类型：${courseInfo?.type || '未知'}
- 学期：${courseInfo?.semester || '未知'}
- 授课教师：${courseInfo?.instructor || '未知'}
- 学生人数：${students?.length || 0}
- 课程周数：${courseInfo?.totalWeeks || 16}

### 数据质量
- 完整性：${dataQuality?.completeness || 0}%
- 及时性：${dataQuality?.timeliness || 0}%
- 准确性：${dataQuality?.accuracy || 0}%
- 总记录数：${records?.length || 0}

### 模块数据摘要
${moduleStats.map(m => `- **${m.name}**：行为均分 ${m.avgBehavior}，成果均分 ${m.avgOutcome}，过程均分 ${m.avgProcess}（共 ${m.totalRecords} 条记录）`).join('\n')}

### 多模态融合统计
${modalityStats.map(s => `- ${s.modality}：均分 ${s.avgScore}（${s.count} 个样本）`).join('\n')}

### 教师教学状态趋势（16周）
${JSON.stringify(teachingTrend, null, 2)}

### 课程资源利用率趋势（16周）
${JSON.stringify(resourceTrend, null, 2)}

### 互动方式趋势（16周）
${JSON.stringify(interactionTrend, null, 2)}

### 课程健康度趋势（16周）
${JSON.stringify(healthTrend, null, 2)}

### 课程生命力评分趋势
${JSON.stringify(vitalityScores, null, 2)}

### 诊断告警
${JSON.stringify(alerts, null, 2)}

### AI 优化建议
${JSON.stringify(suggestions, null, 2)}

### 干预有效性
${JSON.stringify(interventions, null, 2)}

### 学生画像摘要（前10名）
${JSON.stringify((studentProfiles || []).slice(0, 10), null, 2)}

### 最新一周（第${latestWeek?.week || 16}周）画像快照
- 综合健康度：${latestWeek?.overallHealth || 0}/100
- 健康等级：${latestWeek?.healthGrade || 'N/A'}
- 风险标签：${(latestWeek?.riskFlags || []).join('、') || '无'}
- 改善信号：${(latestWeek?.improvementSignals || []).join('、') || '无'}

请基于以上全部数据，生成一份专业的《AI 课程持续改进诊断报告》。`;
}

// ── 调用 LLM API ──────────────────────────────────────────
interface LLMResponse {
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function generateCourseImprovementReport(
  courseData: CourseDataPayload,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<LLMResponse> {
  const apiKey = RAW_API_KEY.trim();

  if (!apiKey) {
    throw new Error('未配置 AI API Key，请在 .env 文件中设置 VITE_AI_API_KEY');
  }

  const userMessage = buildUserMessage(courseData);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model || RAW_MODEL || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: options?.maxTokens || MAX_TOKENS,
      temperature: options?.temperature ?? TEMPERATURE,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `API 请求失败 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.error?.message || errorBody;
    } catch {
      errorMessage = `${errorMessage}: ${errorBody.slice(0, 200)}`;
    }
    throw new Error(errorMessage);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content || '';

  if (!content) {
    throw new Error('API 返回内容为空，请检查模型配置');
  }

  return {
    content,
    model: json.model || RAW_MODEL || DEFAULT_MODEL,
    usage: {
      promptTokens: json.usage?.prompt_tokens || 0,
      completionTokens: json.usage?.completion_tokens || 0,
      totalTokens: json.usage?.total_tokens || 0,
    },
  };
}
