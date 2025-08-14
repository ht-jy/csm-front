import { userRole } from "../Enum";

// 홈페이지에서 기능별 권한 설정을 하지 않아서 DB로 관리를 안하고 있음
export const workerRoles = Object.freeze({
    /********** 전체 근로자 **********/
    TOTAL_WORKER_ADD : [ // 근로자 추가 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_EXCEL_DOWNLOAD : [ // 엑셀 양식 다운로드 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],

    TOTAL_EXCEL_UPLOAD_ADD : [ // 엑셀 업로드 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],

    TOTAL_WORKER_MOD:[ // 근로자 상세 수정 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_WORKER_DEL: [ // 근로자 상세 삭제 버튼
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],

    
    /********** 현장근로자 **********/
    SITE_WORKER_RECORD_INFO_DOWNLOAD : [ // 근태 정보 다운로드
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
        userRole.SUPERVISOR
    ],
    SITE_WORKER_FORM_DOWNLOAD : [ // 양식 다운로드
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
        userRole.SUPERVISOR
    ],
    SITE_WORKER_EXCEL_UPLOAD : [ // 엑셀 업로드
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_MOD : [ // 현장 근로자 수정
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_BATCH_DEADLINE : [ // 일괄 마감
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,

    ],
    SITE_WORKER_BATCH_WORK_HOUR : [ // 공수입력
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ], 
    SITE_WORKER_TRANS_PROJECT : [ // 프로젝트 변경
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_DEL : [ // 현장 근로자 삭제
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_CANCEL_DEADLINE :[ // 마감 취소
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_HISTORY : [ // 변경 이력
        userRole.SYSTEM_ADMIN,
        userRole.SUPER_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
        userRole.SUPERVISOR
    ],
    
});
