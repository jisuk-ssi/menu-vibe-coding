import { Link, useLocation } from 'react-router'

const priceFormatter = new Intl.NumberFormat('ko-KR')

function MenuCard({ menu }) {
  const isOrderable = menu.orderableStatus === 'Y'
  const location = useLocation()

  return (
    <Link
      aria-label={`${menu.menuName} 상세 보기`}
      className="menu-card"
      state={{ from: `${location.pathname}${location.search}` }}
      to={`/menus/${menu.menuCode}`}
    >
      <div className="menu-card-top">
        <span className="category-badge caption1 bold">{menu.categoryName}</span>
        <span className="menu-code caption1">MENU #{menu.menuCode}</span>
      </div>

      <h2 className="menu-name headline1 bold">{menu.menuName}</h2>

      <div className="menu-card-bottom">
        <strong className="menu-price body1 bold">
          {priceFormatter.format(menu.menuPrice)}원
        </strong>
        <span
          className={`order-status caption1 ${isOrderable ? '' : 'unavailable'}`}
        >
          {isOrderable ? '주문 가능' : '주문 불가'}
        </span>
      </div>
    </Link>
  )
}

export default MenuCard
