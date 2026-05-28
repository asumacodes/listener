"use client";

import { getSessionUser, getUserInitial } from "@/lib/auth/session";
import { useCallback, useEffect, useRef, useState } from "react";

const useHeaderMenu = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((user) => active && setEmail(user?.email ?? null))
      .catch(() => active && setEmail(null));
    return () => {
      active = false;
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, close]);

  return {
    email,
    initial: getUserInitial(email),
    open,
    toggle,
    close,
    menuRef,
  };
};

export default useHeaderMenu;
