// import { Navigate } from "react-router-dom";
// import useUserData from "../hooks/useUserData";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: string | string[];
}

// FIXME: design-only phase — there is no backend yet, so a real login can't
// happen. Bypassing the auth/role gate so every admin page is reachable for
// design review. Restore the commented block below once auth is wired to a
// real API, and re-add the two imports above.
function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;

  // const user = useUserData();
  //
  // if (!user) {
  //   return <Navigate to="/sign-in" replace />;
  // }
  //
  // const allowedRoles = Array.isArray(role) ? role : [role];
  //
  // if (!allowedRoles.includes(user.role)) {
  //   return <Navigate to="/sign-in" replace />;
  // }
  //
  // return <>{children}</>;
}

export default ProtectedRoute;
