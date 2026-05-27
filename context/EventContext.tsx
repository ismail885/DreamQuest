"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface EventContextType {
  isEventPopupOpen: boolean;
  openEventPopup: () => void;
  closeEventPopup: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);

  const openEventPopup = () => setIsEventPopupOpen(true);
  const closeEventPopup = () => setIsEventPopupOpen(false);

  return (
    <EventContext.Provider
      value={{
        isEventPopupOpen,
        openEventPopup,
        closeEventPopup,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventContext doit être utilisé dans un EventProvider");
  }
  return context;
}
