import { userRole } from "../Enum";

export const noticeRoles = Object.freeze({
    NOTICE_LIST: [ // 공지사항 전체 조회 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.EXECUTIVE
    ],
    NOTICE_ADD: [ // 공지사항 등록
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
    ],
    DETAIL_NOTICE_COPY: [ //공지사항 복사 권한
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    DETAIL_NOTICE_MOD: [ // 상세>  수정
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    DETAIL_NOTICE_DEL: [ // 공지사항 삭제 권한
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
});