import {
  createBrowserRouter,
  RouteObject,
  useNavigate,
} from "react-router-dom";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import { routeGenerator } from "@/utils/routesGenerator";
import { adminRoutes } from "./admin.route";
import { useEffect } from "react";
import Loading from "@/Components/ui/CustomUi/Loading";
import SignIn from "@/pages/Auth/SignIn";
import ForgotPassword from "@/pages/Auth/ForgetPassword";
import OTPVerify from "@/pages/Auth/OtpPage";
import UpdatePassword from "@/pages/Auth/UpdatePassword";
import NotFound from "@/Components/ui/CustomUi/NotFound/NotFound";
import useUserData from "@/hooks/useUserData";
import ProtectedRoute from "./ProtectedRoute";

function AuthRedirect() {
  const user = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin" || user.role === "staff")) {
      navigate(`/admin/overview`, {
        replace: true,
      });
    } else {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, user]);

  return <Loading />;
}

// Define routes with TypeScript types
const router: RouteObject[] = [
  {
    path: "/",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/dashboard",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/admin/dashboard",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/overview",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/admin",
    index: true, // This applies to the exact path "/"
    element: <AuthRedirect />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role={["admin", "super_admin", "staff"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: routeGenerator(adminRoutes),
  },
  {
    path: "sign-in",
    element: <SignIn />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "forgot-password/otp-verify",
    element: <OTPVerify />,
  },
  {
    path: "update-password",
    element: <UpdatePassword />,
  },
  // {
  //   path: "password-reset-success",
  //   element: <PasswordResetSuccess />,
  // },
  {
    path: "*", // Catch-all for undefined routes
    element: <NotFound />,
  },
];

// Create the router using createBrowserRouter
const routes = createBrowserRouter(router);

export default routes;
