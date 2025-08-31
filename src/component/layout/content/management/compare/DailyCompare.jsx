import { useState, useEffect, useReducer, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dateUtil } from "../../../../../utils/DateUtil";
import { Axios } from "../../../../../utils/axios/Axios";
import { resultType } from "../../../../../utils/Enum";
import Select from 'react-select';
import DailyCompareReducer from "./DailyCompareReducer";
import useExcelUploader from "../../../../../utils/hooks/useExcelUploader";
import DateInput from "../../../../module/DateInput";
import Modal from "../../../../module/Modal";
import Loading from "../../../../module/Loading";
import Button from "../../../../module/Button";
import { companyDirName } from "../../../../../utils/CompanyDirName";
import Table from "../../../../module/Table";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import Search from "../../../../module/search/Search";
import { TableProvider } from "../../../../context/TableContext";
import { ObjChk } from "../../../../../utils/ObjChk";
import { Common } from "../../../../../utils/Common";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { DailyCompareRoles } from "../../../../../utils/rolesObject/dailyCompareRoles";

const DailyCompare = () => {
    const { project, user, setIsProject } = useAuth();
    const navigate = useNavigate();
    const tableRef = useRef();

    const { isRoleValid } = useUserRole();

    const [state, dispatch] = useReducer(DailyCompareReducer, {
        compareList: [],
        uploadList: [],
        tbmList: [],
        departList: [{ value: "NONE", label: "프로젝트를 선택하여 주세요." }],
        initDepartList: [{ value: "NONE", label: "프로젝트를 선택하여 주세요." }],
        tableProjectOptions: [],
    });

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, retrySearchText, setRetrySearchText, editList, setEditList } = useTableControlState(100);

    // 테이블 컬럼 정보
    const columns = [
        { itemName: "row_checked", checked: "N", checkType: "all", width: "35px", bodyAlign: "center", checkedState: ["W"], checkedItemName: "compare_state" },
        { isSearch: false, isOrder: false, width: "100px", header: "상태", itemName: "compare_state", bodyAlign: "center", isEllipsis: false, type: "daliy-compare"},
        { isSearch: false, isOrder: true, width: "80px", header: "이름", itemName: "user_nm", bodyAlign: "center", isEllipsis: true },
        { isSearch: false, isOrder: true, width: "120px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: true },
        { isSearch: false, isOrder: false, width: "100px", header: "번호", itemName: "user_id", bodyAlign: "center", isEllipsis: true, isFormat: true, format: "formatMobileNumber"},
        { isSearch: false, isOrder: false, width: "50px", header: "성별", itemName: "gender", bodyAlign: "center", isEllipsis: true },
        { isSearch: false, isOrder: false, width: "200px", header: "프로젝트", itemName: "jno", bodyAlign: "left", isEllipsis: true, type: "non-edit-select", condition: ["PROJECT", "compare_state", ["W"]] },
        { isSearch: false, isOrder: false, width: "50px", header: "TBM", itemName: "is_tbm", bodyAlign: "center", isEllipsis: false, isChecked: true },
        { isSearch: false, isOrder: false, width: "120px", header: "인식기명", itemName: "device_nm", bodyAlign: "center", isEllipsis: false},
        { isSearch: false, isOrder: false, width: "150px", header: "홍채인식기", itemName: "worker_in_time", bodyAlign: "center", isEllipsis: true, colSpan: 2},
        { isSearch: false, isOrder: false, width: "150px", header: "", itemName: "worker_out_time", bodyAlign: "center", isEllipsis: true, colSpan: 0 },        
        { isSearch: false, isOrder: false, width: "150px", header: "퇴직공제", itemName: "deduction_in_time", bodyAlign: "center", isEllipsis: true, colSpan: 2 },
        { isSearch: false, isOrder: false, width: "150px", header: "퇴직공제", itemName: "deduction_out_time", bodyAlign: "center", isEllipsis: true, colSpan: 0 },
    ];

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "USER_NM", label: "이름" },
        { value: "DEPARTMENT", label: "부서/조직명" },
    ];

    const [checkedList, setCheckedList] = useState([]);

    // 파일 div open/close
    const [isFileSection, setIsFileSection] = useState(true);
    // 로딩
    const [isLoading, setIsLoading] = useState(false);
    // 모달 (확인)
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");
    // 모달 (예, 아니오)
    const [isModal2, setIsModal2] = useState(false);
    const [modalText2, setModalText2] = useState("");
    const [fncConfirm, setFncConfirm] = useState(() => () => {});
    // 모달 (파일업로드 알림)
    const [isFileModal, setIsFileModal] = useState(false);
    const [fileModalText, setFileModalText] = useState("");
    const [fileFncConfirm, setFileFncConfirm] = useState(() => () => {});

    // 날짜
    const [searchStartDate, setSearchStartDate] = useState(dateUtil.now());

    // 반영 버튼
    const onClickRegister = () => {
        if(!isRoleValid(DailyCompareRoles.REGISTER) ){
            setModalText("담당자만 근로자를 반영할 수 있습니다.");
            setIsModal(true);
            return;
        }
        setModalText2("선택한 근로자를 반영하시겠습니까?");
        setFncConfirm(() => () => registeredWorkers());
        setIsModal2(true);
    }

    // 선택한 근로자 반영
    const registeredWorkers = async() => {
        setIsModal2(false);
        
        const jnos = []
        state.tableProjectOptions.forEach(option => {
            jnos.push(option["value"]);
        })

        try{
            if(ObjChk.ensureArray(checkedList).length === 0){
                setModalText("선택된 근로자가 없습니다.");
                setIsModal(true);
                return;
            }

            const params = [];
            const errs = [];
            checkedList.forEach(item => {
                const param = {
                    user_key: item.user_key,
                    sno: project.sno || 0,
                    jno: item.jno || 0,
                    user_id: item.user_id || "",
                    user_nm: item.user_nm || "",
                    department: item.department || "",
                    before_state: item.compare_state,
                    record_date: item.record_date,
                    after_state: "S",
                    reg_user: user.userName,
                    reg_uno: user.uno,
                }

                // 현장에 포함된 프로젝트인지 확인
                const check = jnos.find(jno => jno === item.jno);
                if (check) {
                    params.push(param);
                }else{
                    errs.push(param);
                }
            });
            
            
            // 프로젝트 미설정 근로자 존재 시 
            if (errs.length !== 0){

                let workers = "\n";
                errs.map((err, idx) => {
                    if (idx < 5){
                        workers += `${err.user_nm}\n`;
                    }else if (idx === 5){
                        workers += `...\n`;
                    }
                })

                setModalText(`프로젝트 미설정 근로자 ${workers}\n프로젝트 설정 후 다시 시도해주세요.\n`);
                setIsModal(true);
                return;
            }

            setIsLoading(true);
        
            const res = await Axios.PUT("/compare", params);
            
            if(res?.data?.result === resultType.SUCCESS){
                setModalText("근로자 반영에 성공하였습니다.");
                getData();
            }else{
                setModalText("근로자 반영에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
            }
        }catch{
            setModalText("근로자 반영에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
        }finally{
            setIsModal(true);
            setIsLoading(false);
        }
    }

    /***** excel file *****/

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
    const excelType = [
        // "WORK_LETTER", 
        "TBM", 
        "DEDUCTION", 
        // "REPORT",
    ];
    const excelLabel = [
        // "작업허가서", 
        "TBM", 
        "퇴직공제", 
        // "작업일보"
    ];
    const excelRefs = useRef({});

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

        const fileModalText = {
            "TBM": "엑셀에 작성된 회사명과 날짜가 아닌 선택한 회사명과 근무날짜로 저장이 됩니다.\n\n기존에 올린 파일이 있다면 삭제되며, 새롭게 올린 파일에 서명된 근로자만 비교 리스트에 적용이 됩니다.\n\n※오른쪽 상단에서 다운 받은 TBM 파일과 양식이 다르다면 정상적으로 적용이 안 될 수도 있습니다.",
            "DEDUCTION": "상단에 선택한 프로젝트가 속한 현장만 저장이 됩니다.\n현재 화면에서 선택한 근로날짜에 해당하는 데이터만 저장이 됩니다.\n\n전체근로자의 근로자 정보(현장, 이름, 업체명, 핸드폰번호, 생년월일)와 동일하여야 합니다. \n\n기존에 올린 파일이 있다면 삭제되며, 새롭게 올린 파일에 작성된 근로자만 비교 리스트에 적용이 됩니다.\n\n※공사관리시스템에 입력된 현장명, 소속업체와 동일하게 작성되지 않으면 동일 근로자로 등록이 안 될 수도 있습니다.\n\n※퇴직공제 사이트에서 받은 파일이 아니거나 오른쪽 상단에서 다운 받은 퇴직공제 양식과 다르다면 정상적으로 적용이 안 될 수도 있습니다."
        }

        if(!isRoleValid(DailyCompareRoles.TBM_UPLOAD)){
            setFileModalText("담당자만 파일을 업로드 할 수 있습니다.");
            setFileFncConfirm(() => () => setIsFileModal(false));
            setIsFileModal(true);
            return;
        }

        setFileModalText(fileModalText[type]);
        setFileFncConfirm(() => () => inputFileOpen(type));
        setIsFileModal(true);
        
    }
    const inputFileOpen = (type) => {
        setIsFileModal(false);
        if(excelRefs.current[type]){
            excelRefs.current[type].click();
        }
    }

    // 파일 리스트 선택 TBM|else
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
                work_date: searchStartDate, 
                sno: project.sno,
                jno: project.jno,
                department: "TBM" ? selectedDepart.label || "" : "",
                reg_user: user.userName,
                reg_uno: user.uno,
                add_dir: type === "TBM" ? selectedDepart.value || "" : "",
            });
            
            if(res?.result === resultType.SUCCESS){
                setModalText("업로드에 성공하였습니다.");
                await getData();
                await getUploadData();
                tbmSelectOnChange(selectedDepart);
                setIsModal(true);
            }else if(res?.result === resultType.EXCEL_FORMAT_ERROR){
                setModalText(res?.alert);
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
    }

    // upload excel download
    const uploadExcelDownload = async(type) => {
        let res = undefined;
        try {
            setIsLoading(true);
            res = await Axios.GET_BLOB(`/excel/export?file_type=${type}&work_date=${searchStartDate}&jno=${project.jno}`);
            
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

    // 양식 download
    const excelFormDownload = async(fileName) => {
        let res = undefined;
        try {
            setIsLoading(true);
            res = await Axios.GET_BLOB(`/excel/download?file_name=${fileName}`);
            
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
            const res = await Axios.GET(`/deadline?jno=${project.jno}&work_date=${searchStartDate}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                dispatch({type: "FILE_INIT", list: res?.data?.values});
            }
        } catch {
            
        } finally {
            setIsLoading(false);
        }
    }

    /***** axios getData *****/

    // 프로젝트 참여 회사명
    const getDepartData = async() => {
        setIsLoading(true);

        try{
            const res = await Axios.GET(`/worker/total/depart?jno=${project.jno}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                let options = [{value: "NONE", label: "회사를 선택해 주세요."}];
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

    // 근로자 비교 
    const getData = async() => {
        setIsLoading(true);
        try{
            const res = await Axios.GET(`/compare?sno=${project.sno}&jno=${project.jno}&start_date=${searchStartDate}&order=${order}&retry_search=${retrySearchText}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                dispatch({type: "COMPARE_INIT", list: res?.data?.values || []});
                setCheckedList([]);
            }
        } catch {
            
        } finally {
            setIsLoading(false);
        }
    }

    // 같은 현장 프로젝트 조회
    const getProjectData = async() => {
        setIsLoading(true);

        try{
            const res = await Axios.GET(`/project/project-by-site?sno=${project.sno}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                dispatch({type: "PROJECT_OPTION", list: res?.data?.values || []});
            }
        } catch {
            
        } finally {
            setIsLoading(false);
        }
    }

    const { 
        searchValues,
        activeSearch, setActiveSearch, 
        isSearchReset,
        isSearchInit,
        handleTableSearch,
        handleRetrySearch,
        handleSearchChange,
        handleSearchInit,
        handleSortChange,
        handlePageClick,
        handleEditList,
    } = useTableSearch({ columns, getDataFunction: getData, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, setEditList });

    /***** useEffect *****/
    useEffect(() => {
        getData();
        getUploadData();
        getDepartData();
        getProjectData();
        if(project === null){
            dispatch({type: "FILE_EMPTY"});
            dispatch({type: "DEPART_EMPTY"});
        }
    }, [project, searchStartDate]);

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
                title={"근로자 비교"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <Modal 
                isOpen={isModal2}
                title={"근로자 비교"}
                text={modalText2}
                confirm={"예"}
                fncConfirm={fncConfirm}
                cancel={"아니오"}
                fncCancel={() => setIsModal2(false)}
            />
            <Modal 
                isOpen={isFileModal}
                title={"근로자 비교"}
                text={fileModalText}
                confirm={"확인"}
                fncConfirm={fileFncConfirm}
                align="left"
            />
            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-4 content-title-box">
                    <li className="breadcrumb-item content-title">비교</li>
                    <li className="breadcrumb-item active content-title-sub">근로자</li>
                    <div className="table-header-right">
                        {isRoleValid(DailyCompareRoles.TBM_EXPORT) && <Button text={"TBM 양식"} onClick={() => excelFormDownload("TBM")}/>}
                        {isRoleValid(DailyCompareRoles.DEDUCTION_EXPORT) && <Button text={"퇴직공제 양식"} onClick={() => excelFormDownload("퇴직공제")}/>}
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
                                                        isFile(item) && isRoleValid(DailyCompareRoles.TBM_FILE_DOWNLOAD) && (
                                                            <button type="button" className="file-button1" onClick={() => uploadExcelDownload(item)}>다운로드</button>
                                                        )
                                                    }
                                                    {
                                                        isFile(item) && isRoleValid(DailyCompareRoles.TBM_FILE_DOWNLOAD) && (
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
                                                            zIndex: 100,
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
                        </div>
                    </div>
                </div>

                <div className="table-header" >
                    <div className="table-header-left">
                        <div>
                            <span style={{marginRight: "26px"}}>근로날짜</span>
                            <DateInput time={searchStartDate} setTime={(value) => setSearchStartDate(value)}></DateInput>
                        </div>
                        {
                            ObjChk.ensureArray(checkedList).length !== 0 && (
                                <Button text="반영" onClick={onClickRegister}/>
                            )
                        }
                    </div>
                    <div className="table-header-right">
                        {
                            isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit}  style={{marginRight: "2px"}}/> : null
                        }
                        <Search 
                            searchOptions={searchOptions}
                            width={"300px"}
                            fncSearchKeywords={handleRetrySearch}
                            retrySearchText={retrySearchText}
                        /> 
                    </div>
                </div>

                <div className="table-header">
                    <div className="table-header-right">
                        <div id="search-keyword-portal"></div>
                    </div>
                </div>

                <div className="table-wrapper">
                    <div className="table-container" id="table-container" style={{overflow: "auto", maxHeight: "calc(100vh - 350px)"}}>
                        <TableProvider setCheckedList={setCheckedList} nonEditSelect={{PROJECT: state.tableProjectOptions}}>
                            <Table 
                                ref={tableRef}
                                columns={columns} 
                                data={state.compareList} 
                                // searchValues={searchValues}
                                // onSearch={handleTableSearch} 
                                // onSearchChange={handleSearchChange} 
                                // activeSearch={activeSearch} 
                                // setActiveSearch={setActiveSearch} 
                                // resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                                isHeaderFixed={true}
                                // isEdit={isEdit}
                                // editInfo={editInfo}
                                // onChangeEditList={handleEditList}
                            />
                        </TableProvider>
                    </div>
                </div>

                <div className="pagination-wrapper">
                    <div className="pagination-info">
                        Rows: {Common.formatNumber(state.compareList.length)}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default DailyCompare;