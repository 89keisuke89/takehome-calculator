import { POPULAR_SALARY_LEVELS, SEO_SALARY_LEVELS, toSalarySlug } from "./takehome";

export type SeoReport = {
  generatedAt: string;
  totalPages: number;
  recommendedActions: string[];
  priorityUrls: string[];
  markdown: string;
};

export function generateWeeklySeoReport(baseUrl: string): SeoReport {
  const generatedAt = new Date().toISOString();
  const topLevels = POPULAR_SALARY_LEVELS.slice(0, 6);
  const additionalLevels = SEO_SALARY_LEVELS.filter((salary) => !topLevels.includes(salary));
  const priorityUrls = [...topLevels, ...additionalLevels].map(
    (salary) => `${baseUrl}/takehome/${toSalarySlug(salary)}`
  );

  const recommendedActions = [
    "上位10URLのtitleを数値入りで更新",
    "上位10URLにFAQを最低3件ずつ追加",
    "各URLに近い年収リンクを4件以上維持",
    "Search Consoleで未インデックスURLを再送信",
  ];

  const markdown = [
    `# 週次SEOレポート`,
    ``,
    `- 生成日時: ${generatedAt}`,
    `- 生成対象URL数: ${SEO_SALARY_LEVELS.length}`,
    ``,
    `## 優先アクション`,
    ...recommendedActions.map((item, i) => `${i + 1}. ${item}`),
    ``,
    `## 優先URL`,
    ...priorityUrls.map((url) => `- ${url}`),
  ].join("\n");

  return {
    generatedAt,
    totalPages: SEO_SALARY_LEVELS.length,
    recommendedActions,
    priorityUrls,
    markdown,
  };
}
