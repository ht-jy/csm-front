const SiteBaseReducer = (state, action) => {
    switch (action.type) {
        case "EMPTY":
            return {...state, list: []}
        case "INIT":
            const list = action.list.map((item, idx) => {
                return {...item, index:idx, editState: item.is_deadline === 'Y'}
            });
            
            return {...state, list: JSON.parse(JSON.stringify(list)), initialList: JSON.parse(JSON.stringify(list)), count: action.count};
        case "SITE_NM":
            const siteNmList = [];
            action.list.map(item => {
                siteNmList.push({value:item.sno, label:item.site_nm});
            })

            return {...state, siteNmList: JSON.parse(JSON.stringify(siteNmList))};            
        case "WORK_STATE_CODE":
            return {...state, workStateCodes: structuredClone(action.code)};
    }
}

export default SiteBaseReducer;