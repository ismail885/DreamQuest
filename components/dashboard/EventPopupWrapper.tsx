"use client";

import { useEventContext } from "@/context/EventContext";
import EventPopup from "./EventPopup";

export default function EventPopupWrapper() {
  const { isEventPopupOpen, closeEventPopup } = useEventContext();

  return <EventPopup isOpen={isEventPopupOpen} onClose={closeEventPopup} />;
}
