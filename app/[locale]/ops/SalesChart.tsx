'use client';

import { useState } from 'react';

export interface SalesChartPoint {
  /** Short label for the axis and tooltip, e.g. "12 Nov". */
  label: string;
  total: number;
  /** The total, formatted. */
  amount: string;
  orders: number;
  /** Full sentence for the tooltip and screen readers. */
  text: string;
}

export interface SalesChartProps {
  points: SalesChartPoint[];
  caption: string;
  columns: { day: string; total: string; orders: string };
  /** Formatted amounts for the guides at half and full scale. */
  scale: { half: string; max: string };
}

/**
 * Daily online sales, one plum bar a day (docs/4-architecture.md §3.14).
 * One series, so one hue and no legend; the heading names it. Bars have 4px
 * rounded tops on a shared baseline with a 2px gap; hovering or focusing a
 * bar shows its day, amount and orders. The same figures are in a table for
 * screen readers.
 */
export function SalesChart({ points, caption, columns, scale }: SalesChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.total));
  const tip = hover !== null ? points[hover] : null;

  return (
    <div className="ops-chart">
      <div className="ops-chart-plot" onPointerLeave={() => setHover(null)}>
        {/* Recessive guides at half and full scale. */}
        <span className="ops-chart-guide" style={{ bottom: '50%' }} aria-hidden="true">
          <span>{scale.half}</span>
        </span>
        <span className="ops-chart-guide" style={{ bottom: '100%' }} aria-hidden="true">
          <span>{scale.max}</span>
        </span>
        <div className="ops-chart-bars" aria-hidden="true">
          {points.map((point, i) => (
            <button
              key={point.label}
              type="button"
              tabIndex={-1}
              className="ops-chart-bar"
              data-active={hover === i || undefined}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <span style={{ height: `${(point.total / max) * 100}%` }} data-empty={point.total === 0 || undefined} />
            </button>
          ))}
        </div>
        {tip && (
          <p className="ops-chart-tip" style={{ left: `${((hover! + 0.5) / points.length) * 100}%` }} aria-hidden="true">
            {tip.text}
          </p>
        )}
      </div>
      <div className="ops-chart-axis" aria-hidden="true">
        <span>{points[0]?.label}</span>
        <span>{points[Math.floor(points.length / 2)]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
      {/* A table keeps its content size, so the hiding goes on a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{columns.day}</th>
              <th scope="col">{columns.total}</th>
              <th scope="col">{columns.orders}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{point.amount}</td>
                <td>{point.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
