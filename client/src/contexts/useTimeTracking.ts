import { useContext } from "react";
import { TimeTrackingContext } from "./timetracking/TimeTrackingContext";

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error(
      "useTimeTracking must be used within a TimeTrackingProvider",
    );
  }
  return context;
};
