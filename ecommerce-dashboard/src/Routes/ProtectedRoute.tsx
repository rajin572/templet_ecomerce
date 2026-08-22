import { Navigate } from "react-router-dom";
import useUserData from "../hooks/useUserData";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: string | string[];
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const user = useUserData();

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
