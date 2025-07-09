import { ObjChk } from "../../../../../utils/ObjChk";


const DeviceReducer = (state, action) => {
    switch (action.type) {
        case "INIT":

            const devices = (ObjChk.ensureArray(action.list)).map(device => ({
                ...device,
                // is_use: device?.is_use === "Y" ? "사용중" : "사용안함"
            }));
            
            return { ...state, list: structuredClone(ObjChk.ensureArray(action.list)), count: action.count ?? 0, devices: structuredClone(ObjChk.ensureArray(action.list))};

        case "SITE_NM":

            const siteNm = ObjChk.ensureArray(action.list).map((item, idx) => ({ value: item.sno, label: item.site_nm }))

            const selectList = {
                siteNm: siteNm
            }
            return { ...state, selectList: JSON.parse(JSON.stringify(selectList)) };
        
        default:
            return state;
    }
}

export default DeviceReducer;