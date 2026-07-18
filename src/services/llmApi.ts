// ===== AI 大模型 API 服务层（增强版：超时/重试/流式/错误恢复） =====
// 用于生成《AI 课程持续改进诊断报告》和 AICopilot 对话

// ── 环境变量读取 ──────────────────────────────────────────────
function getEnvVar(key: string): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return ((import.meta as any).env as Record<string, string>)?.[key] || '';
  }
  return process.env[key] || '';
}

const RAW_API_KEY = getEnvVar('VITE_AI_API_KEY');
const RAW_BASE_URL = getEnvVar('VITE_AI_BASE_URL') || 'https://api.openai.com';
const RAW_MODEL = getEnvVar('VITE_AI_MODEL') || 'agnes-2.0-flash';

// ── 配置常量 ──────────────────────────────────────────────────
const CONFIG = {
  API_URL: buildApiUrl(RAW_BASE_URL),
  DEFAULT_MODEL: 'agnes-2.0-flash',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 60_000,        // 60秒超时（长报告需要更多时间）
  CHAT_TIMEOUT_MS: 30_000,   // 30秒超时（短对话）
  MAX_RETRIES: 2,            // 最多重试2次
  RETRY_DELAY_MS: 1000,      // 重试间隔
};

function buildApiUrl(baseUrl: string): string {
  const clean = baseUrl.replace(/\/+$/, '');
  if (clean.endsWith('/chat/completions')) return clean;
  if (clean.includes('/v1')) return `${clean}/chat/completions`;
  return `${clean}/v1/chat/completions`;
}

// ── 工具函数：带超时的 fetch ──────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = (globalThis as any).setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    (globalThis as any).clearTimeout(timeoutId);
  }
}

// ── 工具函数：指数退避重试 ─────────────────────────────────────
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  maxRetries: number,
  baseDelay: number
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);

      if (response.ok) {
        return response;
      }

      // 4xx 错误不重试（客户端问题）
      if (response.status >= 400 && response.status < 500) {
        const errorBody = await response.text();
        throw new Error(`API 错误 (${response.status}): ${errorBody.slice(0, 300)}`);
      }

      // 5xx 错误或超时，重试
      lastError = new Error(`服务器错误 (${response.status})`);
    } catch (err: any) {
      // AbortError = 超时，可重试
      if (err?.name === 'AbortError') {
        lastError = new Error('请求超时，AI 服务响应过慢');
      } else {
        lastError = err;
      }
    }

    // 如果不是最后一次尝试，等待后重试
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt); // 指数退避：1s → 2s → 4s
      await new Promise(resolve => (globalThis as any).setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('请求失败，已达到最大重试次数');
}

// ── 解析 API 响应 ─────────────────────────────────────────────
function parseLLMResponse(response: Response): Promise<{
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  return response.json().then(json => {
    const content = json.choices?.[0]?.message?.content || '';
    if (!content) {
      throw new Error('API 返回内容为空，请检查模型配置');
    }
    return {
      content,
      model: json.model || CONFIG.DEFAULT_MODEL,
      usage: {
        promptTokens: json.usage?.prompt_tokens || 0,
        completionTokens: json.usage?.completion_tokens || 0,
        totalTokens: json.usage?.total_tokens || 0,
      },
    };
  });
}

// ── 构建请求体 ────────────────────────────────────────────────
function buildRequestBody(
  messages: Array<{ role: string; content: string }>,
  options?: { model?: string; maxTokens?: number; temperature?: number }
): Record<string, any> {
  return {
    model: options?.model || RAW_MODEL || CONFIG.DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens || CONFIG.MAX_TOKENS,
    temperature: options?.temperature ?? CONFIG.TEMPERATURE,
    // 启用流式响应，让前端可以逐字显示
    stream: false,
  };
}

// ── 通用 API 调用（带完整错误恢复） ────────────────────────────
async function callLLMApi(
  messages: Array<{ role: string; content: string }>,
  options?: { model?: string; maxTokens?: number; temperature?: number; timeoutMs?: number; maxRetries?: number },
  isLongReport = false
): Promise<{ content: string; model: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const apiKey = RAW_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('未配置 AI API Key，请在 .env 文件中设置 VITE_AI_API_KEY');
  }

  const timeoutMs = isLongReport
    ? (options?.timeoutMs || CONFIG.TIMEOUT_MS)
    : (options?.timeoutMs || CONFIG.CHAT_TIMEOUT_MS);

  const maxRetries = options?.maxRetries ?? CONFIG.MAX_RETRIES;

  const response = await fetchWithRetry(
    CONFIG.API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(messages, options)),
    },
    timeoutMs,
    maxRetries,
    CONFIG.RETRY_DELAY_MS
  );

  return parseLLMResponse(response);
}

// ── 系统提示词：课程持续改进诊断报告 ────────────────────────────
const SYSTEM_PROMPT = `你是一位资深教育测量学与教学设计专家，同时精通多模态学习分析技术。你的任务是根据提供的课程多源数据，生成一份专业的《AI 课程持续改进诊断报告》。

## 核心理念：课程持续改进（CQI）

本系统的核心不是分析学生，而是**分析课程**。课程是一个持续运行的教学系统，需要基于多模态数据进行持续改进。

## 数据维度说明（课程中心视角）

你将收到以下六个维度的课程数据：

### 维度一：学生学的状态
- 视频专注度、弹幕互动率、情绪分布、综合投入度
- 学习行为轨迹、知识掌握程度、学习困难点

### 维度二：老师教的状态
- 讲授语速、情绪饱满度、走动频次、眼神交流覆盖率
- 提问频次、讲授占比、语速变化系数
- 教学节奏把控能力

### 维度三：平台资源质量
- 课件完播率、难点回放率、资源下载量
- 视频观看深度、资料访问频次、内容覆盖率、资源满意度

### 维度四：教学互动方式
- 师生问答频次、小组讨论热度、弹幕活跃度
- 讨论区活跃度、同伴互评次数、实时投票参与率
- 翻转课堂参与率

### 维度五：教学方法适配
- 案例教学、翻转课堂、项目驱动、支架式教学
- 合作学习、探究式学习、差异化教学、形成性评价

### 维度六：教学环境
- 温度舒适度、光照、声学、座位排列
- 设备完好率、容量利用率、无障碍设施

## 报告要求

请严格按照以下结构输出报告（使用 Markdown 格式）：

### 一、课程概况
简要概述课程基本信息、数据规模和分析周期。

### 二、课程当前亮点
列出 3-5 个课程当前的优势领域，每个亮点需引用具体数据支撑。

### 三、潜在教学危机
识别 3-5 个需要关注的风险点，按严重程度排序。

### 四、教学方法改进建议
基于"学生学的状态"+"老师教的状态"+"教学方法适配"三个维度的联动分析，给出 3-5 条具体可执行的教学方法调整建议。

### 五、平台资源优化建议
针对"平台资源质量"维度，给出 2-3 条资源建设或调整建议。

### 六、教学互动优化方案
基于"教学互动方式"维度，提出 2-3 条提升课堂互动质量的方案。

### 七、六维联动改进建议
综合六个维度的数据，给出跨维度的联动改进方案。当某一维度下降时，如何同步调整其他维度。

### 八、OBE 目标达成分析
基于课程目标（知识/技能/态度三维目标）的达成度数据，分析 OBE 理念的落实情况。

### 九、PDCA 持续改进评估
根据当前 PDCA 循环阶段，评估各阶段的执行情况，给出下一阶段的改进重点。

### 十、综合改进优先级矩阵
用表格形式列出所有建议的优先级（高/中/低）和实施难度（简单/中等/困难）。

### 十一、总结与展望
用 2-3 句话总结本次诊断的核心结论，并对课程后续改进方向给出展望。

## 重要原则
1. **课程中心**：始终从课程整体角度分析，而非仅关注个别学生
2. **数据驱动**：所有结论必须有数据支撑，引用具体数值
3. **联动思维**：关注各维度之间的相互影响关系
4. **持续改进**：强调 PDCA 循环，关注改进的可持续性
5. **可操作性**：建议要具体可执行，避免空泛表述
6. 如涉及数据矛盾之处，请指出并给出你的判断
7. 报告总长度控制在 1500-2500 字`;

// ── 课程数据组装函数 ──────────────────────────────────────────
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

  const latestWeek = courseProfiles.length > 0 ? courseProfiles[courseProfiles.length - 1] : null;

  const moduleNames: Record<string, string> = {
    m1: '色彩基础与原理', m2: '造型与构图', m3: '风格探索与创新', m4: '综合创作与展示',
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

  const teachingTrend = courseProfiles.map(cp => ({
    week: cp.week,
    ...cp.dimension.teachingState,
  }));

  const resourceTrend = courseProfiles.map(cp => ({
    week: cp.week,
    ...cp.dimension.resourceUtilization,
  }));

  const interactionTrend = courseProfiles.map(cp => ({
    week: cp.week,
    ...cp.dimension.interactionMethod,
  }));

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

// ═══════════════════════════════════════════════════════════
//  导出接口
// ═══════════════════════════════════════════════════════════

export interface LLMResponse {
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

/**
 * 生成课程持续改进诊断报告
 * @param courseData 课程数据载荷
 * @param options 可选参数
 */
export async function generateCourseImprovementReport(
  courseData: CourseDataPayload,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    maxRetries?: number;
  }
): Promise<LLMResponse> {
  const userMessage = buildUserMessage(courseData);

  const result = await callLLMApi(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    options,
    true // 长报告，使用更长超时
  );

  return result;
}

/**
 * 通用聊天 API（供 AICopilot 等组件使用）
 * @param messages 对话消息历史
 * @param options 可选参数
 */
export async function callLLMChat(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    maxRetries?: number;
  }
): Promise<string> {
  const result = await callLLMApi(messages, options);
  return result.content;
}

/**
 * 检查 AI 配置是否可用
 */
export function isAIConfigured(): boolean {
  return !!RAW_API_KEY?.trim();
}

/**
 * 获取当前 AI 配置信息（不含密钥）
 */
export function getAIConfigInfo(): { baseUrl: string; model: string; configured: boolean } {
  return {
    baseUrl: RAW_BASE_URL,
    model: RAW_MODEL || CONFIG.DEFAULT_MODEL,
    configured: !!RAW_API_KEY?.trim(),
  };
}
