import { ObjChk } from "../../../../../utils/ObjChk";

const NoticeReducer = (state, action) => {
    switch (action.type) {

        case "HEADER":
            const headerList = ObjChk.ensureArray(action.notices).map((item, idx) => ({job_name : item.job_name, title: item.title}))

            return {...state, noticesHeader: structuredClone(ObjChk.ensureArray(action.notices)), count: action.count ?? 0, headerList: headerList}
        
        // 공지사항 데이터
        case "INIT":
            return { ...state, notices: structuredClone(ObjChk.ensureArray(action.notices)), count: action.count ?? 0};

        
        // 등록 및 수정 시 프로젝트 선택 리스트
        case "PROJECT_NM":
            const projectNm = [{ value: 0, label: "전체" }];
            const projectListRaw = ObjChk.ensureArray(action.projectNm);

            projectListRaw.forEach((item, idx) => {
                projectNm.push({ value: Number(item?.jno ?? 0), label: item.project_nm ?? '' });
            })

            const projectList = {
                ...state.selectList,
                projectNm: projectNm
            }

            return { ...state, selectList: structuredClone(projectList) };
            
        // 등록 및 수정 시 공지기간 선택 리스트 
        case "NOTICE_NM":
            const noticeNm = [];
            const periodRaw = ObjChk.ensureArray(action.period);
            periodRaw.forEach((item, idx) => {
                noticeNm.push({value:item.period_code ?? '', label:item.notice_nm ?? ''});
            })

            const periodList = {
                ...state.selectList,
                noticeNm: noticeNm
            }

            return {...state, selectList: structuredClone(periodList)}
    }
    
}

export default NoticeReducer;