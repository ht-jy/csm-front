import { userRole } from "../Enum";

export const projectRoles = Object.freeze({
    PROJECT_NM: [ // 프로젝트 이름 조회 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
    ],
});