

const SettingProjectReducer = (state, action) => {
    switch (action.type) {
        case "SELECT_OPTIONS":
            const selectOptions = [];
                action.list.forEach((item, idx) => {
                    selectOptions.push({value: item?.code, label:item?.code_nm})
                })                
        
            return { ...state, selectOptions: selectOptions };
            
        case "MAN_HOURS":
            return { ...state, manHours: [...action.manHours]}

        case "SETTING":
            return { ...state, setting: {...action.setting}}



        default:
            return state;
    }
}

export default SettingProjectReducer;