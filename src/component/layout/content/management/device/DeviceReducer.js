

const DeviceReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            return {...state, list: JSON.parse(JSON.stringify(action.list)), count: action.count}
    }
}

export default DeviceReducer;