import { userRole } from "../Enum";

export const noticeRoles = Object.freeze({
    NOTICE_MANAGER: [ // 공지사항 전체 조회 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],
    NOTICE_ADD_MANAGER: [ // 공지사항 등록 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    NOTICE_ALL_MOD_MANAGER: [ // 다른 사람이 작성한 공지사항 수정, 삭제 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    NOTICE_COPY_MANAGER: [ // 다른 사람이 작성한 공지사항 복사 권한
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],

});