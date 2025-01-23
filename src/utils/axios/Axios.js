import AxiosInstance from "./AxiosInstance";

let data = {};

export const Axios = {
    async GET(url){
        await AxiosInstance().get(url)
        .then(res => {
            data = res;
        }).catch(err => {
            console.log("Axios GET error / url:", url, " err:", err);
        });

        return data;
    },
    async POST(url, param){
        await AxiosInstance().post(url, param)
        .then(res => {
            data = res;
        }).catch(err => {
            console.log("Axios POST error / url:", url, " err:", err);
        });

        return data;
    },
    async PUT(url, param){
        await AxiosInstance().put(url, param)
        .then(res => {
            data = res;
        }).catch(err => {
            console.log("Axios PUT error / url:", url, " err:", err);
        });

        return data;
    },
    async DELETE(url){
        await AxiosInstance().delete(url)
        .then(res => {
            data = res;
        }).catch(err => {
            console.log("Axios DELETE error / url:", url, " err:", err);
        });

        return data;
    }
}