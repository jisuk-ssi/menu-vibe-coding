import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.jsx'
import MenuDetailPage from './pages/MenuDetailPage.jsx'
import MenuFormPage from './pages/MenuFormPage.jsx'
import MenuListPage from './pages/MenuListPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate replace to="/menus?page=1" />} />
          <Route path="menus" element={<MenuListPage />} />
          <Route path="menus/new" element={<MenuFormPage />} />
          <Route path="menus/:menuCode/edit" element={<MenuFormPage />} />
          <Route path="menus/:menuCode" element={<MenuDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
