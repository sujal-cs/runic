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
    <nav className="pagination" aria-label={`${itemLabel} pagination`}>
      <span className="pagination-summary">
        Showing {firstItem}–{lastItem} of {totalItems} {itemLabel}
      </span>

      <div className="pagination-controls">
        {onPageSizeChange && (
          <label className="pagination-size">
            Per page
            <select
              className="input"
              aria-label={`${itemLabel} per page`}
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          className="btn pagination-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          Prev
        </button>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className="btn pagination-btn"
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className="btn pagination-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
