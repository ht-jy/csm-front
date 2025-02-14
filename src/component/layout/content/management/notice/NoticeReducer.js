const NoticeReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            return {...state, notices : JSON.parse(JSON.stringify(action.notices)), count: action.count};
    }
}

export default NoticeReducer;