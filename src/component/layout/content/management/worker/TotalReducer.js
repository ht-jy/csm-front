const TotalReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            if (state.initialList.length === 0) {
                return {...state, list: JSON.parse(JSON.stringify(action.list)), initialList: JSON.parse(JSON.stringify(action.list)), count: action.count};
            }else{
                return {...state, list: JSON.parse(JSON.stringify(action.list)), count: action.count};
            }
            
    }
}

export default TotalReducer;