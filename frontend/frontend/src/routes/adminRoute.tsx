import { Route, Routes } from 'react-router-dom';
import AdminLogin from '../pages/adminPages/adminLoginPage';
import AdminUserManagePage from '../pages/adminPages/adminUserManagePage';
import AdminDashboardPage from '../pages/adminPages/adminDashboardPage';
import { ToastContainer } from 'react-toastify';
import AdminLoginProtector from '../routeProtector/adminLoginProtector';
import AdminProtectiveCheck from '../routeProtector/adminProtectiveCheck';
import AdminHostManagePage from '../pages/adminPages/adminHostManagePage'
import AdminHostelListingsPage from '../pages/adminPages/adminHostelListingsPage';
import AdminCategoryPage from '../pages/adminPages/adminCategoryPage'
import AdminAddCategoryPage from '../components/adminComponent/Category/AdminAddCategory';
import AdminEditCategoryPage from '../pages/adminPages/adminEditCategoryPage';
import AdminHostDetailedPage from '../pages/adminPages/adminHostDetailedPage';



const AdminRoute = () => {
    return (
        <div>
            <ToastContainer theme='dark'/>
            <Routes>
                <Route path='/login' element={<AdminProtectiveCheck element={<AdminLogin />} />} />
                <Route path='/user' element={<AdminLoginProtector element={<AdminUserManagePage/>} />} />
                <Route path='/dashboard' element={<AdminLoginProtector element={<AdminDashboardPage/>} />} />
                <Route path='/host' element={<AdminLoginProtector element={<AdminHostManagePage/>} />} />
                <Route path='/hostel' element={<AdminLoginProtector element={<AdminHostelListingsPage/>} />} />
                <Route path='/category' element={<AdminLoginProtector element={<AdminCategoryPage/>} />} />
                <Route path='/addcategory' element={<AdminLoginProtector element={<AdminAddCategoryPage/>} />} />
                <Route path='/editcategory/:id' element={<AdminLoginProtector element={<AdminEditCategoryPage/>} />} />
                <Route path='/hostdetailed/:id' element={<AdminLoginProtector element={<AdminHostDetailedPage/>} />} />
            </Routes>
        </div>
    )
}

export default AdminRoute
