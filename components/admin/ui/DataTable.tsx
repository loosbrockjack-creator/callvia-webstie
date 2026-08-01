"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { EmptyState } from "./bento";
import { cn } from "@/lib/utils";

// One data set, two layouts. Below md every row becomes a card; at md and up
// it becomes a table row.
//
// The old table was a 760px-wide table inside overflow-x-auto, which is a
// horizontal-scroll workaround rather than a mobile layout: on a phone you had
// to drag sideways to find out whether anyone had paid. Cards remove the
// sideways drag entirely, at the cost of the caller saying which columns matter
// enough to survive the narrow view.

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable. Return a primitive to sort on. */
  sortValue?: (row: T) => string | number;
  /** Extra classes for the desktop cell, e.g. text-right or tabular-nums. */
  className?: string;
  /**
   * Where this column lands in the mobile card:
   *   title    the card's headline
   *   trailing top right of the card, usually a status badge
   *   meta     a label/value row in the card body (the default)
   *   actions  the full-width row at the bottom of the card
   *   hide     desktop only
   */
  mobile?: "title" | "trailing" | "meta" | "actions" | "hide";
}

export interface FilterOption {
  value: string;
  label: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = "Search",
  filter,
  emptyTitle = "Nothing here yet.",
  emptyHint,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Everything a search should match, concatenated. Omit to hide search. */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  /** A single-select filter, e.g. by status. */
  filter?: {
    label: string;
    options: FilterOption[];
    match: (row: T, value: string) => boolean;
  };
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const visible = useMemo(() => {
    let out = rows;

    if (filter && filterValue !== "all") {
      out = out.filter((r) => filter.match(r, filterValue));
    }

    const q = query.trim().toLowerCase();
    if (q && searchText) {
      out = out.filter((r) => searchText(r).toLowerCase().includes(q));
    }

    const col = columns.find((c) => c.key === sortKey);
    if (col?.sortValue) {
      const get = col.sortValue;
      out = [...out].sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        if (av === bv) return 0;
        const cmp = av < bv ? -1 : 1;
        return sortAsc ? cmp : -cmp;
      });
    }

    return out;
  }, [rows, columns, query, filterValue, filter, searchText, sortKey, sortAsc]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const titleCol = columns.find((c) => c.mobile === "title") ?? columns[0];
  const trailingCol = columns.find((c) => c.mobile === "trailing");
  const actionsCol = columns.find((c) => c.mobile === "actions");
  const metaCols = columns.filter(
    (c) =>
      c !== titleCol &&
      c !== trailingCol &&
      c !== actionsCol &&
      c.mobile !== "hide"
  );

  const hasControls = Boolean(searchText || filter);

  return (
    <div>
      {hasControls && (
        // Controls stack on mobile so neither the field nor the filter ends up
        // too narrow to use.
        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {searchText && (
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-h-[44px] w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-4 text-base text-white outline-none transition-colors placeholder:text-faint focus:border-accent"
              />
            </div>
          )}
          {filter && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              aria-label={filter.label}
              className="min-h-[44px] rounded-lg border border-line bg-surface px-4 py-2.5 text-base text-white outline-none transition-colors focus:border-accent sm:w-56"
            >
              <option value="all">{filter.label}: all</option>
              {filter.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-line">
          <EmptyState
            title={rows.length === 0 ? emptyTitle : "Nothing matches those filters."}
            hint={rows.length === 0 ? emptyHint : undefined}
          />
        </div>
      ) : (
        <>
          {/* ---------------------------------------------- mobile cards --- */}
          <ul className="flex flex-col gap-2.5 md:hidden">
            {visible.map((row) => (
              <li
                key={rowKey(row)}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-sm font-medium text-white">
                    {titleCol.cell(row)}
                  </div>
                  {trailingCol && <div className="shrink-0">{trailingCol.cell(row)}</div>}
                </div>

                {metaCols.length > 0 && (
                  <dl className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
                    {metaCols.map((c) => (
                      <div key={c.key} className="flex items-baseline justify-between gap-3">
                        <dt className="text-xs uppercase tracking-wide text-dim">{c.header}</dt>
                        <dd className="min-w-0 text-right text-sm text-muted">{c.cell(row)}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {actionsCol && (
                  <div className="mt-3 border-t border-line pt-3">{actionsCol.cell(row)}</div>
                )}
              </li>
            ))}
          </ul>

          {/* -------------------------------------------- desktop table --- */}
          <div className="hidden overflow-hidden rounded-xl border border-line md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-dim",
                        c.className
                      )}
                    >
                      {c.sortValue ? (
                        <button
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex items-center gap-1.5 uppercase tracking-widest transition-colors hover:text-white"
                          aria-label={`Sort by ${c.header}`}
                        >
                          {c.header}
                          <ArrowUpDown
                            size={12}
                            className={sortKey === c.key ? "text-accent" : "text-faint"}
                            aria-hidden
                          />
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="border-b border-line transition-colors last:border-b-0 hover:bg-surface"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn("px-4 py-3.5 text-sm text-muted", c.className)}
                      >
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
