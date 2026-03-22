"use client";

import { useMemo, useState } from "react";
import { LoanCalculator } from "./loan-calculator";
import { OvertimePayCalculator } from "./overtime-pay-calculator";
import { PartTimePayCalculator } from "./part-time-pay-calculator";
import { TakehomeCalculator } from "./takehome-calculator";

type ToolId = "takehome" | "parttime" | "overtime" | "loan";

const TOOL_OPTIONS: Array<{
  id: ToolId;
  label: string;
  helper: string;
}> = [
  {
    id: "takehome",
    label: "手取り計算",
    helper: "年収・職業・都道府県から手取りを試算",
  },
  {
    id: "parttime",
    label: "バイト給料",
    helper: "時給とシフトから月収・手取りを計算",
  },
  {
    id: "overtime",
    label: "残業代計算",
    helper: "月給と残業時間から残業代を概算",
  },
  {
    id: "loan",
    label: "ローン返済",
    helper: "借入額・金利・期間から返済計画を計算",
  },
];

export function FinanceToolSwitcher() {
  const [activeTool, setActiveTool] = useState<ToolId>("takehome");

  const helper = useMemo(
    () => TOOL_OPTIONS.find((option) => option.id === activeTool)?.helper ?? "",
    [activeTool]
  );

  return (
    <>
      <section className="card mt-20">
        <h2>金融計算ツール</h2>
        <div className="tool-tabs mt-12">
          {TOOL_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`tool-tab ${activeTool === option.id ? "tool-tab-active" : ""}`}
              onClick={() => setActiveTool(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="small mt-12">{helper}</p>
      </section>

      {activeTool === "takehome" ? <TakehomeCalculator /> : null}
      {activeTool === "parttime" ? <PartTimePayCalculator /> : null}
      {activeTool === "overtime" ? <OvertimePayCalculator /> : null}
      {activeTool === "loan" ? <LoanCalculator /> : null}
    </>
  );
}
