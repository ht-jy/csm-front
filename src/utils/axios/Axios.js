import AxiosInstance from "./AxiosInstance";

let data = {};

export const Axios = {
    async GET(url){
        await AxiosInstance().get(url)
        .then(res => {
            data = res;
        }).catch(err => {
            // console.log("Axios GET error / url:", url, " err:", err);
        });

        return data;
    },
    async POST(url, param){
        await AxiosInstance().post(url, param)
        .then(res => {
            data = res;
        }).catch(err => {
            // console.log("Axios POST error / url:", url, " err:", err);
        });

        return data;
    },
    async PUT(url, param){
        await AxiosInstance().put(url, param)
        .then(res => {
            data = res;
        }).catch(err => {
            // console.log("Axios PUT error / url:", url, " err:", err);
        });

        return data;
    },
    async DELETE(url){
        await AxiosInstance().delete(url)
        .then(res => {
            data = res;
        }).catch(err => {
            // console.log("Axios DELETE error / url:", url, " err:", err);
        });

        return data;
    },
    async POST_BLOB(url, param){
        await AxiosInstance().post(url, param, {responseType: 'blob'})
        .then(response => {
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                // 실패로 JSON이 온 경우
                data = response;
            }else {
                // 정상 다운로드 처리
                const contentDisposition = response.headers['content-disposition'];
                let fileName = 'download.xlsx';

                const match = contentDisposition?.match(/filename\*?=UTF-8''([^;]+)/);
                if (match && match[1]) {
                    fileName = decodeURIComponent(match[1].replace(/['"]/g, '').trim());
                }

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                data = {data:{result:"Success"}};
            }
        }).catch(err => {
            // console.log("Axios POST error / url:", url, " err:", err);
        });

        return data;
    }
}