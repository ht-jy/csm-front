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
    SITE_ADD: [ // 현장 추가
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],    
    SITE_MOD: [ // 현장 수정
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],      
    SITE_WORK_FINISH: [ // 현장 작업 완료
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],
    SITE_WORK_CANCEL: [ // 작업 완료 취소
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],    
});
