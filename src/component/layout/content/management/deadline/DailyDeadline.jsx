import { useState, useEffect, useReducer, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dateUtil } from "../../../../../utils/DateUtil";
import { Axios } from "../../../../../utils/axios/Axios";
import { resultType } from "../../../../../utils/Enum";
import Select from 'react-select';
import DailyDeadlineReducer from "./DailyDeadlineReducer";
import useExcelUploader from "../../../../../utils/hooks/useExcelUploader";
import DateInput from "../../../../module/DateInput";
import Modal from "../../../../module/Modal";
import Loading from "../../../../module/Loading";
import Button from "../../../../module/Button";
import { companyDirName } from "../../../../../utils/CompanyDirName";

const DailyDeadline = () => {
    const { project, user, setIsProject } = useAuth();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(DailyDeadlineReducer, {
        uploadList: [],
        tbmList: [],
        departList: [{ value: "NONE", label: "프로젝트를 선택하여 주세요." }],
        initDepartList: [{ value: "NONE", label: "프로젝트를 선택하여 주세요." }],
    });

    // 파일 div open/close
    const [isFileSection, setIsFileSection] = useState(true);
    // 로딩
    const [isLoading, setIsLoading] = useState(false);
    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");

    // 날짜
    const [searchDate, setSearchDate] = useState(dateUtil.now());

    // 엑셀 커스텀 훅
    const { handleSelectAndUpload } = useExcelUploader();

    // tbm 회사 선택
    const [selectedDepart, setSelectedDepart] = useState(state.departList[0]);

    // tbm 셀렉트 변경
    const tbmSelectOnChange = (e) => {
        if(e.value === ""){
            dispatch({type: "NOT_TBM_FILE"});
        }else {
            setSelectedDepart(e);
            dispatch({type: "SELECT_TBM_FILE", value: e.value});
        }
    }

    // file input struct
    const excelType = ["WORK_LETTER", "TBM", "DEDUCTION", "REPORT"];
    const excelLabel = ["작업허가서", "TBM", "퇴직공제", "작업일보"];
    const excelRefs = useRef({});;

    // file label click
    const fileLabelClick = (type) => {
        if(project === null){
            setModalText("프로젝트를 선택하여 주세요.");
            setIsModal(true);
            return;
        }

        if(type === "TBM" && selectedDepart.value === "NONE"){
            setModalText("회사를 선택하여 주세요.");
            setIsModal(true);
            return;
        }

        if(excelRefs.current[type]){
            excelRefs.current[type].click();
        }
        
    }

    // 파일 리스트 선택 TBM : else
    const selectUploadList = (type) => {
        if(type === "TBM"){
            return state.tbmList;
        }else{
            return state.uploadList;
        }
    }
    
    // 파일 존재 여부
    const isFile = (type) => {
        if(state.uploadList.length === 0) return false;

        const some = state.uploadList.some(item => item?.file_type === type)
        if(some){
            return true;
        }else{
            return false;
        }
    }

    // excel upload
    const excelUpload = async(e, type) => {
        let res = undefined;
        try {
            setIsLoading(true);
            res = await handleSelectAndUpload("/excel/import", e, {
                file_type: type,
                work_date: searchDate, 
                jno: project.jno,
                reg_user: user.userName,
                reg_uno: user.uno,
                add_dir: type === "TBM" ? selectedDepart.value || "" : "",
            });
            
            if(res?.result === resultType.SUCCESS){
                setModalText("업로드에 성공하였습니다.");
                setIsModal(true);
            }else if(res?.message.includes("failed to parse Excel file")){
                setModalText("엑셀 양식이 잘못되었습니다.\n확인 후 다시 업로드하여 주시기 바랍니다.");
                setIsModal(true);
            }else {
                setModalText("업로드에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
                setIsModal(true);
            }
        } catch (err) {
            setModalText("업로드에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
            setIsModal(true);
        } finally {
            setIsLoading(false);
        }

        if (res?.result === resultType.SUCCESS) {
            getUploadData();
        }
    }

    // excel download
    const excelDownload = async(type) => {
        let res = undefined;
        try {
            setIsLoading(true);
            res = await Axios.GET_BLOB(`/excel/export?file_type=${type}&work_date=${searchDate}&jno=${project.jno}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                
            }else if(res?.message.includes("failed to parse Excel file")){
                setModalText("다운로드에 실패하였습니다.\n잠시 후 다시 시도하거나 관리자에게 문의하여 주세요.");
                setIsModal(true);
            }
        } catch (err) {
            setModalText("다운로드에 실패하였습니다.\n잠시 후 다시 시도하거나 관리자에게 문의하여 주세요.");
            setIsModal(true);
        } finally {
            setIsLoading(false);
        }
    }

    // 업로드 파일 정보
    const getUploadData = async() => {
        if(project === null){
            setModalText("프로젝트를 선택하여 주세요.");
            setIsModal(true);
            return;
        }

        setIsLoading(true);

        try{
            const res = await Axios.GET(`/deadline?jno=${project.jno}&work_date=${searchDate}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                dispatch({type: "FILE_INIT", list: res?.data?.values});
            }
        } catch {
            
        } finally {
            setIsLoading(false);
        }
    }

    // 프로젝트 참여 회사명
    const getDepartData = async() => {
        setIsLoading(true);

        try{
            const res = await Axios.GET(`/worker/total/depart?jno=${project.jno}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                let options = [{value: "", label: "회사를 선택해 주세요."}];
                res?.data?.values?.forEach(item => {
                    options.push({value: companyDirName(item), label: item});
                });
                dispatch({type: "DEPARTMENT", options: options || [{value: "NONE", label: "참여중인 회사가 없습니다."}]});
            }
        } catch {
            
        } finally {
            setIsLoading(false);
        }
    }

    /***** useEffect *****/
    useEffect(() => {
        getUploadData();
        getDepartData();
        if(project === null){
            dispatch({type: "FILE_EMPTY"});
            dispatch({type: "DEPART_EMPTY"});
        }
    }, [project, searchDate]);

    // 회사 select 첫번째 선택
    useEffect(() => {
        if (state.departList.length > 0) {
            setSelectedDepart(state.departList[0]);
        }
    }, [state.departList]);

    // 상단의 project 표시 여부 설정: 표시
    useEffect(() => {
        setIsProject(true);
    }, [])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal
                isOpen={isModal}
                title={"일일 근로자 마감"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-4 content-title-box">
                    <li className="breadcrumb-item content-title">일일 근로자 마감</li>
                    <li className="breadcrumb-item active content-title-sub">관리</li>
                    <div className="table-header-right">
                        <Button text={isFileSection ? "파일 숨기기" : "파일 펼치기"} onClick={isFileSection ? () => setIsFileSection(false) : () => setIsFileSection(true)}/>
                    </div>
                </ol>

                <div className="table-header" >
                    <div className="table-header-left" style={{gap:"10px"}}>
                        <div className="file-section">
                            {
                                isFileSection && (
                                    excelType.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="file-upload">
                                                <span className="file-label-text">{excelLabel[idx]}</span>
                                                <label className="file-label">
                                                    <span className="file-name" onClick={isFile(item) ? null : () => fileLabelClick(item)}>
                                                    {
                                                        isFile(item) ?
                                                            state.uploadList.find(obj => obj.file_type === item).file_name
                                                        :
                                                            "파일을 선택하세요."
                                                    }
                                                    </span>
                                                    {
                                                        isFile(item) && (
                                                            <button type="button" className="file-button1" onClick={() => excelDownload(item)}>다운로드</button>
                                                        )
                                                    }
                                                    {
                                                        isFile(item) && (
                                                            <button type="button" className="file-button2" onClick={() => fileLabelClick(item)}>변경</button>
                                                        )
                                                    }
                                                </label>
                                                {
                                                item === "TBM" && (
                                                    <Select
                                                        onChange={(e) => tbmSelectOnChange(e)}
                                                        options={state.departList}
                                                        value={selectedDepart}
                                                        styles={{
                                                        container: (provided) => ({
                                                        ...provided,
                                                        width: "300px",
                                                        }),
                                                    }}
                                                    />
                                                )
                                            }
                                                <input ref={(e) => (excelRefs.current[item] = e)} type="file" id="fileInput" accept=".xlsx, .xls" onChange={(e) => excelUpload(e, item)} />
                                            </div>
                                            
                                        </div >
                                    ))
                                )
                            }
                            <div>
                                <span style={{marginRight: "26px"}}>근로날짜</span><DateInput time={searchDate} setTime={(value) => setSearchDate(value)}></DateInput>
                            </div>
                        </div>
                    </div>

                    <div className="table-header-right">
                        
                    </div>
                </div>

                <div className="table-wrapper">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{width: "100px"}}></th>
                                    <th style={{width: "100px"}}>이름</th>
                                    <th style={{width: "100px"}}>회사명</th>
                                    <th style={{width: "100px"}}>홍채 인식기</th>
                                    <th style={{width: "100px"}}>TBM</th>
                                    <th style={{width: "100px"}}>퇴직공제</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default DailyDeadline;