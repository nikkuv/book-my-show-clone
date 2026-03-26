"use client";
import { message } from "antd";
import { GetCurrentUser } from "../../services/user";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { setUser } from "@/redux/usersSlice";
import { showLoading, hideLoading } from "@/redux/loaderSlice";
import {
  isNetworkErrorMessage,
  notifyNetworkError,
} from "../../utils/notifyApiError";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.users);
  const router = useRouter();
  const dispatch = useDispatch();
  const authCheckStarted = useRef(false);

  const getPresentUser = async () => {
    try {
      dispatch(showLoading());
      const response = await GetCurrentUser();
      dispatch(hideLoading());

      if (response?.success && response.data) {
        dispatch(setUser(response.data));
        return;
      }

      dispatch(setUser(null));
      const msg =
        typeof response === "string"
          ? response
          : response?.message || "Session could not be verified";

      // Guest / expired cookie: redirect quietly — no "Invalid Token" spam
      const quietAuth =
        !msg ||
        String(msg).trim() === "" ||
        msg === "Invalid Token";

      if (!quietAuth) {
        if (isNetworkErrorMessage(msg)) {
          notifyNetworkError(msg);
        } else {
          message.error({ content: msg, key: "session-msg" });
        }
      }
      router.push("/login");
    } catch (error) {
      dispatch(hideLoading());
      dispatch(setUser(null));
      const errMsg = error?.message || "";
      const quiet =
        !errMsg ||
        errMsg === "Invalid Token" ||
        errMsg.includes("Network Error");
      if (!quiet && isNetworkErrorMessage(errMsg)) {
        notifyNetworkError(errMsg);
      } else if (!quiet) {
        message.error({ content: errMsg, key: "session-msg" });
      }
      router.push("/login");
    }
  };

  // When user exists (e.g. Redux persist), mark session as checked so logout → null
  // does not trigger getPresentUser() after the cookie was already cleared.
  useEffect(() => {
    if (user) {
      authCheckStarted.current = true;
      return;
    }
    if (authCheckStarted.current) return;
    authCheckStarted.current = true;
    getPresentUser();
  }, [user]);

  return user && children;
}

export default ProtectedRoute;
