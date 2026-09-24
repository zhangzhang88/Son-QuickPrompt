import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoDir = process.argv[2] || "/tmp/ai-boost-awesome-prompts";
const outputFile = process.argv[3] || path.resolve("seed-ai-boost-prompts.js");
const promptsDir = path.join(repoDir, "prompts");
const readme = readFileSync(path.join(repoDir, "README.md"), "utf8");

const categoryMap = new Map([
  ["Coding & Development", "AI编程"],
  ["DevOps & SRE", "DevOps 与 SRE"],
  ["Data Engineering", "数据分析"],
  ["AI & ML", "AI 与机器学习"],
  ["Product & Strategy", "产品策略"],
  ["Project Management", "项目管理"],
  ["Healthcare & Clinical", "医疗健康"],
  ["Industrial & Automotive", "工业与汽车"],
  ["Legal & Compliance", "法律合规"],
  ["Knowledge & Documentation", "知识文档"],
  ["Writing & Academic", "写作内容"],
  ["Learning & Education", "AI学习"],
  ["Research & Analysis", "学习研究"],
  ["Productivity & Tasks", "效率任务"],
  ["Safety & Compliance", "AI安全"],
  ["Meta & Prompt Engineering", "AI方法"],
  ["Image, Video & Audio Generation", "音视频"],
  ["Creative & Role-play", "创意角色扮演"],
  ["Game Development", "游戏开发"],
  ["Translation", "翻译本地化"],
  ["Legacy (2023 era — kept for reference)", "Legacy Prompts"]
]);

const titleTranslationMap = new Map([
  ["Agentic Coder", "代理式编码助手"],
  ["Code Reviewer", "代码审查专家"],
  ["Multi-Agent Orchestrator", "多智能体编排器"],
  ["Agent Harness Designer", "智能体运行框架设计师"],
  ["Agent Harness Performance Engineer", "智能体运行框架性能工程师"],
  ["Agent Virtual Filesystem Architect", "智能体虚拟文件系统架构师"],
  ["Autonomous Software Factory Orchestrator", "自主软件工厂编排器"],
  ["Computer Use Operator", "计算机操作代理"],
  ["Browser Harness Designer", "浏览器运行框架设计师"],
  ["Agent-Native CLI Designer", "智能体原生 CLI 设计师"],
  ["Agent Skill Designer", "智能体技能设计师"],
  ["Managed Agent Architect", "托管智能体架构师"],
  ["Agent Protocol Advisor", "智能体协议顾问"],
  ["Agentic Code Reasoner", "代理式代码推理专家"],
  ["Multi-Agent Communication Designer", "多智能体通信设计师"],
  ["Multi-Agent Topology Selector", "多智能体拓扑选择器"],
  ["Agent Cooperation Designer", "智能体协作设计师"],
  ["Vendor-Diverse Multi-Agent Ensemble Designer", "多供应商智能体集成设计师"],
  ["SQL Assistant", "SQL 助手"],
  ["Debugging Agent", "调试代理"],
  ["Disciplined Diagnostician", "严谨诊断专家"],
  ["System Design", "系统设计师"],
  ["Spec-Driven Development Architect", "规格驱动开发架构师"],
  ["Performance Profiler", "性能分析专家"],
  ["Refactoring Coach", "重构教练"],
  ["API Integration Architect", "API 集成架构师"],
  ["Database Schema Designer", "数据库模式设计师"],
  ["Test Strategy Architect", "测试策略架构师"],
  ["Claude Artifacts", "Claude Artifacts 应用设计师"],
  ["Professional Coder", "专业程序员"],
  ["Design System Spec Architect", "设计系统规格架构师"],
  ["Generative UI Architect", "生成式 UI 架构师"],
  ["Open Design Orchestrator", "开放设计编排器"],
  ["Magazine Web Deck Designer", "杂志式网页演示设计师"],
  ["Frontend Taste Engineer", "前端审美工程师"],
  ["Frontend Developer", "前端开发工程师"],
  ["Web Quality Auditor", "网页质量审计师"],
  ["Mobile App Builder", "移动应用构建师"],
  ["SwiftUI Code Reviewer", "SwiftUI 代码审查专家"],
  ["Solidity Smart Contract Engineer", "Solidity 智能合约工程师"],
  ["Solana Blockchain Architect", "Solana 区块链架构师"],
  ["Emotion-Aware Engineering Partner", "情绪感知工程伙伴"],
  ["Verification Specialist", "验证专家"],
  ["Tech Debt Auditor", "技术债审计师"],
  ["Andrej Karpathy Coding Guidelines", "Andrej Karpathy 编码指南"],
  ["Coding Agent System Prompt", "编码智能体系统提示词"],
  ["Technical Diagram Engineer", "技术图表工程师"],
  ["Claude Code Sub-Agent Designer", "Claude Code 子智能体设计师"],
  ["Solution Architect", "解决方案架构师"],
  ["Pragmatic Programmer", "务实程序员"],
  ["Classic Software Engineering Canon", "经典软件工程准则"],
  ["AGENTS.md Author", "AGENTS.md 编写专家"],
  ["Codebase Knowledge Graph Architect", "代码库知识图谱架构师"],
  ["Parallel Codegen Architect", "并行代码生成架构师"],
  ["Opinionated Agent Team Designer", "主张明确的智能体团队设计师"],
  ["Native-Feel Desktop Architect", "原生体验桌面应用架构师"],
  ["Incident Response Commander", "事故响应指挥官"],
  ["SRE", "站点可靠性工程师"],
  ["Cloud Architect", "云架构师"],
  ["Kubernetes Specialist", "Kubernetes 专家"],
  ["Platform Engineer", "平台工程师"],
  ["Release Engineer", "发布工程师"],
  ["Data Engineer", "数据工程师"],
  ["Analytics Engineer", "分析工程师"],
  ["Data Platform Architect", "数据平台架构师"],
  ["Data Governance Architect", "数据治理架构师"],
  ["ML Systems Architect", "机器学习系统架构师"],
  ["LLM Architect", "大语言模型架构师"],
  ["Realtime Voice Agent Architect", "实时语音智能体架构师"],
  ["Multimodal Agent Designer", "多模态智能体设计师"],
  ["Long-Horizon Multimodal Search Agent", "长程多模态搜索智能体"],
  ["AI Ethics Reviewer", "AI 伦理审查专家"],
  ["MLOps Engineer", "MLOps 工程师"],
  ["Embodied AI Developer", "具身智能开发者"],
  ["Agent World Model Architect", "智能体世界模型架构师"],
  ["On-Device AI Deployment Architect", "端侧 AI 部署架构师"],
  ["Self-Improving Agent Architect", "自我改进智能体架构师"],
  ["Agentic Company Orchestrator", "代理式公司编排器"],
  ["Open Deep Research Agent Architect", "开放深度研究智能体架构师"],
  ["Quantitative Trading Agent Architect", "量化交易智能体架构师"],
  ["Autonomous ML Research Agent", "自主机器学习研究智能体"],
  ["Self-Distillation Code Generation Strategist", "自蒸馏代码生成策略师"],
  ["Verifier Engineering Strategist", "验证器工程策略师"],
  ["Product Manager", "产品经理"],
  ["AI-Native Product Architect", "AI 原生产品架构师"],
  ["UX Research Specialist", "用户体验研究专家"],
  ["CFO / Financial Strategy", "CFO 与财务战略顾问"],
  ["Sales Strategist", "销售策略师"],
  ["Customer Success Strategist", "客户成功策略师"],
  ["Growth Hacker", "增长黑客"],
  ["Operations Manager", "运营经理"],
  ["Change Management Leader", "变革管理负责人"],
  ["Recruitment Strategist", "招聘策略师"],
  ["Community Manager", "社区经理"],
  ["Brand Strategist", "品牌策略师"],
  ["HR / Talent Development", "人力资源与人才发展顾问"],
  ["Financial Advisor", "财务顾问"],
  ["SEO Specialist", "SEO 专家"],
  ["Developer Advocate", "开发者关系专家"],
  ["Growth Engineering Skill Architect", "增长工程技能架构师"],
  ["Scrum Master", "敏捷教练"],
  ["Project Recovery Specialist", "项目恢复专家"],
  ["Agile Transformation Lead", "敏捷转型负责人"],
  ["Technical Program Manager", "技术项目经理"],
  ["Clinical Assistant", "临床助手"],
  ["Healthcare AI Architect", "医疗健康 AI 架构师"],
  ["Clinical Research Coordinator", "临床研究协调员"],
  ["Health Informatics Specialist", "健康信息学专家"],
  ["Bioinformatics Engineer", "生物信息工程师"],
  ["Automotive Functional Safety Architect", "汽车功能安全架构师"],
  ["Industrial Robotics Architect", "工业机器人架构师"],
  ["Agentic CAD & Hardware Designer", "代理式 CAD 与硬件设计师"],
  ["Embedded Firmware Engineer", "嵌入式固件工程师"],
  ["Legal Analyst", "法律分析师"],
  ["Compliance Auditor", "合规审计师"],
  ["Regulatory Affairs Specialist", "法规事务专家"],
  ["Contract Negotiation Strategist", "合同谈判策略师"],
  ["Knowledge Management Architect", "知识管理架构师"],
  ["Technical Documentation Strategist", "技术文档策略师"],
  ["Personal Knowledge Assistant", "个人知识助手"],
  ["Knowledge Base Architect", "知识库架构师"],
  ["Personal Agent Brain Architect", "个人智能体大脑架构师"],
  ["All-around Writer", "全能写作助手"],
  ["Academic Assistant Pro", "专业学术助手"],
  ["Literature Professor", "文学教授"],
  ["Technical Writer", "技术写作专家"],
  ["Academic Peer Reviewer", "学术同行评审专家"],
  ["Research Paper Proofreader", "研究论文校对专家"],
  ["Talk-Normal Enabler", "自然表达优化器"],
  ["Humanizer", "人味化写作助手"],
  ["Agent Style Enforcer", "智能体风格执行器"],
  ["Nature-Style Scientific Writer", "Nature 风格科学写作专家"],
  ["Mr. Ranedeer v2.7", "Ranedeer 先生 v2.7"],
  ["All-around Teacher", "全能教师"],
  ["LearnOS PRO", "LearnOS 专业版"],
  ["Socratic Tutor", "苏格拉底式导师"],
  ["Adaptive Learning Designer", "自适应学习设计师"],
  ["Deep Research Agent", "深度研究智能体"],
  ["AI Co-Mathematician", "AI 数学协作专家"],
  ["Data Analysis", "数据分析助手"],
  ["Data Analyst", "数据分析师"],
  ["Reasoning Specialist", "推理专家"],
  ["Emotion-Aware Research Partner", "情绪感知研究伙伴"],
  ["Multimodal Analyst", "多模态分析师"],
  ["Autonomous Web Agent", "自主网页智能体"],
  ["Structured Output Extractor", "结构化输出提取器"],
  ["Investment Research Analyst", "投资研究分析师"],
  ["Market Research Strategist", "市场研究策略师"],
  ["GTD Productivity Assistant", "GTD 效率助手"],
  ["Customer Support Agent", "客户支持代理"],
  ["Deep Work Facilitator", "深度工作促进者"],
  ["Executive Operations Partner", "高管运营伙伴"],
  ["Career Operations Agent", "职业发展运营代理"],
  ["Content Moderator", "内容审核员"],
  ["Prompt Injection Guardian", "提示词注入防护专家"],
  ["Computer Use Safety Tester", "计算机操作安全测试员"],
  ["Security Researcher", "安全研究员"],
  ["QA Agent", "质量保证代理"],
  ["Accessibility Auditor", "无障碍审计师"],
  ["Threat Detection Engineer", "威胁检测工程师"],
  ["Goal Drift Auditor", "目标漂移审计师"],
  ["Agent Skill Supply-Chain Security Auditor", "智能体技能供应链安全审计师"],
  ["Agent Red Team Architect", "智能体红队架构师"],
  ["Plan-Execute Safety Architect", "计划执行安全架构师"],
  ["Agent Permission Auto-Mode Architect", "智能体权限自动模式架构师"],
  ["OWASP Secure Application Architect", "OWASP 安全应用架构师"],
  ["Cybersecurity Skill Architect", "网络安全技能架构师"],
  ["Internal Safety Collapse Auditor", "内部安全失效审计师"],
  ["Agent-Powered Vulnerability Scanner Architect", "智能体驱动漏洞扫描架构师"],
  ["Chain of Draft", "草稿链"],
  ["Prompt Compression Strategist", "提示词压缩策略师"],
  ["Reasoning Model Prompting", "推理模型提示词设计"],
  ["Disclosure Policy Designer", "披露政策设计师"],
  ["Meta Prompt", "元提示词"],
  ["Prompt Creator", "提示词创建器"],
  ["Eval & Benchmark Architect", "评测与基准架构师"],
  ["Agent Eval Designer", "智能体评测设计师"],
  ["Agent Reliability Engineer", "智能体可靠性工程师"],
  ["Agent Trajectory Triage Specialist", "智能体轨迹分诊专家"],
  ["Eval Awareness Auditor", "评测感知审计师"],
  ["LLM-as-a-Judge Routing Strategist", "LLM 评审路由策略师"],
  ["Agent Memory Architect", "智能体记忆架构师"],
  ["Cognitive Externalization Architect", "认知外化架构师"],
  ["Local-First Memory Engineer", "本地优先记忆工程师"],
  ["Elastic Context Orchestrator", "弹性上下文编排器"],
  ["Procedural Knowledge Architect", "过程性知识架构师"],
  ["Clarification Timing Strategist", "澄清时机策略师"],
  ["Interruptible Agent Planner", "可中断智能体规划师"],
  ["Lookahead Planning Specialist", "前瞻规划专家"],
  ["Persistent-File Planning Agent", "持久文件规划智能体"],
  ["Structured Schema Instruction Designer", "结构化 Schema 指令设计师"],
  ["Constraint Typology Architect", "约束类型学架构师"],
  ["Reasoning Drift Auditor", "推理漂移审计师"],
  ["Reasoning Theater Diagnostician", "推理剧场诊断专家"],
  ["Web Agent Failure Diagnostician", "网页智能体失败诊断专家"],
  ["ADK SkillToolset Designer", "ADK 技能工具集设计师"],
  ["Multi-Agent RAG Orchestrator", "多智能体 RAG 编排器"],
  ["Tool Schema Architect", "工具 Schema 架构师"],
  ["Agent Tool Engineer", "智能体工具工程师"],
  ["Agent Governance Orchestrator", "智能体治理编排器"],
  ["Trustworthy Agent Reviewer", "可信智能体审查专家"],
  ["Agents Best Practices", "智能体最佳实践"],
  ["Prompt Engineer", "提示词工程师"],
  ["MCP Server Architect", "MCP 服务器架构师"],
  ["Skill Self-Evolution Designer", "技能自进化设计师"],
  ["HyperAgents Designer", "HyperAgents 设计师"],
  ["Test-Time Compute Scaling Strategist", "测试时计算扩展策略师"],
  ["Meta-Cognitive Tool Use Specialist", "元认知工具使用专家"],
  ["Diffusion LM Prompt Engineer", "扩散语言模型提示词工程师"],
  ["North Star System Prompt", "北极星系统提示词"],
  ["Caveman Mode", "穴居人模式"],
  ["Prompt Master", "提示词大师"],
  ["Cognitive Distillation Architect", "认知蒸馏架构师"],
  ["Parallel Prompt Learning Strategist", "并行提示词学习策略师"],
  ["Flux Image Gen", "Flux 生图提示词"],
  ["Generative Image Prompt Engineer", "生成式图像提示词工程师"],
  ["Video Generation Guide", "视频生成指南"],
  ["Meta MJ", "Midjourney 元提示词"],
  ["3D Generative Artist", "3D 生成艺术家"],
  ["Cinematography Prompt Engineer", "电影摄影提示词工程师"],
  ["Generative Audio Prompt Engineer", "生成式音频提示词工程师"],
  ["Agentic Video Editor", "代理式视频编辑器"],
  ["Local-First Voice I/O Architect", "本地优先语音输入输出架构师"],
  ["Vampire: The Masquerade", "吸血鬼：避世血族"],
  ["Beauty D&D", "美妆 D&D"],
  ["Immersive Narrative Designer", "沉浸式叙事设计师"],
  ["Creative Writing Coach", "创意写作教练"],
  ["Game Designer", "游戏设计师"],
  ["Game AI Designer", "游戏 AI 设计师"],
  ["Game Level Designer", "游戏关卡设计师"],
  ["Game Economy Designer", "游戏经济系统设计师"],
  ["Game Studio Multi-Agent Orchestrator", "游戏工作室多智能体编排器"],
  ["PDF Translator", "PDF 翻译器"],
  ["Localization & Globalization Strategist", "本地化与全球化策略师"],
  ["Cross-Cultural Communication Designer", "跨文化传播设计师"],
  ["Technical Translator & Localizer", "技术翻译与本地化专家"],
  ["AutoGPT", "自动 GPT"],
  ["QuickSilver OS", "QuickSilver 操作系统"],
  ["SuperPrompt", "超级提示词"],
  ["Luna", "Luna 助手"]
]);

function cleanTitle(value) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
}

function titleFromFilename(filename) {
  return cleanTitle(path.basename(filename, path.extname(filename))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " "));
}

function slugify(filename) {
  const base = path.basename(filename, path.extname(filename));
  const slug = base
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug) {
    return slug;
  }

  const hash = Array.from(Buffer.from(filename))
    .reduce((value, byte) => ((value << 5) - value + byte) >>> 0, 0)
    .toString(36);
  return `prompt-${hash}`;
}

function sourceUrl(filename) {
  const encoded = filename
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://github.com/ai-boost/awesome-prompts/blob/main/prompts/${encoded}`;
}

function localizeTitle(title) {
  const value = String(title || "").trim();
  const translation = titleTranslationMap.get(value);
  return translation ? `${value}（${translation}）` : value;
}

function normalizeSection(section) {
  return String(section || "").replace(/<[^>]+>/g, "").trim();
}

function promptTypeFor(meta, filename) {
  const haystack = `${meta.title || ""} ${meta.description || ""} ${filename}`.toLowerCase();

  if (/\b(video|cinematography|veo|sora|runway|pika)\b/.test(haystack)) {
    return "video";
  }

  if (/\b(image|diffusion|flux|midjourney|mj|visual|generative artist)\b/.test(haystack)) {
    return "image";
  }

  return "text";
}

function parseReadmePromptRows() {
  const rowsByFilename = new Map();
  let section = "";

  for (const line of readme.split(/\r?\n/)) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      section = normalizeSection(heading[1]);
      continue;
    }

    const row = line.match(/^\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*\[prompt\]\((?:https:\/\/github\.com\/ai-boost\/awesome-prompts\/blob\/main\/)?prompts\/([^)]+)\)\s*\|\s*$/);
    if (!row) {
      continue;
    }

    const filename = decodeURIComponent(row[3]);
    if (!rowsByFilename.has(filename)) {
      rowsByFilename.set(filename, {
        title: cleanTitle(row[1]) || titleFromFilename(filename),
        description: row[2].trim(),
        section
      });
    }
  }

  return rowsByFilename;
}

function getCommit() {
  try {
    return execFileSync("git", ["-C", repoDir, "rev-parse", "--short", "HEAD"], {
      encoding: "utf8"
    }).trim();
  } catch (error) {
    return "unknown";
  }
}

const rowsByFilename = parseReadmePromptRows();
const files = readdirSync(promptsDir)
  .filter((filename) => /\.(md|txt)$/i.test(filename));

const sortedFiles = [
  ...Array.from(rowsByFilename.keys()).filter((filename) => files.includes(filename)),
  ...files.filter((filename) => !rowsByFilename.has(filename)).sort((a, b) => a.localeCompare(b))
];

const createdAt = "2026-05-20T00:00:00.000Z";
const items = sortedFiles.map((filename) => {
  const meta = rowsByFilename.get(filename) || {
    title: titleFromFilename(filename),
    description: "",
    section: "Legacy (2023 era — kept for reference)"
  };
  const section = normalizeSection(meta.section);
  const category = categoryMap.get(section) || "AI方法";
  const content = readFileSync(path.join(promptsDir, filename), "utf8").trim();
  const originalTitle = meta.title;

  return {
    id: `ai-boost-${slugify(filename)}`,
    title: localizeTitle(originalTitle),
    content,
    category,
    promptType: promptTypeFor(meta, filename),
    shortcut: "",
    tags: ["Awesome Prompts", section].filter(Boolean),
    favorite: false,
    usageCount: 0,
    createdAt,
    updatedAt: createdAt,
    source: {
      name: "ai-boost/awesome-prompts",
      author: "ai-boost contributors",
      license: "GPL-3.0",
      url: sourceUrl(filename),
      sourceLabel: "Awesome Prompts",
      originalTitle,
      section,
      description: meta.description
    }
  };
});

const commit = getCommit();
const js = `// Generated from https://github.com/ai-boost/awesome-prompts at ${commit}.
// Prompt text is licensed GPL-3.0 by ai-boost/awesome-prompts contributors.
(function (root) {
  root.QuickPromptAiBoostSeedItems = ${JSON.stringify(items, null, 2)};
})(globalThis);
`;

writeFileSync(outputFile, js.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"));
console.log(`Generated ${items.length} ai-boost prompt seed items at ${outputFile}`);
