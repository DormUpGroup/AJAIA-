"use client";

/* Hydration-safe mock user: read localStorage only after mount. */
/* eslint-disable react-hooks/set-state-in-effect */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_MOCK_USER_ID,
  getMockUserById,
  MOCK_USER_STORAGE_KEY,
  MOCK_USERS,
  type MockUser,
} from "./mock-users";

type MockUserContextValue = {
  currentUser: MockUser;
  setCurrentUserId: (userId: string) => void;
  users: MockUser[];
  isReady: boolean;
};

const MockUserContext = createContext<MockUserContextValue | null>(null);

export function MockUserProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState(DEFAULT_MOCK_USER_ID);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (stored && getMockUserById(stored)) {
      setCurrentUserIdState(stored);
    }
    setIsReady(true);
  }, []);

  const setCurrentUserId = useCallback((userId: string) => {
    if (!getMockUserById(userId)) {
      return;
    }
    setCurrentUserIdState(userId);
    window.localStorage.setItem(MOCK_USER_STORAGE_KEY, userId);
  }, []);

  const currentUser = useMemo(
    () => getMockUserById(currentUserId) ?? MOCK_USERS[0],
    [currentUserId],
  );

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUserId,
      users: MOCK_USERS,
      isReady,
    }),
    [currentUser, setCurrentUserId, isReady],
  );

  return (
    <MockUserContext.Provider value={value}>{children}</MockUserContext.Provider>
  );
}

export function useMockUser() {
  const context = useContext(MockUserContext);
  if (!context) {
    throw new Error("useMockUser must be used within MockUserProvider");
  }
  return context;
}
