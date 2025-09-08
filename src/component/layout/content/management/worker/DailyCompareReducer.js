import { dateUtil } from "../../../../../utils/DateUtil";
import { ObjChk } from "../../../../../utils/ObjChk";

const DailyCompareReducer = (state, action) => {
    switch(action.type){
        case "COMPARE_INIT":
            const compareList = ObjChk.ensureArray(action.list);
            
            const newcompareList = compareList.map((item, idx) => {
                return {
                    ...item, 
                    worker_in_time: dateUtil.formatTimeHHMM(item.worker_in_time),
                    worker_out_time: dateUtil.formatTimeHHMM(item.worker_out_time),
                    deduction_in_time:dateUtil.formatTimeHHMM(item.deduction_in_time),
                    deduction_out_time: dateUtil.formatTimeHHMM(item.deduction_out_time),
                    index: idx,
                };
            });

            return {...state, compareList: structuredClone(newcompareList)};

        case "FILE_INIT":
            let uploadList = [];
            let tbmList = [];
            ObjChk.ensureArray(action.list).find(item => {
                if(item.file_type === "TBM"){
                    tbmList.push(item);
                }else{
                    uploadList.push(item);
                }
            });

            return {...state, uploadList: structuredClone(uploadList), tbmList: structuredClone(tbmList)};

        case "FILE_EMPTY":
            return {...state, uploadList: [], tbmList: []};

        case "DEPARTMENT":
            return {...state, departList: structuredClone(action.options)};

        case "DEPART_EMPTY":
            return {...state, departList: structuredClone([...state.initDepartList])};

        case "NOT_TBM_FILE":
            const nonTbmFileList = state.uploadList.filter(item => item.file_type !== "TBM");
            return {...state, uploadList: structuredClone(nonTbmFileList)};

        case "SELECT_TBM_FILE":
            const findTbmFile = state.tbmList.find(item => item.file_path.includes(action.value));
            const notTbmFileList = state.uploadList.filter(item => item.file_type !== "TBM");
            let newUploadFile = [];
            if(findTbmFile === undefined){
                newUploadFile = [...notTbmFileList];
            }else{
                newUploadFile = [...notTbmFileList, findTbmFile];
            }
            return {...state, uploadList: structuredClone(newUploadFile)}
        
        case "PROJECT_OPTION":
            const projectOptions = [];
            ObjChk.ensureArray(action.list).forEach(item => {
                projectOptions.push(
                    {value: item.jno, label: item.project_nm},
                );
            });
            
            return {...state, tableProjectOptions: structuredClone(projectOptions)};

        default:
            return state;
    }
}

export default DailyCompareReducer;