import { useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import { decodedToken } from "../utils/jwt";
import { IJwtPayload } from "../types";

export const TOKEN_UPDATED_EVENT = "eCommerce_main_accessToken_updated";

const subscribe = (callback: () => void) => {
  window.addEventListener(TOKEN_UPDATED_EVENT, callback);
  return () => window.removeEventListener(TOKEN_UPDATED_EVENT, callback);
};

const getSnapshot = () => Cookies.get("eCommerce_main_accessToken") ?? null;

const useUserData = (): IJwtPayload | null => {
  const token = useSyncExternalStore(subscribe, getSnapshot);

  if (!token) return null;
  return decodedToken(token) as IJwtPayload | null;
};

export default useUserData;
