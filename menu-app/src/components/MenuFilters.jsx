function MenuFilters({
  categories,
  categoryStatus,
  hasFilters,
  keyword,
  minimumPrice,
  onReset,
  onSubmit,
  selectedCategory,
}) {
  return (
    <form
      className="menu-filters"
      key={`${keyword}-${selectedCategory}-${minimumPrice}-${categoryStatus}`}
      onSubmit={onSubmit}
    >
      <label className="filter-field filter-field-search">
        <span className="label1 bold">메뉴 이름</span>
        <input
          className="filter-control body2"
          defaultValue={keyword}
          name="keyword"
          placeholder="메뉴 이름을 입력하세요"
          type="search"
        />
      </label>

      <label className="filter-field">
        <span className="label1 bold">카테고리</span>
        <select
          className="filter-control body2"
          defaultValue={selectedCategory}
          disabled={categoryStatus !== 'success'}
          name="category"
        >
          <option value="">
            {categoryStatus === 'error'
              ? '카테고리 조회 실패'
              : categoryStatus === 'loading'
                ? '불러오는 중'
                : '전체 카테고리'}
          </option>
          {categories.map((category) => (
            <option key={category.categoryCode} value={category.categoryCode}>
              {category.refCategoryName} · {category.categoryName}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span className="label1 bold">가격 초과</span>
        <input
          className="filter-control body2"
          defaultValue={minimumPrice}
          min="0"
          name="price"
          placeholder="예: 10000"
          step="1"
          type="number"
        />
      </label>

      <div className="filter-actions">
        <button className="filter-submit label1 bold" type="submit">
          검색
        </button>
        {hasFilters && (
          <button
            className="filter-reset label1 medium"
            onClick={onReset}
            type="button"
          >
            초기화
          </button>
        )}
      </div>
    </form>
  )
}

export default MenuFilters
