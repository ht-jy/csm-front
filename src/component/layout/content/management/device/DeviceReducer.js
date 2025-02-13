

const DeviceReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            return {...state, list: JSON.parse(JSON.stringify(action.list)), count: action.count};
        case "SITE_NM":
            
            const siteNm = [];
            action.list.map((item, idx) => {
                siteNm.push({ value: item.sno, label: item.site_nm });
            })

            const selectList = {
                siteNm: siteNm
            }
            return {...state, selectList: JSON.parse(JSON.stringify(selectList))};
    }
}

export default DeviceReducer;