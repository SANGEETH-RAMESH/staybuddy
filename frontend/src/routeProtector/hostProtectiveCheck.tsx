import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface HostProtectiveCheckProps {
  element: React.ReactNode;
}

const HostProtectiveCheck: React.FC<HostProtectiveCheckProps> = ({ element }) => {

  const isHostLoggedIn = useSelector((state: RootState) => state.hostAuth.accessToken) || localStorage.getItem('hostRefreshToken') 
  const location = useLocation();
console.log(isHostLoggedIn,'ffff')
// console.log(element,'element')
  return !isHostLoggedIn ? (
    <>{element}
    </>
  ) : (
    <Navigate to="/host/home" state={{ from: location }} />
  );
};

export default HostProtectiveCheck;
