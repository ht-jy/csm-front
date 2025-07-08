import { useAuth } from "../component/context/AuthContext";
import { dateUtil } from "./DateUtil";

export const useLogParam = () => {
    const { user } = useAuth();

    const createLogParam = ({ type = "", menu = "", before = {}, after = {}, item = {} }) => {
        return {
            time: dateUtil.format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
            type,
            menu,
            user_name: user?.userName || '',
            user_uno: user?.uno || 0,
            record: {
                before,
                after,
            },
            item,
        };
    };

    return { createLogParam };
};