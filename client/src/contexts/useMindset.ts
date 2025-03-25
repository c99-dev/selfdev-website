import { useContext } from "react";
import { MindsetContext } from "./mindset/MindsetContext";

export const useMindset = () => {
  const context = useContext(MindsetContext);
  if (context === undefined) {
    throw new Error("useMindset must be used within a MindsetProvider");
  }
  return context;
};
