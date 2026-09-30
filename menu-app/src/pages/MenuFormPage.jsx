import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { getCategories } from '../api/categories.js'
import {
  createMenu,
  getMenuByCode,
  updateMenu,
} from '../api/menus.js'
import './MenuFormPage.css'

const emptyForm = {
  categoryCode: '',
  menuName: '',
  menuPrice: '',
  orderableStatus: 'Y',
}

function validateMenu(values) {
  const errors = {}
  const price = Number(values.menuPrice)

  if (!values.menuName.trim()) {
    errors.menuName = '메뉴 이름을 입력해 주세요.'
  }

  if (values.menuPrice === '') {
    errors.menuPrice = '가격을 입력해 주세요.'
  } else if (!Number.isInteger(price) || price < 0) {
    errors.menuPrice = '가격은 0 이상의 정수로 입력해 주세요.'
  }

  if (!values.categoryCode) {
    errors.categoryCode = '카테고리를 선택해 주세요.'
  }

  return errors
}

function MenuFormPage() {
  const { menuCode } = useParams()
  const isEdit = Boolean(menuCode)
  const navigate = useNavigate()
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [formValues, setFormValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('loading')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const detailPath = isEdit ? `/menus/${menuCode}` : '/menus?page=1'
  const listPath = location.state?.from ?? '/menus?page=1'

  useEffect(() => {
    const controller = new AbortController()

    async function loadForm() {
      setStatus('loading')
      setErrorMessage('')

      try {
        const [categoryResult, menuResult] = await Promise.all([
          getCategories({ signal: controller.signal }),
          isEdit
            ? getMenuByCode(menuCode, { signal: controller.signal })
            : Promise.resolve(null),
        ])

        if (!controller.signal.aborted) {
          const childCategories = categoryResult.categories.filter(
            (category) => category.refCategoryCode !== null,
          )
          const currentMenu = menuResult?.menu
          const hasCurrentCategory = childCategories.some(
            (category) =>
              category.categoryCode === currentMenu?.categoryCode,
          )

          setCategories(
            currentMenu && !hasCurrentCategory
              ? [
                  {
                    categoryCode: currentMenu.categoryCode,
                    categoryName: `${currentMenu.categoryName} (현재 카테고리)`,
                    refCategoryName: null,
                  },
                  ...childCategories,
                ]
              : childCategories,
          )
          setFormValues(
            menuResult
              ? {
                  categoryCode: String(menuResult.menu.categoryCode),
                  menuName: menuResult.menu.menuName,
                  menuPrice: String(menuResult.menu.menuPrice),
                  orderableStatus: menuResult.menu.orderableStatus,
                }
              : emptyForm,
          )
          setErrors({})
          setStatus('success')
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(error.message)
          setStatus('error')
        }
      }
    }

    loadForm()

    return () => controller.abort()
  }, [isEdit, menuCode])

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        [name]: undefined,
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateMenu(formValues)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload = {
      menuName: formValues.menuName.trim(),
      menuPrice: Number(formValues.menuPrice),
      categoryCode: Number(formValues.categoryCode),
      orderableStatus: formValues.orderableStatus === 'N' ? 'N' : 'Y',
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const result = isEdit
        ? await updateMenu(menuCode, payload)
        : await createMenu(payload)

      navigate(`/menus/${result.menu.menuCode}`, {
        replace: true,
        state: { from: listPath },
      })
    } catch (error) {
      setErrorMessage(error.message)
      setIsSaving(false)
    }
  }

  return (
    <section className="menu-form-page" aria-labelledby="menu-form-title">
      <div className="menu-form-heading">
        <div>
          <h1 className="title1 bold" id="menu-form-title">
            {isEdit ? '메뉴 수정' : '메뉴 등록'}
          </h1>
          <p className="menu-form-description body2">
            {isEdit
              ? '메뉴 정보를 확인하고 필요한 내용을 수정합니다.'
              : '새로 판매할 메뉴 정보를 입력합니다.'}
          </p>
        </div>
        {isEdit && <span className="menu-form-code caption1">MENU #{menuCode}</span>}
      </div>

      {status === 'loading' && (
        <div className="form-state body2" role="status">
          입력 화면을 준비하고 있습니다.
        </div>
      )}

      {status === 'error' && (
        <div className="form-state form-state-error" role="alert">
          <strong className="headline1 bold">
            입력 화면을 준비하지 못했습니다.
          </strong>
          <span className="body2">{errorMessage}</span>
        </div>
      )}

      {status === 'success' && (
        <form className="menu-form" noValidate onSubmit={handleSubmit}>
          <div className="menu-form-fields">
            <label className="menu-form-field">
              <span className="label1 bold">메뉴 이름</span>
              <input
                aria-describedby={errors.menuName ? 'menu-name-error' : undefined}
                aria-invalid={Boolean(errors.menuName)}
                className="menu-form-control body1"
                name="menuName"
                onChange={handleChange}
                placeholder="메뉴 이름"
                type="text"
                value={formValues.menuName}
              />
              {errors.menuName && (
                <span className="field-error caption1" id="menu-name-error">
                  {errors.menuName}
                </span>
              )}
            </label>

            <label className="menu-form-field">
              <span className="label1 bold">가격</span>
              <div className="price-input-wrap">
                <input
                  aria-describedby={
                    errors.menuPrice ? 'menu-price-error' : undefined
                  }
                  aria-invalid={Boolean(errors.menuPrice)}
                  className="menu-form-control body1"
                  min="0"
                  name="menuPrice"
                  onChange={handleChange}
                  placeholder="0"
                  step="1"
                  type="number"
                  value={formValues.menuPrice}
                />
                <span className="body2">원</span>
              </div>
              {errors.menuPrice && (
                <span className="field-error caption1" id="menu-price-error">
                  {errors.menuPrice}
                </span>
              )}
            </label>

            <label className="menu-form-field">
              <span className="label1 bold">카테고리</span>
              <select
                aria-describedby={
                  errors.categoryCode ? 'menu-category-error' : undefined
                }
                aria-invalid={Boolean(errors.categoryCode)}
                className="menu-form-control body1"
                name="categoryCode"
                onChange={handleChange}
                value={formValues.categoryCode}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((category) => (
                  <option
                    key={category.categoryCode}
                    value={category.categoryCode}
                  >
                    {category.refCategoryName
                      ? `${category.refCategoryName} · ${category.categoryName}`
                      : category.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryCode && (
                <span className="field-error caption1" id="menu-category-error">
                  {errors.categoryCode}
                </span>
              )}
            </label>

            <fieldset className="menu-form-field orderable-field">
              <legend className="label1 bold">주문 상태</legend>
              <div className="orderable-options">
                <label className="orderable-option body2">
                  <input
                    checked={formValues.orderableStatus === 'Y'}
                    name="orderableStatus"
                    onChange={handleChange}
                    type="radio"
                    value="Y"
                  />
                  주문 가능
                </label>
                <label className="orderable-option body2">
                  <input
                    checked={formValues.orderableStatus === 'N'}
                    name="orderableStatus"
                    onChange={handleChange}
                    type="radio"
                    value="N"
                  />
                  주문 불가
                </label>
              </div>
            </fieldset>
          </div>

          {errorMessage && (
            <div className="form-submit-error body2" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="menu-form-actions">
            <Link
              className="form-cancel label1 bold"
              state={isEdit ? { from: listPath } : undefined}
              to={detailPath}
            >
              취소
            </Link>
            <button
              className="form-submit label1 bold"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? '저장 중' : isEdit ? '수정 저장' : '메뉴 등록'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default MenuFormPage
