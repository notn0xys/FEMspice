import {Navigate} from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
    id: number;
    exp: number;
}

const UserRoute = ({children}: {children: React.ReactNode}) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log("No token found");
        return <Navigate to={"/login"} replace/>
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decoded.exp < currentTime) {
            console.log("Token expired");
            localStorage.removeItem("token");
            return <Navigate to={"/login"} replace/>
        }
    }
    catch (error) {
        console.log("Invalid token:", error);
        localStorage.removeItem("token");
        return <Navigate to={"/login"} replace/>
    }

    return <>{children}</>;
}

export default UserRoute;