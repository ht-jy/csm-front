import { userRole } from "../Enum";

// 협력업체 기능별 권한
export const CompanyRoles = Object.freeze({
    GRANT_TEMP_SITE_MANAGER: [ // 임시 현장관리자 부여/해제 권한
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
    ],
});