import { userRole } from "../Enum";

// 홈페이지에서 기능별 권한 설정을 하지 않아서 DB로 관리를 안하고 있음
export const workerRoles = Object.freeze({
    TOTAL_WORKER_ADD : [ // 근로자 추가 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_WORKER_MOD:[ // 근로자 상세 수정 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_WORKER_DEL: [ // 근로자 상세 삭제 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],

});