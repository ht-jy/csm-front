const SiteBaseReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            if (state.initialList.length === 0) {
                return {...state, list: JSON.parse(JSON.stringify(action.list)), initialList: JSON.parse(JSON.stringify(action.list)), count: action.count};
            }else{
                return {...state, list: JSON.parse(JSON.stringify(action.list)), count: action.count};
            }
        case "SITE_NM":
            const siteNmList = [];
            action.list.map(item => {
                siteNmList.push({value:item.sno, label:item.site_nm});
            })

            return {...state, siteNmList: JSON.parse(JSON.stringify(siteNmList))};
    }
}

export default SiteBaseReducer;