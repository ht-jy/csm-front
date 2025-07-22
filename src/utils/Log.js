import { useAuth } from "../component/context/AuthContext";
import { dateUtil } from "./DateUtil";

/**
 * @description: 추가/수정/삭제시 로그기록에 필요한 구조와 실제 작업에 필요한 데이터를 랩핑하는 객체를 반환
 * @author 작성자: 김진우
 * @created 작성일: 2025-07-09
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @modified Description: 
 *
 */

export const useLogParam = () => {
    const { user } = useAuth();

    const createLogParam = ({ type = "", menu = "", before = {}, after = {}, item = {}, items }) => {
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
            items,
        };
    };

    return { createLogParam };
};