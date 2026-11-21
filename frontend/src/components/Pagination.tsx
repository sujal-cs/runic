import { Button } from "./ui/Button";
import { SelectField } from "./ui/Field";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

// Compact page list: always show the first/last page and a window around the
// current one, replacing gaps with an ellipsis.
function buildPages(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 9) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);

  return pages;
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = "problems",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);
  const pages = buildPages(page, totalPages);

  return (
    <nav
      className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-subtle max-sm:justify-center"
      aria-label={`${itemLabel} pagination`}
    >
      <span>
        Showing {firstItem}–{lastItem} of {totalItems} {itemLabel}
      </span>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {onPageSizeChange && (
          <label className="mr-2 inline-flex items-center gap-2">
            Per page:
            <SelectField
              className="h-8 w-[68px] px-2 text-xs"
              aria-label={`${itemLabel} per page`}
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
          </label>
        )}

        <Button
          type="button"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          Prev
        </Button>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-ink-subtle" aria-hidden="true">…</span>
          ) : (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={item === page ? "primary" : "secondary"}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
