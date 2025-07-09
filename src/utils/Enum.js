/**
 * @description: enum과 비슷하게 사용하기 위한 js
 * @author 작성자: 김진우
 * @created 작성일: 2025-07-09
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @modified Description: 
 *
 */

// 결과
export const resultType  = Object.freeze({
    SUCCESS: "Success",
    FAILURE: "Failure",
    EXCEL_FORMAT_ERROR: "excel format error",
});

// 사용자 권한
export const userRole = Object.freeze({
    SYSTEM_ADMIN: {code: "SYSTEM_ADMIN", label: "시스템관리자"},
    SUPER_ADMIN: {code:"SUPER_ADMIN", label: "슈퍼관리자"},
    ADMIN: {code:"ADMIN", label: "관리자"},
    SITE_DIRECTOR: {code:"SITE_DIRECTOR", label: "현장소장"},
    SITE_MANAGER: {code:"SITE_MANAGER", label: "현장관리자"},
    TEMP_SITE_MANAGER: {code:"TEMP_SITE_MANAGER", label: "임시현장관리자"},
    SAFETY_MANAGER: {code:"SAFETY_MANAGER", label: "안전관리자"},
    SUPERVISOR: {code:"SUPERVISOR", label: "관리감독자"},
    CO_MANAGER: {code:"CO_MANAGER", label: "협력업체관리자"},
    EXECUTIVE: {code:"EXECUTIVE", label: "임원"},
    USER: {code:"USER", label: "일반직원"},
    CO_USER: {code:"CO_USER", label: "협력업체직원"},
});