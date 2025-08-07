import { userRole } from "../Enum";

export const scheduleRoles = Object.freeze({

    SCHEDULE_MANAGER : [ // 일정관리 전체 일정 수정 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],
    // 달력 추가 버튼
    CALENDER_ADD_BTN: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    // 상세 row 클릭
    DETAIL_ROW_CLICK: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    // 공정률 아이콘
    RATE_ICON: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
});