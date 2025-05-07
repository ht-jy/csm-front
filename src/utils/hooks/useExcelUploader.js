import { useState } from "react";
import { Axios } from "../axios/Axios";
import { resultType } from "../Enum";

/**
 * @description: 엑셀 업로드 커스텀 훅
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-05-07
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 */
const useExcelUploader = () => {
    const [selectFile, setSelectFile] = useState(null);

    // 엑셀 파일 선택
    const handleFileChange = (e) => {
        const files = e.target.files;

        if(files.length != 1){
            e.target.value = "";
            setSelectFile(null);

            return {
                result: resultType.FAILURE,
                alert: "하나의 파일만 선택할 수 있습니다."
            }
        }

        const file = files[0];
        const allowedExtensions = /(\.xlsx|\.xls)$/i;

        if(!allowedExtensions.exec(file.name)){
            e.target.value = "";
            setSelectFile(null);

            return {
                result: resultType.FAILURE,
                alert: "엑셀 파일만 업로드 가능합니다.(.xlsx, xls)"
            }
        }

        setSelectFile(file);
        return {
            result: resultType.SUCCESS,
            alert: `${file.name} 이 선택되었습니다.`
        }
    }

    // 파일 업로드
    const handleUpload = async(url) => {
        if(!selectFile){
            return {
                result: resultType.FAILURE,
                alert: "업로드할 파일을 선택하세요."
            }
        }

        const formData = new FormData();
        formData.append("file", selectFile);

        const res = await Axios.POST(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        if (res?.data?.result === resultType.SUCCESS) {
            return {
                result: resultType.SUCCESS,
                alert: `${selectFile.name} 업로드에 성공하였습니다.`
            }
        }else {
            return {
                result: resultType.FAILURE,
                alert: `${selectFile.name} 업로드에 실패하였습니다.\n잠시후에 다시 시도하여 주세요.`
            }
        }
    }

    // 엑셀 파일 선택 + 파일 업로드
    const handleSelectAndUpload = async(e, url) => {
        const files = e.target.files;

        if(files.length != 1){
            e.target.value = "";
            setSelectFile(null);

            return {
                result: resultType.FAILURE,
                alert: "하나의 파일만 선택할 수 있습니다."
            }
        }

        const file = files[0];
        const allowedExtensions = /(\.xlsx|\.xls)$/i;

        if(!allowedExtensions.exec(file.name)){
            e.target.value = "";
            setSelectFile(null);

            return {
                result: resultType.FAILURE,
                alert: "엑셀 파일만 업로드 가능합니다.(.xlsx, xls)"
            }
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await Axios.POST(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        if (res?.data?.result === resultType.SUCCESS) {
            return {
                result: resultType.SUCCESS,
                alert: "업로드에 성공하였습니다."
            }
        }else {
            e.target.value = "";
            setSelectFile(null);
            return {
                result: resultType.FAILURE,
                alert: "업로드에 실패하였습니다.\n잠시후에 다시 시도하여 주세요.",
                message: res?.data?.message
            }
        }
    }

    return { handleFileChange,handleUpload, handleSelectAndUpload, selectFile };
}

export default useExcelUploader;