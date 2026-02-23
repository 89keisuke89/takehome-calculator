"use client";

import { useMemo, useState } from "react";

const CHECKLIST_ITEMS = [
  "給与所得控除の区分を更新した",
  "所得税ブラケットを更新した",
  "住民税の均等割・税率補正を更新した",
  "社会保険料率を更新した",
  "主要ケースのテストを通した",
];

const STORAGE_KEY = "tax-update-checklist-v1";

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildIcsText(startDate: string): string {
  const dt = `${startDate.replace(/-/g, "")}T090000`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Takehome App//Update Reminder//JA",
    "BEGIN:VEVENT",
    `UID:tax-update-${startDate}@takehome-app`,
    `DTSTART:${dt}`,
    "RRULE:FREQ=YEARLY",
    "SUMMARY:税制データ更新チェック",
    "DESCRIPTION:tax-configの年度データとテストを更新する",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
}

export function UpdateOpsPanel() {
  const [checked, setChecked] = useState<boolean[]>(() => {
    if (typeof window === "undefined") return CHECKLIST_ITEMS.map(() => false);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as boolean[]) : null;
      if (!parsed || parsed.length !== CHECKLIST_ITEMS.length) {
        return CHECKLIST_ITEMS.map(() => false);
      }
      return parsed;
    } catch {
      return CHECKLIST_ITEMS.map(() => false);
    }
  });

  const defaultReminderDate = new Date(new Date().getFullYear(), 11, 1);
  const [reminderDate, setReminderDate] = useState(toDateInputValue(defaultReminderDate));

  const completion = checked.filter(Boolean).length / CHECKLIST_ITEMS.length;
  const icsUrl = useMemo(() => {
    const text = buildIcsText(reminderDate);
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(text)}`;
  }, [reminderDate]);
  const todoText = useMemo(() => {
    const rows = [
      `税制更新ToDo (${reminderDate})`,
      ...CHECKLIST_ITEMS.map((item) => `- [ ] ${item}`),
      "- [ ] Search Consoleで主要URLの再クロール申請",
      "- [ ] 週次SEOレポートの優先URLを更新",
    ];
    return rows.join("\n");
  }, [reminderDate]);
  const todoUrl = useMemo(
    () => `data:text/plain;charset=utf-8,${encodeURIComponent(todoText)}`,
    [todoText]
  );

  function toggle(index: number) {
    const next = checked.map((item, i) => (i === index ? !item : item));
    setChecked(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }

  return (
    <section className="card mt-20">
      <h2>年度更新チェック</h2>
      <p className="small mt-8">進捗: {(completion * 100).toFixed(0)}%</p>
      <div className="list mt-20">
        {CHECKLIST_ITEMS.map((item, index) => (
          <label className="list-item checklist-item" key={item}>
            <input type="checkbox" checked={checked[index]} onChange={() => toggle(index)} />
            <span>{item}</span>
          </label>
        ))}
      </div>

      <div className="form mt-20">
        <label className="field">
          <span>更新リマインド開始日</span>
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
          />
        </label>
      </div>
      <a className="button mt-12 inline-button" href={icsUrl} download="tax-update-reminder.ics">
        カレンダーに毎年リマインドを追加
      </a>
      <a className="button mt-12 inline-button" href={todoUrl} download="tax-update-todo.txt">
        ToDoテンプレートを出力
      </a>
    </section>
  );
}
