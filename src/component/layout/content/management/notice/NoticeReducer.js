const NoticeReducer = (state, action) => {
    switch (action.type) {

        case "HEADER":
            const headerList = [];
            action.notices.map((item, idx) => {
                    headerList.push({job_name : item.job_name, title: item.title})
            })
            return {...state, noticesHeader: JSON.parse(JSON.stringify(action.notices)), count: action.count, headerList: headerList}
        
        // 공지사항 데이터
        case "INIT":
            return { ...state, notices: JSON.parse(JSON.stringify(action.notices)), count: action.count };

        
        // 등록 및 수정 시 프로젝트 선택 리스트
        case "PROJECT_NM":
            const projectNm = [];
            projectNm.push({value: 0, label: "전체"});
            action.projectNm.map((item, idx) => {
                projectNm.push({ value: Number(item.jno), label: item.project_nm });
            })

            const projectList = {
                ...state.selectList,
                projectNm: projectNm
            }

            return { ...state, selectList: JSON.parse(JSON.stringify(projectList)) };
            
        // 등록 및 수정 시 공지기간 선택 리스트 
        case "NOTICE_NM":
            const noticeNm = [];
            action.period.map((item, idx) => {
                noticeNm.push({value:item.period_code, label:item.notice_nm});
            })

            const periodList = {
                ...state.selectList,
                noticeNm: noticeNm
            }

            return {...state, selectList: JSON.parse(JSON.stringify(periodList))}
    }
    
}

export default NoticeReducer;