import { userRole } from "../Enum";

export const projectRoles = Object.freeze({
    PROJECT_NM: [ // 프로젝트 이름 조회 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],
    PROJECT_WORK_FINISH: [ // 프로젝트 작업 완료
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ], 
});