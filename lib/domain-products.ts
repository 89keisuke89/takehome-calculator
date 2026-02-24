export type DomainEconomicsInput = {
  leadsPerMonth: number;
  activationRatePercent: number;
  monthlyPrice: number;
  variableCostPercent: number;
  retentionMonths: number;
  acquisitionCostPerLead: number;
};

export type DomainEconomicsResult = {
  activatedCustomers: number;
  monthlyRecurringRevenue: number;
  monthlyVariableCost: number;
  monthlyGrossProfit: number;
  annualGrossProfit: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  paybackMonths: number;
};

export type DomainProduct = {
  slug: string;
  domain: string;
  title: string;
  category: string;
  oneLiner: string;
  target: string;
  pricingModel: string;
  keyProblems: string[];
  mvpFeatures: string[];
  launchChecklist: string[];
  economicsDefault: DomainEconomicsInput;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

function clampNonNegative(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, value);
}

export function calculateDomainEconomics(input: DomainEconomicsInput): DomainEconomicsResult {
  const leadsPerMonth = Math.round(clampNonNegative(input.leadsPerMonth));
  const activationRatePercent = clampPercent(input.activationRatePercent);
  const variableCostPercent = clampPercent(input.variableCostPercent);
  const monthlyPrice = clampNonNegative(input.monthlyPrice);
  const retentionMonths = clampNonNegative(input.retentionMonths);
  const acquisitionCostPerLead = clampNonNegative(input.acquisitionCostPerLead);

  const activationRate = activationRatePercent / 100;
  const variableCostRate = variableCostPercent / 100;
  const activatedCustomers = Math.round(leadsPerMonth * activationRate);
  const monthlyRecurringRevenue = activatedCustomers * monthlyPrice;
  const monthlyVariableCost = monthlyRecurringRevenue * variableCostRate;
  const monthlyGrossProfit = monthlyRecurringRevenue - monthlyVariableCost;
  const annualGrossProfit = monthlyGrossProfit * 12;

  const customerAcquisitionCost =
    activationRate === 0 ? Number.POSITIVE_INFINITY : acquisitionCostPerLead / activationRate;
  const contributionPerCustomer = monthlyPrice * (1 - variableCostRate);
  const lifetimeValue = contributionPerCustomer * retentionMonths;
  const paybackMonths =
    contributionPerCustomer <= 0
      ? Number.POSITIVE_INFINITY
      : customerAcquisitionCost / contributionPerCustomer;

  return {
    activatedCustomers,
    monthlyRecurringRevenue,
    monthlyVariableCost,
    monthlyGrossProfit,
    annualGrossProfit,
    customerAcquisitionCost,
    lifetimeValue,
    paybackMonths,
  };
}

export const DOMAIN_PRODUCTS: DomainProduct[] = [
  {
    slug: "receivable-flow",
    domain: "receivable-flow.com",
    title: "請求・入金回収自動化",
    category: "FinOps",
    oneLiner: "請求発行から督促までを自動化し、未入金を削減するSaaS",
    target: "請求件数が月50件以上ある中小企業",
    pricingModel: "月額 9,800円 + 督促送信件数の従量課金",
    keyProblems: [
      "請求漏れと催促漏れが発生し、入金が遅れる",
      "担当者依存で督促文面やタイミングがばらつく",
      "入金予測が立たずキャッシュフローが不安定",
    ],
    mvpFeatures: [
      "請求書の定期自動発行",
      "支払期限超過時の自動リマインド",
      "入金ステータスのリアルタイム可視化",
      "未回収先ランキングと優先督促リスト",
    ],
    launchChecklist: [
      "freee / 弥生CSV取り込みを実装",
      "督促テンプレ3種類を用意",
      "経理向けの初回セットアップ動画を作成",
    ],
    economicsDefault: {
      leadsPerMonth: 120,
      activationRatePercent: 12,
      monthlyPrice: 9800,
      variableCostPercent: 18,
      retentionMonths: 18,
      acquisitionCostPerLead: 2200,
    },
  },
  {
    slug: "solo-taxdesk",
    domain: "solo-taxdesk.com",
    title: "フリーランス税務・請求一体管理",
    category: "Tax",
    oneLiner: "見積・請求・経費・確定申告下書きを1画面で完結",
    target: "副業含む個人事業主・フリーランス",
    pricingModel: "年額 14,800円（確定申告シーズン加算なし）",
    keyProblems: [
      "請求と経費が別ツールで、確定申告期に手戻りが増える",
      "税区分や勘定科目の判断に時間を取られる",
      "月次の利益把握が遅れ、納税資金の準備が後手になる",
    ],
    mvpFeatures: [
      "見積・請求書の即時作成",
      "カード明細の自動仕訳候補",
      "月次損益と納税見込みの可視化",
      "申告書作成用CSVのワンクリック出力",
    ],
    launchChecklist: [
      "よく使う勘定科目テンプレを業種別に用意",
      "申告前チェックリストを画面内配布",
      "チュートリアルメール3通を自動送信",
    ],
    economicsDefault: {
      leadsPerMonth: 300,
      activationRatePercent: 7,
      monthlyPrice: 1480,
      variableCostPercent: 15,
      retentionMonths: 22,
      acquisitionCostPerLead: 700,
    },
  },
  {
    slug: "privacy-ops-us",
    domain: "privacy-ops-us.com",
    title: "米国州別プライバシー法対応",
    category: "Compliance",
    oneLiner: "州法ごとの同意管理と開示請求対応を自動運用",
    target: "米国向けEC / SaaSを運営する中堅企業",
    pricingModel: "月額 39,000円 + 対応件数従量",
    keyProblems: [
      "州ごとに規制要件が違い、法務対応が属人化する",
      "開示請求・削除請求の処理履歴が散在する",
      "監査時に証跡提出が間に合わない",
    ],
    mvpFeatures: [
      "州別の同意バナー出し分け",
      "DSAR受付と対応フロー管理",
      "データ保有状況の証跡ログ出力",
      "法改正アラート配信",
    ],
    launchChecklist: [
      "Shopify / Stripe連携コネクタを先行実装",
      "監査ログの英語テンプレを同梱",
      "法務向けオンボーディング資料を配布",
    ],
    economicsDefault: {
      leadsPerMonth: 80,
      activationRatePercent: 10,
      monthlyPrice: 39000,
      variableCostPercent: 23,
      retentionMonths: 20,
      acquisitionCostPerLead: 6000,
    },
  },
  {
    slug: "ai-governance-lab",
    domain: "ai-governance-lab.com",
    title: "企業内AI利用ガバナンス",
    category: "AI Security",
    oneLiner: "生成AI利用ログを監査し、機密情報流出リスクを抑える",
    target: "従業員100名以上で生成AI活用が進む企業",
    pricingModel: "月額 59,000円 + 監査ユーザー数課金",
    keyProblems: [
      "部署ごとにAI利用ルールがばらばら",
      "機密情報を含むプロンプトが検知できない",
      "監査部門が利用状況を追跡できない",
    ],
    mvpFeatures: [
      "プロンプト監査ログの一元管理",
      "PII / 機密キーワード検知アラート",
      "部署別リスクスコアダッシュボード",
      "利用ポリシー同意の証跡管理",
    ],
    launchChecklist: [
      "Microsoft 365 / Google Workspace SSOを対応",
      "社内説明用1枚資料テンプレを提供",
      "30分の導入ウェビナーを定期開催",
    ],
    economicsDefault: {
      leadsPerMonth: 70,
      activationRatePercent: 9,
      monthlyPrice: 59000,
      variableCostPercent: 26,
      retentionMonths: 24,
      acquisitionCostPerLead: 7200,
    },
  },
  {
    slug: "secure-lite-ops",
    domain: "secure-lite-ops.com",
    title: "中小企業向けセキュリティ運用ライト版",
    category: "Security",
    oneLiner: "脆弱性チェック・2FA監査・教育を低コストで定常化",
    target: "専任セキュリティ担当がいない中小企業",
    pricingModel: "月額 19,800円 + 端末数課金",
    keyProblems: [
      "セキュリティ対策の優先順位が決められない",
      "2FAやパスワード方針が徹底されない",
      "事故時の初動手順が整備されていない",
    ],
    mvpFeatures: [
      "SaaSアカウントの2FA棚卸し",
      "外部公開資産の脆弱性簡易診断",
      "月次セキュリティ訓練コンテンツ配信",
      "事故対応Runbookのテンプレ管理",
    ],
    launchChecklist: [
      "初回90日プランの導入タスクを自動生成",
      "経営者向け月次レポートを定型化",
      "保険申請向け証跡エクスポートを実装",
    ],
    economicsDefault: {
      leadsPerMonth: 90,
      activationRatePercent: 11,
      monthlyPrice: 19800,
      variableCostPercent: 20,
      retentionMonths: 19,
      acquisitionCostPerLead: 2800,
    },
  },
  {
    slug: "power-plan-lab",
    domain: "power-plan-lab.com",
    title: "電気料金・契約最適化",
    category: "Energy",
    oneLiner: "電力使用データから最適プランを提案し、削減額を可視化",
    target: "電気代が月10万円以上の小規模店舗",
    pricingModel: "月額 4,980円 + 成果報酬（削減額の10%）",
    keyProblems: [
      "契約プラン変更の判断材料がない",
      "ピーク時間帯のムダ使用が見えない",
      "節電施策の効果検証ができない",
    ],
    mvpFeatures: [
      "電力明細アップロードで即時診断",
      "契約プラン別の年間コスト比較",
      "ピーク抑制アラート通知",
      "削減実績レポートの自動出力",
    ],
    launchChecklist: [
      "主要電力会社フォーマットを先に対応",
      "店舗オーナー向け節電施策テンプレ配布",
      "成果報酬契約書テンプレを同梱",
    ],
    economicsDefault: {
      leadsPerMonth: 180,
      activationRatePercent: 8,
      monthlyPrice: 4980,
      variableCostPercent: 22,
      retentionMonths: 16,
      acquisitionCostPerLead: 1200,
    },
  },
  {
    slug: "niche-booking-crm",
    domain: "niche-booking-crm.com",
    title: "業種特化予約・CRM",
    category: "Vertical SaaS",
    oneLiner: "業種別の予約導線と再来店促進をまとめて管理",
    target: "美容・修理・レッスン系の小規模事業者",
    pricingModel: "月額 7,980円 + 予約件数従量",
    keyProblems: [
      "汎用予約ツールでは業務フローに合わない",
      "リピート施策が手作業で継続できない",
      "顧客情報と予約履歴が分断されている",
    ],
    mvpFeatures: [
      "業種別テンプレ付き予約フォーム",
      "来店後フォローメール自動配信",
      "失注顧客の掘り起こしリスト",
      "予約別売上の自動集計",
    ],
    launchChecklist: [
      "最初は美容サロン向けに絞って出す",
      "LINE通知連携を初期搭載",
      "予約遷移率のABテストを実施",
    ],
    economicsDefault: {
      leadsPerMonth: 220,
      activationRatePercent: 9,
      monthlyPrice: 7980,
      variableCostPercent: 19,
      retentionMonths: 17,
      acquisitionCostPerLead: 1500,
    },
  },
  {
    slug: "petcare-suite",
    domain: "petcare-suite.com",
    title: "ペット事業者向け運営ツール",
    category: "Pet Business",
    oneLiner: "予約・ワクチン記録・定期購入を一体化した店舗OS",
    target: "トリミング・ペットホテル・動物病院周辺事業者",
    pricingModel: "月額 9,800円 + 会員数課金",
    keyProblems: [
      "予約管理と健康記録が別管理で手間が大きい",
      "定期購入の継続率が把握できない",
      "顧客連絡が電話中心でオペレーション負荷が高い",
    ],
    mvpFeatures: [
      "予約台帳とワクチン期限管理",
      "定期購入の自動決済管理",
      "来店前リマインド通知",
      "顧客カルテ共有機能",
    ],
    launchChecklist: [
      "ペット種別テンプレの標準搭載",
      "来店履歴からの再来店予測を追加",
      "会員向けマイページを同時公開",
    ],
    economicsDefault: {
      leadsPerMonth: 160,
      activationRatePercent: 10,
      monthlyPrice: 9800,
      variableCostPercent: 21,
      retentionMonths: 20,
      acquisitionCostPerLead: 1700,
    },
  },
  {
    slug: "renew-watch",
    domain: "renew-watch.com",
    title: "契約更新・サブスク漏れ防止管理",
    category: "Procurement",
    oneLiner: "更新期限の見落としを防ぎ、不要契約の継続を削減",
    target: "SaaS契約が30件以上ある成長企業",
    pricingModel: "月額 12,000円 + 契約件数課金",
    keyProblems: [
      "契約更新期限が部署ごとに散在している",
      "解約判断が期限直前になり高コスト化する",
      "値上げ通知の検知漏れが発生する",
    ],
    mvpFeatures: [
      "契約台帳の一元化",
      "更新90/30/7日前の自動通知",
      "値上げ検知と承認フロー",
      "削減インパクトの可視化",
    ],
    launchChecklist: [
      "主要SaaSの請求メール自動解析を実装",
      "財務向け月次削減レポートを提供",
      "解約理由テンプレを整備",
    ],
    economicsDefault: {
      leadsPerMonth: 110,
      activationRatePercent: 13,
      monthlyPrice: 12000,
      variableCostPercent: 16,
      retentionMonths: 21,
      acquisitionCostPerLead: 2400,
    },
  },
  {
    slug: "cashflow-radar",
    domain: "cashflow-radar.com",
    title: "小規模事業者向け資金繰りダッシュボード",
    category: "Finance",
    oneLiner: "将来の資金ショート日を予測して意思決定を前倒し",
    target: "月商300万〜5000万円の小規模事業者",
    pricingModel: "月額 14,800円 + 口座連携数課金",
    keyProblems: [
      "入出金予測がExcel手作業で更新遅延する",
      "資金不足が直前まで見えず打ち手が遅れる",
      "経営者と経理で同じ数字を見られていない",
    ],
    mvpFeatures: [
      "口座・カード・請求情報の自動連携",
      "90日先までの資金繰り予測",
      "危険残高アラート通知",
      "資金調達シナリオ比較",
    ],
    launchChecklist: [
      "会計ソフト連携2種類から先に対応",
      "資金ショート予防テンプレを配布",
      "週次の経営会議用レポートを生成",
    ],
    economicsDefault: {
      leadsPerMonth: 130,
      activationRatePercent: 11,
      monthlyPrice: 14800,
      variableCostPercent: 24,
      retentionMonths: 23,
      acquisitionCostPerLead: 2600,
    },
  },
];

export function getDomainProductBySlug(slug: string) {
  return DOMAIN_PRODUCTS.find((product) => product.slug === slug);
}
