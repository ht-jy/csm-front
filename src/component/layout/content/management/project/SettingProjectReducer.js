import { ObjChk } from "../../../../../utils/ObjChk";

const SettingProjectReducer = (state, action) => {
    switch (action.type) {
        case "SELECT_OPTIONS":
            const selectOptions = [];
                action.list.forEach((item, idx) => {
                    selectOptions.push({value: item?.code, label:item?.code_nm});
                });                

            return { ...state, selectOptions: structuredClone(ObjChk.ensureArray(selectOptions)) };
            
        case "MAN_HOURS":
            return { ...state, manHours: structuredClone(ObjChk.ensureArray(action.manHours))};

        case "SETTING":
            return { ...state, setting: structuredClone(action.setting)};

        default:
            return state;
    }
}

export default SettingProjectReducer;