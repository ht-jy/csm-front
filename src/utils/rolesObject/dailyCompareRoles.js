import { userRole } from "../Enum";

// 일일근로자비교 기능별 권한
export const DailyCompareRoles = Object.freeze({
    // TBM 양식 버튼
    TBM_EXPORT:[
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
        userRole.SUPERVISOR,
    ],
    // 퇴직공제 양식 버튼
    DEDUCTION_EXPORT: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
        userRole.SUPERVISOR,
    ],
    // TBM 업로드
    TBM_UPLOAD: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    // TBM 업로드 파일 다운
    TBM_FILE_DOWNLOAD: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
        userRole.SUPERVISOR,
    ],
    // 퇴직공제 업로드
    DEDUCTION_UPLOAD: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    // 퇴직공제 업로드 파일 다운
    DEDUCTION_FILE_DOWNLOAD: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
        userRole.SUPERVISOR,
    ],
    // 반영 버튼
    REGISTER: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
});