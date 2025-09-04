// 현장관리 기능별 권한

import { userRole } from "../Enum";

// 홈페이지에서 기능별 권한 설정을 하지 않아서 DB로 관리를 안하고 있음
export const siteRoles = Object.freeze({
    SITE_LIST: [ // 현장 전체 조회 권한
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.EXECUTIVE
    ],
    SITE_ADD: [ // 현장 추가
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],    
    SITE_DETAIL_MOD: [ // 상세 > 현장 수정
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_DETAIL_PJT_FINISH:[ // 상세 > 프로젝트 종료 및 취소
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],
    SITE_DETAIL_DELETE : [ // 상세 > 현장 삭제
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],
    SITE_DETAIL_FINISH: [ // 상세 > 현장 종료
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
    ],
    SITE_DETAIL_FINISH_CANCEL: [ // 상세 > 현장 종료 취소
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
    ],
});
