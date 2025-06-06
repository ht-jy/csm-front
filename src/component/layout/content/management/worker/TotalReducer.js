const TotalReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            const workerList = Array.isArray(action.list) ? action.list : [];
            const codeList = Array.isArray(action.code) ? action.code : [];

            const list = workerList.map(item => {
                const code = codeList.find(obj => obj.code == item.worker_type);
                item.worker_type_nm = code?.code_nm;
                return item;
            });
            if (state.initialList.length === 0) {
                return {...state, list: JSON.parse(JSON.stringify(list)), initialList: JSON.parse(JSON.stringify(list)), count: action.count};
            }else{
                return {...state, list: JSON.parse(JSON.stringify(list)), count: action.count};
            }
            
        case "SITE_NM":
            const siteNm = Array.isArray(action.list) ? action.list.map(item => ({value: item?.sno ?? '', label: item?.site_nm ?? ''})) : [];

            const selectList = {...state.selectList, siteNm: siteNm}
            
            return { ...state, selectList: JSON.parse(JSON.stringify(selectList)) };
        
        case "PROJECT_NM":
            const projectNm = Array.isArray(action.list) ? action.list.map(item => ({value: item?.jno ?? '', label: item?.project_nm ?? ''})) : [];

            const selectList2 = {...state.selectList, projectNm: projectNm}
            
            return { ...state, selectList: JSON.parse(JSON.stringify(selectList2)) };
        case "CODE":
            return { ...state, workerTypeCodes: Array.isArray(action.code) ? structuredClone(action.code) : [] };

        default:
            return state;
    }
}

export default TotalReducer;