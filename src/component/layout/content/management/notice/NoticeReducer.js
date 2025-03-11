const NoticeReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            return { ...state, notices: JSON.parse(JSON.stringify(action.notices)), count: action.count };

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