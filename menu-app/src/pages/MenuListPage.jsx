import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getCategories } from '../api/categories.js'
import {
  getMenuPage,
  getMenus,
  searchMenusByPrice,
} from '../api/menus.js'
import MenuCard from '../components/MenuCard.jsx'
import MenuFilters from '../components/MenuFilters.jsx'
import Pagination from '../components/Pagination.jsx'
import './MenuListPage.css'

const PAGE_SIZE = 10

function getPositiveInteger(value, fallback) {
  const number = Number(value)

  return Number.isInteger(number) && number > 0 ? number : fallback
}

function getMinimumPrice(value) {
  if (value === null || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isInteger(number) && number >= 0 ? number : null
}

function filterMenus(menus, keyword, categoryCode) {
  const normalizedKeyword = keyword.toLocaleLowerCase('ko-KR')

  return menus.filter((menu) => {
    const matchesKeyword =
      normalizedKeyword === '' ||
      menu.menuName.toLocaleLowerCase('ko-KR').includes(normalizedKeyword)
    const matchesCategory =
      categoryCode === '' || String(menu.categoryCode) === categoryCode

    return matchesKeyword && matchesCategory
  })
}

function MenuListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [menus, setMenus] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryStatus, setCategoryStatus] = useState('loading')
  const [pageInfo, setPageInfo] = useState({
    first: true,
    last: true,
    number: 1,
    totalElements: 0,
    totalPages: 0,
  })
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const keyword = (searchParams.get('keyword') ?? '').trim()
  const requestedCategory = searchParams.get('category') ?? ''
  const selectedCategory = /^\d+$/.test(requestedCategory)
    ? requestedCategory
    : ''
  const minimumPrice = getMinimumPrice(searchParams.get('price'))
  const currentPage = getPositiveInteger(searchParams.get('page'), 1)
  const hasFilters = Boolean(
    keyword || selectedCategory || minimumPrice !== null,
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      try {
        const result = await getCategories({ signal: controller.signal })

        if (!controller.signal.aborted) {
          setCategories(
            result.categories.filter(
              (category) => category.refCategoryCode !== null,
            ),
          )
          setCategoryStatus('success')
        }
      } catch {
        if (!controller.signal.aborted) {
          setCategoryStatus('error')
        }
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadMenus() {
      setStatus('loading')
      setErrorMessage('')

      try {
        if (!hasFilters) {
          const result = await getMenuPage(currentPage, {
            signal: controller.signal,
          })

          if (!controller.signal.aborted) {
            setMenus(result.content)
            setPageInfo({
              first: result.first,
              last: result.last,
              number: result.number,
              totalElements: result.totalElements,
              totalPages: result.totalPages,
            })
            setStatus('success')
          }
          return
        }

        const result =
          minimumPrice === null
            ? await getMenus({ signal: controller.signal })
            : await searchMenusByPrice(minimumPrice, {
                signal: controller.signal,
              })
        const filteredMenus = filterMenus(
          result.menus,
          keyword,
          selectedCategory,
        )
        const totalPages = Math.ceil(filteredMenus.length / PAGE_SIZE)
        const lastAvailablePage = Math.max(totalPages, 1)

        if (currentPage > lastAvailablePage) {
          setSearchParams((previousParams) => {
            const nextParams = new URLSearchParams(previousParams)
            nextParams.set('page', String(lastAvailablePage))
            return nextParams
          }, { replace: true })
          return
        }

        const firstMenuIndex = (currentPage - 1) * PAGE_SIZE
        const pagedMenus = filteredMenus.slice(
          firstMenuIndex,
          firstMenuIndex + PAGE_SIZE,
        )

        if (!controller.signal.aborted) {
          setMenus(pagedMenus)
          setPageInfo({
            first: currentPage === 1,
            last: currentPage >= lastAvailablePage,
            number: currentPage,
            totalElements: filteredMenus.length,
            totalPages,
          })
          setStatus('success')
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(error.message)
          setStatus('error')
        }
      }
    }

    loadMenus()

    return () => controller.abort()
  }, [
    currentPage,
    hasFilters,
    keyword,
    minimumPrice,
    selectedCategory,
    setSearchParams,
  ])

  function handleFilterSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextSearchParams = new URLSearchParams()
    const nextKeyword = String(formData.get('keyword') ?? '').trim()
    const nextCategory = String(formData.get('category') ?? '')
    const nextPrice = String(formData.get('price') ?? '')

    if (nextKeyword) {
      nextSearchParams.set('keyword', nextKeyword)
    }
    if (nextCategory) {
      nextSearchParams.set('category', nextCategory)
    }
    if (nextPrice) {
      nextSearchParams.set('price', nextPrice)
    }
    nextSearchParams.set('page', '1')
    setSearchParams(nextSearchParams)
  }

  function handleFilterReset() {
    setSearchParams({ page: '1' })
  }

  function handlePageChange(page) {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('page', String(page))
    setSearchParams(nextSearchParams)
  }

  return (
    <section className="menu-page" aria-labelledby="menu-list-title">
      <div className="menu-page-heading">
        <div>
          <h1 className="title1 bold" id="menu-list-title">
            전체 메뉴
          </h1>
          <p className="menu-page-description body2">
            현재 등록된 메뉴와 주문 가능 상태를 확인합니다.
          </p>
        </div>
        {status === 'success' && (
          <p className="menu-count body2">
            총 <strong>{pageInfo.totalElements}개</strong> 메뉴
          </p>
        )}
      </div>

      <MenuFilters
        categories={categories}
        categoryStatus={categoryStatus}
        hasFilters={hasFilters}
        keyword={keyword}
        minimumPrice={minimumPrice ?? ''}
        onReset={handleFilterReset}
        onSubmit={handleFilterSubmit}
        selectedCategory={selectedCategory}
      />

      {status === 'loading' && (
        <div className="menu-state body2" role="status">
          메뉴를 불러오고 있습니다.
        </div>
      )}

      {status === 'error' && (
        <div className="menu-state menu-state-error" role="alert">
          <strong className="headline1 bold">
            메뉴를 불러오지 못했습니다.
          </strong>
          <span className="body2">{errorMessage}</span>
        </div>
      )}

      {status === 'success' && menus.length === 0 && (
        <div className="menu-state menu-state-empty">
          <strong className="headline1 bold">
            {hasFilters
              ? '조건에 맞는 메뉴가 없습니다.'
              : '등록된 메뉴가 없습니다.'}
          </strong>
          {hasFilters && (
            <button
              className="empty-reset label1 bold"
              onClick={handleFilterReset}
              type="button"
            >
              검색 조건 초기화
            </button>
          )}
        </div>
      )}

      {status === 'success' && menus.length > 0 && (
        <div className="menu-grid">
          {menus.map((menu) => (
            <MenuCard key={menu.menuCode} menu={menu} />
          ))}
        </div>
      )}

      {status === 'success' && pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={pageInfo.number}
          first={pageInfo.first}
          last={pageInfo.last}
          onPageChange={handlePageChange}
          totalPages={pageInfo.totalPages}
        />
      )}
    </section>
  )
}

export default MenuListPage
