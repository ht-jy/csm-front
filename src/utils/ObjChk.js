export const ObjChk = {
    null(obj){
        return obj === null ? true : false;
    }
    , undefined(obj){
        return obj === undefined ? true : false;
    }
    , all(obj){
        return obj === null || obj === undefined || obj == "" ? true : false;
    }
}