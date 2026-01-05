import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface ProtectivePropsCheck {
  element: React.ReactNode;
}

const AdminLoginProtector: React.FC<ProtectivePropsCheck> = ({ element }) => {
  const isAdminLoggedIn = useSelector((state: RootState) => state.adminAuth.accessToken) || localStorage.getItem('adminAccessToken'); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminRefreshToken");
    if (!token||token == undefined) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);

  return isAdminLoggedIn ? <>{element}</> : null;
};

export default AdminLoginProtector;
