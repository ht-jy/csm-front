import { userRole } from "../Enum";

export const scheduleRoles = Object.freeze({
    SCHEDULE_LIST : [ // 전체 일정 확인
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.EXECUTIVE
    ],
    SCHEDULE_ADD_BTN: [    // 일정 추가
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
    ],
    DETAIL_ROW_CLICK : [    // 상세 > 작업내용 상세 확인
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    DETAIL_SCHEDULE_MOD_DEL: [    // 상세 > 수정/삭제
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    RATE_EQUIP_ROLE: [   // 공정률/장비 수정 권한
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SUPERVISOR,
    ],
});