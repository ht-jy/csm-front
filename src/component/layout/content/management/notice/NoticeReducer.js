const NoticeReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            return { ...state, notices: JSON.parse(JSON.stringify(action.notices)), count: action.count };

        case "SITE_NM":

            const siteNm = [];
            action.list.map((item, idx) => {
                siteNm.push({ value: item.sno, label: item.site_nm });
            })
            // FIXME: 프로젝트에 전체, 지역을 넣을 것인지 아니면 공개여부로 선택할 것인지. 
            // siteNm.push({value: 0, label: "전체"});

            const visibility = [
                { value: 0, label: "전체공개" },
                { value: 1, label: "해당지역" },
                { value: 2, label: "프로젝트" }
            ]

            const selectList = {
                siteNm: siteNm,
                visibility: visibility
            }
            return { ...state, selectList: JSON.parse(JSON.stringify(selectList)) };
    }
}

export default NoticeReducer;