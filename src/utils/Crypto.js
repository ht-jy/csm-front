import CryptoJS from "crypto-js";

export const Crypto = {
    md5(user, pass){
        const text = `${user}_htenc_${pass}`;
        return CryptoJS.MD5(text).toString();
    }
}