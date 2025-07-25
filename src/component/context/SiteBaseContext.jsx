import { createContext, useContext } from "react";

const SiteBaseContext = createContext();
export default SiteBaseContext;

export const useSiteBase = () => {
    const context = useContext(SiteBaseContext);
    if (!context) {
        throw new Error("useAuth must be used within an SiteBaseProvider");
    }
    return context;
}