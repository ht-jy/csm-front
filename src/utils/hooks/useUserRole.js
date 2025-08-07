import { useAuth } from "../../component/context/AuthContext";
import { userRole } from "../Enum";
import { ObjChk } from '../ObjChk';

/**
 * @description: 기본, 조직도, 프로젝트 권한을 체크하고 기능별 권한을 관리
 * @author 작성자: 김진우
 * @created 작성일: 2025-07-09
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @modified Description: 
 *
 */

// 권한 체크
export const useUserRole = () => {
    const {user, jobRole, userRole, project} = useAuth();

    const isRoleValid = (roles = []) => {
        const roleList = [
            user?.role,
            jobRole,
            ...(
            Array.isArray(userRole) && project?.jno
                ? userRole
                    .filter(r => r.jno === project.jno && !ObjChk.all(r.role_code))
                    .map(r => r.role_code)
                : []
            )
        ];
        const roleCodes = roles.map(r => r.code);
        return roleList.some(role => !ObjChk.all(role) && roleCodes.includes(role));
    };

    return { isRoleValid };
}
