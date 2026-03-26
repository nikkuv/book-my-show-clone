"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "@/components/Header/Header";
import { SearchProvider } from "@/components/Header/SearchContext";
import { GetCurrentUser } from "../../../services/user";
import { setUser } from "@/redux/usersSlice";

export default function HomeLayout({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const hydrated = useRef(false);

  useEffect(() => {
    if (user) {
      hydrated.current = true;
      return;
    }
    if (hydrated.current) return;
    hydrated.current = true;

    (async () => {
      try {
        const response = await GetCurrentUser();
        if (response?.success && response.data) {
          dispatch(setUser(response.data));
        }
      } catch {
        // anonymous visitor — silently ignore
      }
    })();
  }, [user]);

  return (
    <SearchProvider>
      <Header />
      {children}
    </SearchProvider>
  );
}
