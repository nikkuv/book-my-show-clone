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

      if (isNetworkErrorMessage(msg)) {
        notifyNetworkError(msg);
      } else {
        message.error({ content: msg, key: "session-msg" });
      }
      router.push("/login");
    } catch (error) {
      dispatch(hideLoading());
      dispatch(setUser(null));
      if (isNetworkErrorMessage(error?.message)) {
        notifyNetworkError(error.message);
      } else {
        message.error({ content: error.message, key: "session-msg" });
      }
      router.push("/login");
    }
  };

  useEffect(() => {
    if (user || authCheckStarted.current) return;
    authCheckStarted.current = true;
    getPresentUser();
  }, [user]);

  return user && children;
}

export default ProtectedRoute;
