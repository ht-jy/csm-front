const SiteBaseReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            const list = action.list.map((item, idx) => {
                return {...item, index:idx}
            });
            return {...state, list: JSON.parse(JSON.stringify(list)), initialList: JSON.parse(JSON.stringify(list)), count: action.count};
        case "SITE_NM":
            const siteNmList = [];
            action.list.map(item => {
                siteNmList.push({value:item.sno, label:item.site_nm});
            })

            return {...state, siteNmList: JSON.parse(JSON.stringify(siteNmList))};            
    }
}

export default SiteBaseReducer;