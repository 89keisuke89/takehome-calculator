export type PrefectureCode =
  | "hokkaido"
  | "aomori"
  | "iwate"
  | "miyagi"
  | "akita"
  | "yamagata"
  | "fukushima"
  | "ibaraki"
  | "tochigi"
  | "gunma"
  | "saitama"
  | "chiba"
  | "tokyo"
  | "kanagawa"
  | "niigata"
  | "toyama"
  | "ishikawa"
  | "fukui"
  | "yamanashi"
  | "nagano"
  | "gifu"
  | "shizuoka"
  | "aichi"
  | "mie"
  | "shiga"
  | "kyoto"
  | "osaka"
  | "hyogo"
  | "nara"
  | "wakayama"
  | "tottori"
  | "shimane"
  | "okayama"
  | "hiroshima"
  | "yamaguchi"
  | "tokushima"
  | "kagawa"
  | "ehime"
  | "kochi"
  | "fukuoka"
  | "saga"
  | "nagasaki"
  | "kumamoto"
  | "oita"
  | "miyazaki"
  | "kagoshima"
  | "okinawa";

export type PrefectureConfig = {
  code: PrefectureCode;
  label: string;
  residentTaxRateAdjustment: number;
  perCapitaLevyAdjustment: number;
};

export const PREFECTURES: PrefectureConfig[] = [
  { code: "hokkaido", label: "北海道", residentTaxRateAdjustment: 0.0005, perCapitaLevyAdjustment: 500 },
  { code: "aomori", label: "青森県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "iwate", label: "岩手県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "miyagi", label: "宮城県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "akita", label: "秋田県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "yamagata", label: "山形県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "fukushima", label: "福島県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "ibaraki", label: "茨城県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "tochigi", label: "栃木県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "gunma", label: "群馬県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "saitama", label: "埼玉県", residentTaxRateAdjustment: 0.0003, perCapitaLevyAdjustment: 300 },
  { code: "chiba", label: "千葉県", residentTaxRateAdjustment: 0.0003, perCapitaLevyAdjustment: 300 },
  { code: "tokyo", label: "東京都", residentTaxRateAdjustment: 0.002, perCapitaLevyAdjustment: 1000 },
  { code: "kanagawa", label: "神奈川県", residentTaxRateAdjustment: 0.001, perCapitaLevyAdjustment: 700 },
  { code: "niigata", label: "新潟県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "toyama", label: "富山県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "ishikawa", label: "石川県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "fukui", label: "福井県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "yamanashi", label: "山梨県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "nagano", label: "長野県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "gifu", label: "岐阜県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "shizuoka", label: "静岡県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "aichi", label: "愛知県", residentTaxRateAdjustment: 0.0005, perCapitaLevyAdjustment: 500 },
  { code: "mie", label: "三重県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "shiga", label: "滋賀県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "kyoto", label: "京都府", residentTaxRateAdjustment: 0.0005, perCapitaLevyAdjustment: 400 },
  { code: "osaka", label: "大阪府", residentTaxRateAdjustment: 0.0015, perCapitaLevyAdjustment: 800 },
  { code: "hyogo", label: "兵庫県", residentTaxRateAdjustment: 0.0005, perCapitaLevyAdjustment: 400 },
  { code: "nara", label: "奈良県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "wakayama", label: "和歌山県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "tottori", label: "鳥取県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "shimane", label: "島根県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "okayama", label: "岡山県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "hiroshima", label: "広島県", residentTaxRateAdjustment: 0.0004, perCapitaLevyAdjustment: 300 },
  { code: "yamaguchi", label: "山口県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "tokushima", label: "徳島県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "kagawa", label: "香川県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "ehime", label: "愛媛県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "kochi", label: "高知県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "fukuoka", label: "福岡県", residentTaxRateAdjustment: 0.0005, perCapitaLevyAdjustment: 500 },
  { code: "saga", label: "佐賀県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "nagasaki", label: "長崎県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "kumamoto", label: "熊本県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "oita", label: "大分県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "miyazaki", label: "宮崎県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "kagoshima", label: "鹿児島県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
  { code: "okinawa", label: "沖縄県", residentTaxRateAdjustment: 0, perCapitaLevyAdjustment: 0 },
];

export const DEFAULT_PREFECTURE: PrefectureCode = "tokyo";

export function getPrefectureConfig(code: PrefectureCode): PrefectureConfig {
  return PREFECTURES.find((pref) => pref.code === code) ?? PREFECTURES[0];
}
