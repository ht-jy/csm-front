export const Storage = {
    setItem(key, value){
        localStorage.setItem(key, value);
    }
    , getItem(key){
        return localStorage.getItem(key);
    }
    , removeItem(key){
        localStorage.removeItem(key);
    }    
    , setSession(key, value){
        window.sessionStorage.setItem(key, value);
    }
    , getSession(key){
        return window.sessionStorage.getItem(key);
    }
    , removeSession(key){
        window.sessionStorage.removeItem(key);
    }
}