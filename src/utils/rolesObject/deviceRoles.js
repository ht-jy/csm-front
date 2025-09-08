import { userRole } from "../Enum";

// 인식기 기능별 권한
export const DeviceRoles = Object.freeze({    
    DEVICE_ADD:[ // 인식기 추가
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],
    DETAIL_DEVICE_MOD: [ // 상세 > 인식기 수정
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],
    DETAIL_DEVICE_DEL: [ // 상세 > 인식기 삭제
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],
});