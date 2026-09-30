import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { deleteMenu, getMenuByCode } from '../api/menus.js'
import './MenuDetailPage.css'

const priceFormatter = new Intl.NumberFormat('ko-KR')

function MenuDetailPage() {
  const { menuCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const backTo = location.state?.from ?? '/menus?page=1'

  useEffect(() => {
    const controller = new AbortController()

    async function loadMenu() {
      setStatus('loading')

      try {
        const result = await getMenuByCode(menuCode, {
          signal: controller.signal,
        })

        if (!controller.signal.aborted) {
          setMenu(result.menu)
          setStatus('success')
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(error.message)
          setStatus('error')
        }
      }
    }

    loadMenu()

    return () => controller.abort()
  }, [menuCode])

  function openDeleteConfirmation() {
    setDeleteError('')
    setIsDeleteOpen(true)
  }

  function closeDeleteConfirmation() {
    if (!isDeleting) {
      setIsDeleteOpen(false)
      setDeleteError('')
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteMenu(menuCode)
      navigate(backTo, { replace: true })
    } catch (error) {
      setDeleteError(error.message)
      setIsDeleting(false)
    }
  }

  return (
    <section className="menu-detail-page" aria-labelledby="menu-detail-title">
      <Link className="detail-back label1 bold" to={backTo}>
        ← 메뉴 목록
      </Link>

      {status === 'loading' && (
        <div className="detail-state body2" role="status">
          메뉴 정보를 불러오고 있습니다.
        </div>
      )}

      {status === 'error' && (
        <div className="detail-state detail-state-error" role="alert">
          <strong className="headline1 bold">
            메뉴 정보를 불러오지 못했습니다.
          </strong>
          <span className="body2">{errorMessage}</span>
        </div>
      )}

      {status === 'success' && menu && (
        <article className="menu-detail-card">
          <div className="menu-detail-heading">
            <div>
              <span className="menu-detail-category caption1 bold">
                {menu.categoryName}
              </span>
              <h1 className="title1 bold" id="menu-detail-title">
                {menu.menuName}
              </h1>
            </div>
            <span className="menu-detail-code caption1">
              MENU #{menu.menuCode}
            </span>
          </div>

          <dl className="menu-detail-info">
            <div>
              <dt className="label1">가격</dt>
              <dd className="heading1 bold">
                {priceFormatter.format(menu.menuPrice)}원
              </dd>
            </div>
            <div>
              <dt className="label1">카테고리</dt>
              <dd className="body1 bold">{menu.categoryName}</dd>
            </div>
            <div>
              <dt className="label1">주문 상태</dt>
              <dd
                className={`menu-detail-order body1 bold ${
                  menu.orderableStatus === 'Y' ? '' : 'unavailable'
                }`}
              >
                {menu.orderableStatus === 'Y' ? '주문 가능' : '주문 불가'}
              </dd>
            </div>
          </dl>

          <div className="menu-detail-actions">
            <button
              className="detail-delete label1 bold"
              onClick={openDeleteConfirmation}
              type="button"
            >
              메뉴 삭제
            </button>
            <Link
              className="detail-edit label1 bold"
              state={{ from: backTo }}
              to={`/menus/${menu.menuCode}/edit`}
            >
              메뉴 수정
            </Link>
          </div>
        </article>
      )}

      {isDeleteOpen && menu && (
        <div className="delete-dialog-backdrop">
          <section
            aria-describedby="delete-dialog-description"
            aria-labelledby="delete-dialog-title"
            aria-modal="true"
            className="delete-dialog"
            role="dialog"
          >
            <div className="delete-dialog-content">
              <span className="delete-dialog-label caption1 bold">
                메뉴 삭제
              </span>
              <h2 className="heading1 bold" id="delete-dialog-title">
                정말 삭제하시겠습니까?
              </h2>
              <p className="delete-dialog-description body2" id="delete-dialog-description">
                ‘{menu.menuName}’ 메뉴를 삭제하면 되돌릴 수 없습니다.
              </p>
              {deleteError && (
                <p className="delete-dialog-error body2" role="alert">
                  {deleteError}
                </p>
              )}
            </div>
            <div className="delete-dialog-actions">
              <button
                className="delete-dialog-cancel label1 bold"
                disabled={isDeleting}
                onClick={closeDeleteConfirmation}
                type="button"
              >
                취소
              </button>
              <button
                className="delete-dialog-confirm label1 bold"
                disabled={isDeleting}
                onClick={handleDelete}
                type="button"
              >
                {isDeleting ? '삭제 중' : '삭제'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default MenuDetailPage
