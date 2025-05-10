import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface AdminProtectiveCheckProps {
  element: React.ReactNode;
}

const AdminProtectiveCheck: React.FC<AdminProtectiveCheckProps> = ({ element }) => {

  const isAdminLoggedIn = useSelector((state: RootState) => state.adminAuth.accessToken);
  const location = useLocation();

  return !isAdminLoggedIn ? (
    
    <>{element}</>
  ) : (
    
    <Navigate to="/admin/dashboard" state={{ from: location }} />
  );
};

export default AdminProtectiveCheck;
