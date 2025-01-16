import { Log } from "../Log";
import AxiosInstance from "./AxiosInstance";

export const Axios = {
    async GET(url){
        url = url.replaceAll(" ","%20");
        Log.debug(`axios get: ${url}`);
        let data = {};
        const instance = AxiosInstance();
        await instance.get(url)
        .then(res => {
            Log.debug(res);
            data = res;
        }).catch(err => {
            Log.warn(err)
        });

        return data;
    }
}