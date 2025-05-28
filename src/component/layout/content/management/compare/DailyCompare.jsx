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

const DailyCompare = () => {
    const { project, user } = useAuth();
    const navigate = useNavigate();
    const tableRef = useRef();

    const [state, dispatch] = useReducer(DailyCompareReducer, {
        compareList: [],
        uploadList: [],
        tbmList: [],
        departList: [{ value: "NONE", label: "프로젝트를 선택하여 주세요." }],
        initDepartList: [{ value: "NONE", label: "프로젝트를 선택하여 주세요." }],
    });

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, retrySearchText, setRetrySearchText, editList, setEditList } = useTableControlState(100);

    // 테이블 컬럼 정보
    const columns = [
        { itemName: "row_checked", checked: "N", checkType: "all", width: "35px", bodyAlign: "center", checkedState: ["W"], checkedItemName: "compare_state" },
        { isSearch: false, isOrder: false, width: "100px", header: "상태", itemName: "compare_state", bodyAlign: "center", isEllipsis: false, type: "daliy-compare" },
        { isSearch: false, isOrder: true, width: "150px", header: "근로자 이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: true },
        { isSearch: false, isOrder: true, width: "150px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: true },
        { isSearch: false, isOrder: false, width: "250px", header: "홍채인식기", itemName: "worker_in_time", bodyAlign: "center", isEllipsis: true, colSpan: 2 },
        { isSearch: false, isOrder: false, width: "250px", header: "", itemName: "worker_out_time", bodyAlign: "center", isEllipsis: true, colSpan: 0 },
        { isSearch: false, isOrder: false, width: "150px", header: "TBM", itemName: "is_tbm", bodyAlign: "center", isEllipsis: false, isChecked: true },
        { isSearch: false, isOrder: false, width: "250px", header: "퇴직공제", itemName: "deduction_in_time", bodyAlign: "center", isEllipsis: true, colSpan: 2 },
        { isSearch: false, isOrder: false, width: "250px", header: "퇴직공제", itemName: "deduction_out_time", bodyAlign: "center", isEllipsis: true, colSpan: 0 },
    ];

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "USER_NM", label: "근로자 이름" },
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
    const [fncConfirm, setFncConfirm] = useState(() => {});

    // 날짜
    const [searchStartDate, setSearchStartDate] = useState(dateUtil.now());

    // 반영 버튼
    const onClickRegister = () => {
        setModalText2("선택한 근로자를 반영하시겠습니까?");
        setFncConfirm(() => () => registeredWorkers());
        setIsModal2(true);
    }

    // 선택한 근로자 반영
    const registeredWorkers = async() => {
        setIsModal2(false);
        
        if(ObjChk.ensureArray(checkedList).length === 0){
            setModalText("선택된 근로자가 없습니다.");
            setIsModal(true);
            return;
        }

        const params = [];
        checkedList.forEach(item => {
            const param = {
                jno: item.jno || 0,
                user_id: item.user_id || "",
                user_nm: item.user_nm || "",
                before_state: item.compare_state,
                record_date: item.record_date,
                after_state: "S",
                reg_user: user.userName,
                reg_uno: user.uno,
            }
            params.push(param);
        });

        setIsLoading(true);
        try{
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

    // excel download
    const excelDownload = async(type) => {
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

    // 일일 근로자 비교 
    const getData = async() => {
        setIsLoading(true);
        try{
            const res = await Axios.GET(`/compare?jno=${project.jno}&start_date=${searchStartDate}&order=${order}&retry_search=${retrySearchText}`);
            
            if(res?.data?.result === resultType.SUCCESS){
                dispatch({type: "COMPARE_INIT", list: res?.data?.values || []});
                setCheckedList([]);
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

    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal
                isOpen={isModal}
                title={"일일 근로자 비교"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <Modal 
                isOpen={isModal2}
                title={"일일 근로자 비교"}
                text={modalText2}
                confirm={"예"}
                fncConfirm={fncConfirm}
                cancel={"아니오"}
                fncCancel={() => setIsModal2(false)}
            />
            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-4 content-title-box">
                    <li className="breadcrumb-item content-title">일일 근로자 비교</li>
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
                    <div className="table-container" style={{overflow: "auto", maxHeight: "calc(100vh - 350px)"}}>
                        <TableProvider setCheckedList={setCheckedList}>
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
            </div>
        </div>
    );
}
export default DailyCompare;