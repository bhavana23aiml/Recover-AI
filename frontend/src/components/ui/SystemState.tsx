import type {
  ReactNode,
} from "react";

import {
  AlertTriangle,
  Inbox,
  MousePointer2,
  RotateCcw,
  SearchX,
} from "lucide-react";


type StateKind =
  | "empty"
  | "error"
  | "no-selection"
  | "no-results"
  | "info";


interface StatePanelProps {
  kind?: StateKind;

  title: string;

  description?: string;

  actionLabel?: string;

  onAction?: () => void;

  icon?: ReactNode;

  compact?: boolean;

  className?: string;
}


const DEFAULT_ICON: Record<
  StateKind,
  ReactNode
> = {
  empty: (
    <Inbox size={18} strokeWidth={1.8} />
  ),

  error: (
    <AlertTriangle
      size={18}
      strokeWidth={1.8}
    />
  ),

  "no-selection": (
    <MousePointer2
      size={18}
      strokeWidth={1.8}
    />
  ),

  "no-results": (
    <SearchX size={18} strokeWidth={1.8} />
  ),

  info: (
    <Inbox size={18} strokeWidth={1.8} />
  ),
};


const TONE_CLASS: Record<
  StateKind,
  string
> = {
  empty:
    "border-[#24292d] bg-[#0d1114] text-[#d8d5ca]",

  error:
    "border-[#4c2929] bg-[#141011] text-[#e0b2aa]",

  "no-selection":
    "border-[#282b28] bg-[#0d1114] text-[#d8d5ca]",

  "no-results":
    "border-[#282b28] bg-[#0d1114] text-[#d8d5ca]",

  info:
    "border-[#282b28] bg-[#0d1114] text-[#d8d5ca]",
};


const ICON_CLASS: Record<
  StateKind,
  string
> = {
  empty:
    "border-[#2b2f31] bg-[#131719] text-[#9f9b8f]",

  error:
    "border-[#4c2929] bg-[#1b1213] text-[#d97d72]",

  "no-selection":
    "border-[#2e302b] bg-[#151713] text-[#b9ae86]",

  "no-results":
    "border-[#2e302b] bg-[#151713] text-[#b9ae86]",

  info:
    "border-[#2e302b] bg-[#151713] text-[#b9ae86]",
};


export function StatePanel({
  kind = "empty",
  title,
  description,
  actionLabel,
  onAction,
  icon,
  compact = false,
  className = "",
}: StatePanelProps) {
  const isError =
    kind === "error";

  return (
    <section
      aria-live={
        isError
          ? "assertive"
          : "polite"
      }
      className={[
        "flex w-full items-center justify-center rounded-[18px] border",
        TONE_CLASS[kind],
        compact
          ? "min-h-[180px] px-6 py-8"
          : "min-h-[260px] px-7 py-12",
        className,
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
        <div
          className={[
            "mb-4 flex h-10 w-10 items-center justify-center rounded-xl border",
            ICON_CLASS[kind],
          ].join(" ")}
        >
          {icon ??
            DEFAULT_ICON[kind]}
        </div>

        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#f1efe8]">
          {title}
        </h3>

        {description ? (
          <p className="mt-2 max-w-[420px] text-[13px] leading-5 text-[#7f858a]">
            {description}
          </p>
        ) : null}

        {actionLabel &&
        onAction ? (
          <button
            type="button"
            onClick={onAction}
            className={[
              "mt-5 inline-flex h-9 items-center gap-2 rounded-[10px] border px-4",
              "text-[11px] font-semibold uppercase tracking-[0.05em]",
              "transition-colors duration-150",
              isError
                ? "border-[#51302d] bg-[#1a1212] text-[#e6c3bc] hover:bg-[#211516]"
                : "border-[#333630] bg-[#171915] text-[#d9d2bc] hover:bg-[#1d201a]",
            ].join(" ")}
          >
            <RotateCcw
              size={13}
              strokeWidth={1.8}
            />

            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}


interface SkeletonBlockProps {
  className?: string;
}


function SkeletonBlock({
  className = "",
}: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse rounded-md bg-[#171b1e]",
        className,
      ].join(" ")}
    />
  );
}


interface TableSkeletonProps {
  rows?: number;
}


export function TableSkeleton({
  rows = 5,
}: TableSkeletonProps) {
  return (
    <div
      aria-label="Loading transactions"
      aria-busy="true"
      className="overflow-hidden rounded-[18px] border border-[#24292d] bg-[#0d1114]"
    >
      <div className="grid grid-cols-6 gap-4 border-b border-[#202529] bg-[#111619] px-5 py-4">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className="h-2.5 w-[70%]"
          />
        ))}
      </div>

      {Array.from({
        length: rows,
      }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid min-h-[72px] grid-cols-6 items-center gap-4 border-b border-[#1c2124] px-5 last:border-b-0"
        >
          <SkeletonBlock className="h-3.5 w-[72%]" />

          <SkeletonBlock className="h-3.5 w-[52%]" />

          <SkeletonBlock className="h-3.5 w-[78%]" />

          <SkeletonBlock className="h-3.5 w-[34%]" />

          <SkeletonBlock className="h-3.5 w-[65%]" />

          <SkeletonBlock className="h-6 w-[70px] rounded-full" />
        </div>
      ))}
    </div>
  );
}


export function PanelSkeleton() {
  return (
    <section
      aria-label="Loading recovery details"
      aria-busy="true"
      className="rounded-[18px] border border-[#24292d] bg-[#0d1114] p-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-2.5 w-24" />

          <SkeletonBlock className="h-5 w-40" />
        </div>

        <SkeletonBlock className="h-8 w-20 rounded-[10px]" />
      </div>

      <div className="mt-7 space-y-4">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-4"
          >
            <SkeletonBlock className="h-9 w-9 shrink-0 rounded-xl" />

            <div className="flex-1 space-y-2 pt-1">
              <SkeletonBlock className="h-3 w-[30%]" />

              <SkeletonBlock className="h-2.5 w-[72%]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


export function DashboardSkeleton() {
  return (
    <div
      aria-label="Loading RecoverAI dashboard"
      aria-busy="true"
      className="space-y-4"
    >
      <div className="rounded-[18px] border border-[#24292d] bg-[#0d1114] p-7">
        <SkeletonBlock className="h-2.5 w-32" />

        <SkeletonBlock className="mt-6 h-10 w-[58%]" />

        <SkeletonBlock className="mt-3 h-10 w-[46%]" />

        <SkeletonBlock className="mt-6 h-3 w-[52%]" />

        <SkeletonBlock className="mt-2 h-3 w-[42%]" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="rounded-[16px] border border-[#24292d] bg-[#0d1114] p-5"
          >
            <SkeletonBlock className="h-2.5 w-24" />

            <SkeletonBlock className="mt-7 h-7 w-28" />

            <SkeletonBlock className="mt-3 h-2.5 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <TableSkeleton
          rows={4}
        />

        <PanelSkeleton />
      </div>
    </div>
  );
}
