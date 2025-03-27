import { useState, useEffect, useReducer } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useAuth } from "../../../../context/AuthContext";
import Button from "../../../../module/Button";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import Table from "../../../../module/Table";
import TotalReducer from "./TotalReducer";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons ";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import Search from "../../../../module/search/Search";
import GridModal from "../../../../module/GridModal";
import useGridModalControlState from "../../../../../utils/hooks/useGridModalControlState";
import useGridModalSearch from "../../../../../utils/hooks/useGridModalSearch";
import "../../../../../assets/css/Calendar.css";
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Table.css";
import { Common } from "../../../../../utils/Common";

/**
 * @description: 전체 근로자 관리
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-17
 * @modified 최종 수정일: 2025-02-27
 * @modifiedBy 최종 수정자: 정지영
 * @usedComponents
 * - PaginationWithCustomButtons: 페이지 버튼
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Table: 테이블
 * - Button: 버튼
 * - DateInput: 날짜입력
 * - Search: 검색 컴포넌트
 * - GridModal: 상세 화면 모달
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /worker/total (전체근로자 조회), /site/nm (현장데이터 조회), /project/nm (프로젝트 조회), /code (코드조회)
 *    Http Method - POST : /worker/total (근로자 추가)
 *    Http Method - PUT : /worker/total (근로자 수정)
 */

const Total = () => {
    const [state, dispatch] = useReducer(TotalReducer, {
        list: [],
        count: 0,
        workerTypeCodes: [],
        initialList: [],
        selectList: [],
    });

    const { user } = useAuth();

    // 로딩
    const [isLoading, setIsLoading] = useState(false);
    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    // 상세모달
    const gridData = [
        { type: "select", span: "full", label: "현장", width: "110px", value: "", selectName: "siteNm", isKey: true },
        { type: "select", span: "full", label: "프로젝트", width: "110px", value: "", selectName: "projectNm", isKey: true },
        { type: "text", span: "double", label: "아이디", width: "110px", value: "", isKey: true },
        { type: "text", span: "double", label: "이름", width: "110px", value: "" },
        { type: "text", span: "double", label: "부서/조직명", width: "110px", value: "" },
        { type: "text", span: "double", label: "핸드폰 번호", width: "110px", value: "", format: "formatMobileNumber" },
        { type: "text-regidentMask", span: "double", label: "주민등록번호", width: "110px", value: "", format: "maskResidentNumber" },
        { type: "radio", span: "double", label: "근로자 구분", width: "110px", value: "", radioValues: state.workerTypeCodes.map(item => item.code)||[], radioLabels: state.workerTypeCodes.map(item => item.code_nm)||[] },
        { type: "checkbox", span: "double", label: "퇴직여부", width: "110px", value: "", checkedLabels: ["퇴직자", "재직자"], triggerHideId : "retire" },
        { type: "date", span: "double", label: "퇴직날짜", width: "110px", value: "", dependency: [true, "retire", "Y"] },
    ];
    const {isGridModal, setIsGridModal, gridMode, setGridMode, detail, setDetail, isMod, setIsMod} = useGridModalControlState();

    const columns = [
        { isSearch: false, isOrder: true, isSlide: true, width: "50px", header: "순번", itemName: "rnum", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "아이디", itemName: "user_id", bodyAlign: "center", isEllipsis: false, isDate: false, isFormat: true, format: "maskResidentNumber", valid: "isValidResidentNumber" },
        { isSearch: true, isOrder: true, isSlide: false, width: "150px", header: "근로자 이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "150px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "300px", header: "프로젝트명", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "150px", header: "핸드폰 번호", itemName: "phone", bodyAlign: "center", isEllipsis: false, isDate: false, isFormat: true, format: "formatMobileNumber", valid: "isValidMobileNumber" },
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "근로자구분", itemName: "worker_type_nm", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: true, isSlide: false, width: "100px", header: "퇴사 여부", itemName: "is_retire", bodyAlign: "center", isEllipsis: false, isDate: false, isChecked: true },
    ];

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, retrySearchText, setRetrySearchText, rnumOrder, setRnumOrder } = useTableControlState(100);
    

    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "JOB_NAME", label: "프로젝트명" },
        { value: "USER_NM", label: "근로자 이름" },
        { value: "DEPARTMENT", label: "부서/조직명" },
    ];

    // 테이블 row 클릭
    const onClickTableRow = (item, mode) => {
        
        const arr = [
            item.sno, 
            item.jno,
            item.user_id, 
            item.user_nm, 
            item.department, 
            item.phone, 
            item.reg_no,
            item.worker_type, 
            item.is_retire,
            dateUtil.format(item.retire_date)
        ];

        handleGridModalOn(mode, arr);
    }

    // GridModal의 저장 버튼 이벤트 - (저장, 수정)
    const onClicklModalSave = async (item, mode) => {
        
        setGridMode(mode)
        
        let retireDate = null;
        if (item[7].value !== 'Y'){
            retireDate = null;
        }else{
            retireDate = dateUtil.parseToGo(item[8].value);
        }
        
        const worker = {
            sno: item[0].value || 0,
            jno: item[1].value || 0,
            user_id: item[2].value || "",
            user_nm: item[3].value || "",
            department: item[4].value || "",
            phone: Common.formatMobileNumber(item[5].value) || "",
            reg_no: item[6].value || "",
            worker_type: item[7].value || "00",
            is_retire: item[8].value || "N",
            retire_date: retireDate,
            reg_user: user.userName || "",
            reg_uno: user.uno || 0,
            mod_user: user.userName || "",
            mod_uno: user.uno || 0,
        }
        console.log(worker);
        // return;
        setIsLoading(true);
        let res;
        if (gridMode === "SAVE") {
            res = await Axios.POST(`/worker/total`, worker);
        } else {
            res = await Axios.PUT(`/worker/total`, worker);
        }
        console.log(res);
        if (res?.data?.result === "Success") {
            setModalTitle(`근로자 ${getModeString()}`);
            setModalText(`근로자 ${getModeString()}에 성공하였습니다.`);
            setIsMod(true);
            getData();
        } else {
            setModalTitle(`근로자 ${getModeString()}`);
            setModalText(`근로자 ${getModeString()}에 실패하였습니다. \n잠시 후에  다시 시도하여 주시기 바랍니다.`);
            setIsMod(false);
        }

        setIsLoading(false);
        setIsGridModal(false);
        setIsModal(true);
    }

    // 현장 리스트 조회 - GridModal select 용도
    const getSiteData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/site/nm`);
        if (res?.data?.result === "Success") {
            dispatch({ type: "SITE_NM", list: res?.data?.values?.list });
        } else if (res?.data?.result === "Failure") {
            setIsModal(true);
            setModalTitle("현장명 조회");
            setModalText(`현장명을 조회하는데 실패하였습니다. \n잠시 후에  다시 시도하여 주시기 바랍니다.`);
            return false;
        }

        setIsLoading(false);
        return true;
    }

    // 프로젝트 리스트 조회 - GridModal select 용도
    const getProjectData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/project/nm`);
        if (res?.data?.result === "Success") {
            dispatch({ type: "PROJECT_NM", list: res?.data?.values?.list });
        } else if (res?.data?.result === "Failure") {
            setIsModal(true);
            setModalTitle("프로젝트명 조회");
            setModalText(`프로젝트명을 조회하는데 실패하였습니다. \n잠시 후에  다시 시도하여 주시기 바랍니다.`);
            return false;
        }

        setIsLoading(false);
        return true;
    }

    // 근로자 구분 코드로 변환
    const convertWorkerTypeToCode = (workerTypeNm) => {
        if (workerTypeNm === "" || state.workerTypeCodes.length === 0){
            return "";
        }

        const code = state?.workerTypeCodes?.find(item => item.code_nm?.includes(workerTypeNm));
        if (!code){
            return "99";
        }
        return code.code;
    }

    // 코드 조회
    const getCodeData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/code?p_code=WORKER_TYPE`);
        if (res?.data?.result === "Success") {
            dispatch({ type: "CODE", code: res?.data?.values?.list });
            return res?.data?.values?.list;
        } else if (res?.data?.result === "Failure") {
            return [];
        }

        setIsLoading(false);
        return true;
    }
    
    // 전체근로자 조회
    const getData = async () => {
        setIsLoading(true);

        const params = {
            page_num: pageNum,
            row_size: rowSize,
            order: order,
            rnum_order: rnumOrder,
            user_id: searchValues.user_id,
            user_nm: searchValues.user_nm,
            department: searchValues.department,
            phone: searchValues.phone,
            worker_type: convertWorkerTypeToCode(searchValues.worker_type_nm),
            retry_search: retrySearchText
          };
          
          const queryString = Object.entries(params)
            .filter(([key, value]) => value !== '' && value != null)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
          
          const res = await Axios.GET(`/worker/total?${queryString}`);

        // const res = await Axios.GET(`/worker/total?page_num=${pageNum}&row_size=${rowSize}&order=${order}&user_id=${searchValues.user_id}&user_nm=${searchValues.user_nm}&department=${searchValues.department}&phone=${searchValues.phone}&worker_type=${convertWorkerTypeToCode(searchValues.worker_type_nm)}&retry_search=${retrySearchText}`);
        
        if (res?.data?.result === "Success") {
            if(state.workerTypeCodes.length === 0) {
                const code = await getCodeData();
                dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count, code: code });
            }else{
                dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count, code: state.workerTypeCodes });
            }
            
        }

        setIsLoading(false);
    };

    // 테이블 조작
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
    } = useTableSearch({ columns, getDataFunction: getData, pageNum, retrySearchText, setRetrySearchText, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder });
    // 상세 모달 조작
    const {handleGridModalOn, handleModeSet, getModeString, handleExitBtnClick} = useGridModalSearch({gridData, getSelectOptionData:[getSiteData, getProjectData], setIsGridModal, gridMode, setGridMode, setDetail});

    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <GridModal
                isOpen={isGridModal}
                gridMode={gridMode}
                funcModeSet={handleModeSet}
                editBtn={true}
                removeBtn={false}
                title={`근로자 관리 ${getModeString()}`}
                exitBtnClick={handleExitBtnClick}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClicklModalSave}
            />
            <div>
                <div className="container-fluid px-4">
                    
                    <ol className="breadcrumb mb-2 content-title-box">
                        <li className="breadcrumb-item content-title">전체 근로자</li>
                        <li className="breadcrumb-item active content-title-sub">근로자 관리</li>
                        <div className="table-header-right">
                            <Button text={"추가"} onClick={() => handleGridModalOn("SAVE")} />
                        </div>
                    </ol>
                    
                    <div className="table-header">
                        <div className="table-header-left" style={{ gap: "10px" }}>
                            {/* <Select
                                onChange={onChangeSelect}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                            /> */}

                            {/* <div className="m-2">
                                조회기간 <DateInput time={searchStartTime} setTime={setSearchStartTime}></DateInput> ~ <DateInput time={searchEndTime} setTime={setSearchEndTime}></DateInput>
                            </div> */}
                        </div>

                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit} style={{marginRight: "2px"}}/> : null
                            }
                            <Search 
                                searchOptions={searchOptions}
                                width={"230px"}
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
                            <Table
                                columns={columns}
                                data={state.list}
                                searchValues={searchValues}
                                onSearch={handleTableSearch}
                                onSearchChange={handleSearchChange}
                                activeSearch={activeSearch}
                                setActiveSearch={setActiveSearch}
                                resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                                isHeaderFixed={true}
                                onClickRow={onClickTableRow}
                            />
                        </div>
                    </div>

                    <div>
                        <PaginationWithCustomButtons 
                            dataCount={state.count}
                            rowSize={rowSize}
                            fncClickPageNum={handlePageClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Total;