const DailyDeadlineReducer = (state, action) => {
    switch(action.type){
        case "FILE_INIT":
            return {...state, list: structuredClone(action.list || [])};

        case "FILE_EMPTY":
            return {...state, list: []};

        default:
            return state;
    }
}

export default DailyDeadlineReducer;