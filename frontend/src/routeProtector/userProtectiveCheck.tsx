import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface UserProtectiveCheckProps {
    element: React.ReactNode;
}

const UserProtectiveCheck: React.FC<UserProtectiveCheckProps> = ({ element }) => {
    const accessToken = useSelector((state: RootState) => state.userAuth.accessToken);
    const location = useLocation();

    return !accessToken?(<>{element}</>):(<Navigate to="/user/home" state={{from:location}} />) 

};

export default UserProtectiveCheck;
