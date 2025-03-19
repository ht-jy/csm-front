const NoticeReducer = (state, action) => {
    switch (action.type) {
        
        // 공지사항 데이터
        case "INIT":
            return { ...state, notices: JSON.parse(JSON.stringify(action.notices)), count: action.count };

        
        // 등록 및 수정 시 프로젝트 선택 리스트
        case "SITE_NM":
            const siteNm = [];
            siteNm.push({value: 0, label: "전체"});
            action.site.map((item, idx) => {
                siteNm.push({ value: item.sno, label: item.site_nm });
            })

            const siteList = {
                ...state.selectList,
                siteNm: siteNm
            }

            return { ...state, selectList: JSON.parse(JSON.stringify(siteList)) };
            
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