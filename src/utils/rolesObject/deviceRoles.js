import { userRole } from "../Enum";

// 인식기 기능별 권한
export const DeviceRoles = Object.freeze({
    // 인식기 추가 버튼
    ADD_BTN:[
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],
    // 상세 수정 버튼
    MOD_BTN: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],
    // 삭세 삭제 버튼
    DEL_BTN: [
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
    ],
});