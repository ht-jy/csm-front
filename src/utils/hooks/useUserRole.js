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

// 기능별 권한 관리
// 홈페이지에서 기능별 권한 설정을 하지 않아서 DB로 관리를 안하고 있음
export const roleGroup = Object.freeze({
    GRANT_TEMP_SITE_MANAGER: [ // 임시 현장관리자 부여 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
        userRole.SITE_MANAGER.code,
    ],
    SITE_MANAGER: [ // 현장 등록 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
        userRole.SITE_DIRECTOR.code,
        userRole.SITE_MANAGER.code
    ],
    NOTICE_ADD_MANAGER: [ // 공지사항 등록 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
        userRole.SITE_DIRECTOR.code,
        userRole.SITE_MANAGER.code,
        userRole.TEMP_SITE_MANAGER.code,
        userRole.SAFETY_MANAGER.code,
        userRole.SUPERVISOR.code,
    ],
    NOTICE_ALL_MOD_MANAGER: [ // 다른 사람이 작성한 공지사항 수정, 삭제 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
    ]

});

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
        return roleList.some(role => !ObjChk.all(role) && roles.includes(role));
    };

    return { isRoleValid };
}
