function Pagination({ currentPage, first, last, onPageChange, totalPages }) {
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  return (
    <nav className="pagination" aria-label="메뉴 목록 페이지">
      <button
        className="pagination-button label1 bold"
        disabled={first}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {pageNumbers.map((pageNumber) => (
        <button
          aria-current={pageNumber === currentPage ? 'page' : undefined}
          className={`pagination-button label1 bold ${
            pageNumber === currentPage ? 'active' : ''
          }`}
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          type="button"
        >
          {pageNumber}
        </button>
      ))}

      <button
        className="pagination-button label1 bold"
        disabled={last}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  )
}

export default Pagination
