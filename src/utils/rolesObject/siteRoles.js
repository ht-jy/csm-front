// 현장관리 기능별 권한

import { userRole } from "../Enum";

// 홈페이지에서 기능별 권한 설정을 하지 않아서 DB로 관리를 안하고 있음
export const siteRoles = Object.freeze({
    SITE_LIST: [ // 현장 전체 조회 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.EXECUTIVE
    ],
    SITE_MANAGER: [ // 현장 추가/수정, 작업 추가/완료/취소 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],    

});
