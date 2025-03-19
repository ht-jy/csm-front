const NoticeReducer = (state, action) => {
    switch (action.type) {

        case "HEADER":
            const headerList = [];
            action.notices.map((item, idx) => {
                if (item.job_name === "전체"){
                    headerList.push(`전사 - ${item.title}`)
                }else {
                    headerList.push(`PROJ - ${item.title}`)
                }
            })
            console.log("action.count ", action.count)
            return {...state, notices: JSON.parse(JSON.stringify(action.notices)), count: action.count, noticesHeader: headerList}
        
        // 공지사항 데이터
        case "INIT":
            return { ...state, notices: JSON.parse(JSON.stringify(action.notices)), count: action.count };

        
        // 등록 및 수정 시 프로젝트 선택 리스트
        case "PROJECT_NM":
            const projectNm = [];
            projectNm.push({value: 0, label: "전체"});
            action.site.map((item, idx) => {
                projectNm.push({ value: item.jno, label: item.project_nm });
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