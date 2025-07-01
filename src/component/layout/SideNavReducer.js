
import { ObjChk } from './../../utils/ObjChk';

const SideNavReducer = (state, action) => {
    switch(action.type) {
        case "INIT_MENU":
            return {...state, parentMenu: ObjChk.ensureArray(action.list.parent), childMenu: ObjChk.ensureArray(action.list.child)};
    }
}

export default SideNavReducer;