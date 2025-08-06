import { userRole } from "../Enum";

export const scheduleRoles = Object.freeze({


    SCHEDULE_MANAGER : [ // 일정관리 전체 일정 수정 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
    ]
});