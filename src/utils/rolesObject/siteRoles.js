// 현장관리 기능별 권한
// 홈페이지에서 기능별 권한 설정을 하지 않아서 DB로 관리를 안하고 있음
export const roleGroup = Object.freeze({
    SITE_MANAGER: [ // 현장 등록 권한
        userRole.SYSTEM_ADMIN.code,
        userRole.SUPER_ADMIN.code,
        userRole.ADMIN.code,
        userRole.SITE_DIRECTOR.code,
        userRole.SITE_MANAGER.code
    ],
});