"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function AreaChart({
  data,
  height = 210,
  color = "hsl(var(--brand))",
  label = "Enrollment",
  className,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  label?: string;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const width = 620;
  const padding = { left: 10, right: 10, top: 18, bottom: 30 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const values = data.map((point) => point.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const spread = Math.max(1, max - min);
  const top = min + spread * 1.18;

  const points = data.map((point, index) => ({
    x: padding.left + (index / Math.max(1, data.length - 1)) * innerW,
    y: padding.top + innerH - ((point.value - min) / (top - min)) * innerH,
  }));

  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1]?.x ?? 0} ${padding.top + innerH} L ${points[0]?.x ?? 0} ${padding.top + innerH} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`${label} trend`}
      >
        <defs>
          <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((step) => (
          <line
            key={step}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * step}
            y2={padding.top + innerH * step}
            stroke="hsl(var(--line))"
            strokeDasharray="3 5"
            strokeWidth="1"
          />
        ))}
        {area ? <path d={area} fill={`url(#${gradientId}-fill)`} /> : null}
        {line ? (
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="1400"
            strokeDashoffset="1400"
            style={{ animation: "draw 1.5s cubic-bezier(0.22,1,0.36,1) forwards" }}
          />
        ) : null}
        {points.length ? (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4.5"
            fill="white"
            stroke={color}
            strokeWidth="3"
          />
        ) : null}
        {data.map((point, index) => (
          <text
            key={`${point.label}-${index}`}
            x={points[index]?.x ?? 0}
            y={height - 8}
            textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}
            fontSize="10"
            fill="hsl(var(--muted))"
            fontWeight="500"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function BarChart({
  data,
  height = 190,
  className,
  valueSuffix = "",
  tone = "brand",
}: {
  data: { label: string; value: number; highlight?: boolean }[];
  height?: number;
  className?: string;
  valueSuffix?: string;
  tone?: "brand" | "success";
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const fill = tone === "success" ? "bg-success" : "bg-brand";
  return (
    <div className={cn("w-full", className)}>
      <div className="relative" style={{ height }}>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="h-px w-full bg-line-soft" />
          ))}
        </div>
        <div className="relative flex h-full items-end gap-2 sm:gap-3">
          {data.map((item, index) => {
            const ratio = item.value / max;
            return (
              <div key={`${item.label}-${index}`} className="group flex h-full flex-1 flex-col justify-end">
                <span className="mb-1 text-center text-[9.5px] font-semibold text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  {item.value}
                  {valueSuffix}
                </span>
                <div
                  className={cn(
                    "w-full origin-bottom rounded-t-[5px] transition-colors",
                    item.highlight ? "bg-brand" : fill,
                    item.highlight ? "opacity-100" : "opacity-90 group-hover:opacity-100",
                  )}
                  style={{
                    height: `${Math.max(3, ratio * 76)}%`,
                    animation: `grow-bar 700ms cubic-bezier(0.22,1,0.36,1) ${index * 45}ms both`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((item, index) => (
          <span
            key={`${item.label}-label-${index}`}
            className="flex-1 truncate text-center text-[9px] font-medium text-muted"
            title={item.label}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Donut({
  segments,
  size = 150,
  thickness = 15,
  centerValue,
  centerLabel,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  centerValue?: string;
  centerLabel?: string;
}) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Distribution">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--line-soft))"
          strokeWidth={thickness}
        />
        {segments.map((segment, index) => {
          const length = (segment.value / total) * circumference;
          const dash = `${Math.max(0, length - 2.5)} ${circumference - Math.max(0, length - 2.5)}`;
          const circle = (
            <circle
              key={`${segment.label}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray 700ms ease" }}
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerValue ? (
          <span className="text-[20px] font-extrabold tracking-[-0.03em] text-ink">{centerValue}</span>
        ) : null}
        {centerLabel ? <span className="mt-0.5 text-[9px] font-medium text-muted">{centerLabel}</span> : null}
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  color = "hsl(var(--brand))",
  className,
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const width = 120;
  const height = 38;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const spread = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - 3 - ((value - min) / spread) * (height - 8);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-9 w-full", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BarMeter({
  value,
  max,
  tone = "brand",
  className,
}: {
  value: number;
  max: number;
  tone?: "brand" | "success" | "warning" | "danger";
  className?: string;
}) {
  const colors = {
    brand: "bg-brand",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line-soft", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", colors[tone])}
        style={{ width: `${Math.min(100, max ? (value / max) * 100 : 0)}%` }}
      />
    </div>
  );
}
