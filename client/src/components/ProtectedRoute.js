"use client";
import { message } from "antd";
import { GetCurrentUser } from "../../services/user";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setUser } from "@/redux/usersSlice";
import { showLoading, hideLoading } from "@/redux/loaderSlice";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.users);
  const router = useRouter();
  const dispatch = useDispatch();

  const getPresentUser = async () => {
    try {
      dispatch(showLoading());
      const response = await GetCurrentUser();
      dispatch(hideLoading());
      if (response.success) {
        dispatch(setUser(response.data));
      } else {
        dispatch(setUser(null));
        message.error(response.message);
        router.push("/login");
      }
    } catch (error) {
      dispatch(hideLoading());
      dispatch(setUser(null));
      message.error(error.message);
      router.push("/login");
    }
  };

  useEffect(() => {
    if (!user) {
      getPresentUser();
    }
  }, [user]);

  return user && children;
}

export default ProtectedRoute;
