import { Common } from "../../../../../utils/Common";
import { ObjChk } from "../../../../../utils/ObjChk";

const SiteBaseReducer = (state, action) => {
    switch (action.type) {
        case "EMPTY":
            return {...state, list: []}
        case "INIT":
            let initList = ObjChk.ensureArray(action.list);
            // 협력업체가 현장근로자 조회를 하는 경우 같은 현장근로자만 조회하도록 필터링
            if(action.loginCompany.is){
                // api업체명과 홍채인식기업체명이 영어/한글로 다르게 쓰일 수 있기에 한글로 변환
                const copyList = initList.map(item => {
                    return {...item, department: Common.spellToHangul(item.department.split(" ")[0] || "")};
                });
                const department = Common.spellToHangul(action.loginCompany.name || "");
                initList = copyList.filter(item => department.includes(item.department));
            }
            const list = Array.isArray(initList) ? initList.map((item, idx) => ({...item, index: idx, unableEdit: item.is_deadline === 'Y'})) : [];
            
            return {...state, list: JSON.parse(JSON.stringify(list)), initialList: JSON.parse(JSON.stringify(list)), count: action.count};
        case "SITE_NM":
            const siteNmList = [];
            Array.isArray(action.list) && action.list.forEach(item => {
                siteNmList.push({
                    value: item?.sno ?? '',
                    label: item?.site_nm ?? ''
                });
            });

            return {...state, siteNmList: JSON.parse(JSON.stringify(siteNmList))};            
        case "WORK_STATE_CODE":
            return {...state, workStateCodes: structuredClone(Array.isArray(action.code) ? action.code : [])};

        case "PROJECT_SETTING":
            let projectSet = {};
            if(action.list.length > 0){
                projectSet = action.list[0];
            }
            
            return {...state, projectSetting: projectSet};

        case "DEADLINE_CANCEL_CODE":
            return {...state, deadlineCode: action.list};

        default:
            return state;
    }
}

export default SiteBaseReducer;