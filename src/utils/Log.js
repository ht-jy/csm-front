
export const Log = {
    // 개발
    debug(text){
        if(process.env.NODE_ENV == "development"){
            console.log(text);
        }
    }
    // 운영
    , info(text){
        if(process.env.NODE_ENV == "production"){
            console.log(text);
        }
    }
    // 항상
    , warn(text){
        console.log(text);
    }
}