import { userRole } from "../Enum";

export const ProjectSettingRoles = Object.freeze({
    SETTING_LIST: [    // 모든 프로젝트 조회
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],
    WORK_HOUR_MOD: [    // 공수시간 수정
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    PERIOD_HOUR_MOD: [    // 유예시간 수정
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    DEADLINE_CANCEL_MOD: [    // 마감취소 수정
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
});