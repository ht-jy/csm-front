import { userRole } from "../Enum";

export const noticeRoles = Object.freeze({
    NOTICE_MANAGER: [ // 공지사항 전체 조회 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
    ],
    NOTICE_ADD_MANAGER: [ // 공지사항 등록 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
        userRole.SITE_DIRECTOR.code,
        userRole.SITE_MANAGER.code,
        userRole.TEMP_SITE_MANAGER.code,
        userRole.SAFETY_MANAGER.code,
        userRole.SUPERVISOR.code,
    ],
    NOTICE_ALL_MOD_MANAGER: [ // 다른 사람이 작성한 공지사항 수정, 삭제 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
    ]

});