import { userRole } from "../Enum";

// 홈페이지에서 기능별 권한 설정을 하지 않아서 DB로 관리를 안하고 있음
export const workerRoles = Object.freeze({
    /********** 전체 근로자 **********/
    TOTAL_WORKER_LIST: [ // 근로자 전체 조회 권한
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],
    TOTAL_WORKER_UPLOAD_ADD : [ // 근로자 업로드 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_FORM_DOWNLOAD : [ // 양식 다운로드 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_WORKER_ADD : [ // 근로자 추가 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_WORKER_MOD:[ // 근로자 상세 > 수정 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    TOTAL_WORKER_DEL: [ // 근로자 상세 > 삭제 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],

    /********** 비교근로자 **********/
    COMPARE_TBM_FORM_DOWNLOAD:[ // TBM 양식 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    COMPARE_DEDUCTION_FORM_DOWNLOAD: [    // 퇴직공제 양식 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    COMPARE_TBM_UPLOAD: [    // TBM 파일 업로드
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    COMPARE_TBM_UPLOAD_DOWNLOAD: [    // TBM 업로드 된 파일 다운로드
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    COMPARE_DEDUCTION_UPLOAD: [    // 퇴직공제 업로드
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    COMPARE_DEDUCTION_UPLOAD_DOWNLOAD: [    // 퇴직공제 업로드 된 파일 다운
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    COMPARE_REGISTER: [    // 반영 버튼
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],

    /********** 현장근로자 **********/
    SITE_WORKER_LIST : [ // 근로자 목록 전체조회 (협력업체는 본인의 근로자만 보여줘야 함.)
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
    ],

    SITE_WORKER_RECORD_INFO_DOWNLOAD : [ // 근태 다운로드
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
    ],
    SITE_WORKER_RECORD_UPLOAD : [ // 근태 업로드
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_FORM_DOWNLOAD : [ // 양식 다운로드
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SUPERVISOR,
        userRole.SAFETY_MANAGER,
        userRole.CO_MANAGER,
    ],
    SITE_WORKER_MOD : [ // 현장 근로자 수정
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_BATCH_DEADLINE : [ // 일괄 마감
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_BATCH_WORK_HOUR : [ // 공수입력
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ], 
    SITE_WORKER_TRANS_PROJECT : [ // 프로젝트 변경
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_DEL : [ // 현장 근로자 삭제
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_CANCEL_DEADLINE :[ // 마감 취소
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
    ],
    SITE_WORKER_HISTORY : [ // 변경 이력
        userRole.SUPER_ADMIN,
        userRole.SYSTEM_ADMIN,
        userRole.ADMIN,
        userRole.SITE_DIRECTOR,
        userRole.SITE_MANAGER,
        userRole.TEMP_SITE_MANAGER,
        userRole.SAFETY_MANAGER,
    ],
    
});
