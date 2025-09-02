import { useState, useEffect, useReducer, useRef } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import { ObjChk } from "../../../../../utils/ObjChk";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SiteBaseContext from "../../../../context/SiteBaseContext";
import SiteBaseReducer from "./SiteBaseReducer";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import SelectModal from "../../../../module/SelectModal";
import Table from "../../../../module/Table";
import Button from "../../../../module/Button";
import DateInput from "../../../../module/DateInput";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons";
import Search from "../../../../module/search/Search";
import EditTable from "../../../../module/EditTable";
import SearchProjectModal from "../../../../module/modal/SearchProjectModal";
import dayjs from 'dayjs';
import "react-calendar/dist/Calendar.css";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Calendar.css";
import { TableProvider } from "../../../../context/TableContext";
import { resultType } from "../../../../../utils/Enum";
import { useLogParam } from "../../../../../utils/Log";
import useExcelUploader from "../../../../../utils/hooks/useExcelUploader";
import DigitFormattedInput from "../../../../module/DigitFormattedInput";
import SiteBaseHistory from "./SiteBaseHistory";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { workerRoles } from "../../../../../utils/rolesObject/workerRoles";

/**
 * @description: 현장 근로자 관리
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-18
 * @modified 최종 수정일: 2025-08-07
 * @modifiedBy 최종 수정자: 김진우
 * @modified description
 * 2025-07-10: 일괄공수입력 기능 추가
 * 2025-07-25: 현장근로자 데이터 변경시 사유 입력 및 히스토리, 사유 조회 추가
 * 2025-08-07: 협력업체가 로그인시 같은 업체의 근로자만 나오도록 필터링
 *              - 로그인할때 가져오는 협력업체명은 api에서 가져오는 것이기 때문에 홍채인식기에 등록된 것이랑 다를 수가 있어 안나올 수도 있음
 *              - 한쪽은 영어 다른쪽은 한글로 되어 있는 경우가 있어 영어스펠링을 한글발음으로 변환하여 비교
 *              - 근로자가 홍채인식기에 등록을 할 때 업체명만 쓰는게 아니라 "관리자|근로자" 구분해서 입력시 무조건!! 업체명이 먼저 나오고 한칸 띄고 써야함. ex) KMT 근로자 | KMT 관리자
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /worker/site-base (현장 근로자 조회), /code (코드 조회)
 *    Http Method - POST : /worker/site-base (현장 근로자 추가/수정), /worker/site-base/deadline (일괄마감)
 */
const SiteBase = () => {
    const [state, dispatch] = useReducer(SiteBaseReducer, {
        list: [],
        count: 0,
        initialList: [],
        siteNmList: [],
        workStateCodes: [],
        deadlineCode: [],
        projectSetting: {},
    })

    const navigate = useNavigate();
    const { user, project, setIsProject, loginCompany } = useAuth();
    const tableRef = useRef();
    const excelRefs = useRef({});
    const { isRoleValid } = useUserRole();

    // 엑셀 커스텀 훅
    const { handleSelectAndUpload } = useExcelUploader();
    const { createLogParam } = useLogParam();

    const [searchStartTime, setSearchStartTime] = useState(dateUtil.now());
    const [searchEndTime, setSearchEndTime] = useState(dateUtil.now());    

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, retrySearchText, setRetrySearchText, editList, setEditList } = useTableControlState(100);

    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    // 테이블 편집 모드 관련 state
    const [isEdit, setIsEdit] = useState(false);
    const [isEditTable, setIsEditTable] = useState(false);
    const [isEditTableOpen, setIsEditTableOpen] = useState(true);
    // 프로젝트 변경 관련 state
    const [isProjectModal, setIsProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState({});
    const [isModal2, setIsModal2] = useState(false);
    const [modalText2, setModalText2] = useState("");
    // 공수 입력 state
    const [isWorkHour, setIsWorkHour] = useState(false);
    const [workHour, setWorkHour] = useState(0);
    // 마감 알림 모달
    const [isDeadlineModal, setIsDeadlineModal] = useState(false);
    // 일괄마감 관련 state
    const [isDeadlineSelect, setIsDeadlineSelect] = useState(false);
    // 근로자 삭제 관련 state
    const [isDelWorker, setIsDelWorker] = useState(false);
    // 마감 취소 관련 state
    const [isDeadlineCancel, setIsDeadlineCancel] = useState(false);
    // 현장근로자 엑셀 업로드 모달
    const [isWorkerExcel, setIsWorkerExcel] = useState(false);
    const [workerExcelText, setWorkerExcelText] = useState("");
    const [fncWorkerExcelFile, setFncWorkerExcelFile] = useState(() => () => {});
    // 현장근로자 변경 이력
    const [isHistory, setIsHistory] = useState(false);
    // 변경 사유
    const [isReason, setIsReason] = useState(false);
    const [reasonTitle, setReasonTitle] = useState("");
    const [reasonText, setReasonText] = useState("");
    const [reasonConfirm, setReasonConfirm] = useState(() => {});
    const [reason, setReason] = useState("");
    // 엑셀업로드 성공 리스트
    const [isSuccessWorker, setIsSuccessWorker] = useState(false);
    const [successWorkers, setSuccessWorkers] = useState([]);

    // 테이블 컬럼 정보
    const columns = [
        { itemName: "row_checked", checked: "N", checkType: "all", width: "35px", bodyAlign: "center" },
        { isSearch: false, isOrder: true, width: "70px", header: "순번", itemName: "rnum", bodyAlign: "center", isEllipsis: false, type: "number"},
        { isSearch: true, isOrder: true, width: "160px", header: "아이디", itemName: "user_id", bodyAlign: "center", isEllipsis: false },
        { isSearch: true, isOrder: true, width: "150px", header: "이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: false },
        { isSearch: true, isOrder: true, width: "190px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: false },
        { isSearch: false, isOrder: true, width: "150px", header: "날짜", itemName: "record_date", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'format' },
        { isSearch: false, isOrder: true, width: "150px", header: "출근시간", itemName: "in_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'formatTime24' },
        { isSearch: false, isOrder: true, width: "150px", header: "퇴근시간", itemName: "out_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'formatTime24' },
        { isSearch: false, isOrder: true, width: "80px", header: "공수", itemName: "work_hour", bodyAlign: "center", isEllipsis: false },
        { isSearch: false, isOrder: true, width: "150px", header: "상태", itemName: "work_state", bodyAlign: "center", isEllipsis: false, isRadio: true, radioValues: state.workStateCodes.map(item => item.code), radioLabels: state.workStateCodes.map(item => item.code_nm), code: state.workStateCodes },
        { isSearch: false, isOrder: true, width: "80px", header: "철야", itemName: "is_overtime", bodyAlign: "center", isEllipsis: false, isChecked: true},
        { isSearch: false, isOrder: true, width: "80px", header: "마감여부", itemName: "is_deadline", bodyAlign: "center", isEllipsis: false, isChecked: true },
    ];

    // 업로드 성공 테이블 정보
    const workerSColumns = [
        { isSearch: false, isOrder: false, width: "50px", header: "이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: false },
        { isSearch: false, isOrder: false, width: "50px", header: "생년월일", itemName: "reg_no", bodyAlign: "left", isEllipsis: false },
        { isSearch: false, isOrder: false, width: "50px", header: "핸드폰번호", itemName: "phone", bodyAlign: "left", isEllipsis: false },
        { isSearch: false, isOrder: false, width: "50px", header: "근로날짜", itemName: "record_date", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'format' },
        { isSearch: false, isOrder: false, width: "100px", header: "비고", itemName: "fail_reason", bodyAlign: "left", isEllipsis: true },
    ];

    // 테이블 수정 정보
    const editInfo = [
        {itemName: "row_checked", editType: "", defaultValue: "N"},
        {itemName: "rnum", editType: "delete", defaultValue: 0},
        {itemName: "user_id", editType: "searchModal", selectedModal: "workerByUserId", defaultValue: ""},
        {itemName: "user_nm", editType: "", dependencyModal: "workerByUserId", defaultValue: ""},
        {itemName: "department", editType: "", dependencyModal: "workerByUserId", defaultValue: ""},
        {itemName: "record_date", editType: "", dependencyModal: "workerByUserId", defaultValue: ""},
        {itemName: "in_recog_time", editType: "time24", defaultValue: "2006-01-02T08:00:00+09:00"},
        {itemName: "out_recog_time", editType: "time24", defaultValue: "2006-01-02T17:00:00+09:00"},
        {itemName: "work_hour", editType: "number", format: "1.3", defaultValue: "1.0"},
        {itemName: "work_state", editType: "radio", radioValues: state.workStateCodes.map(item => item.code), radioLabels: state.workStateCodes.map(item => item.code_nm), defaultValue: "02"},
        {itemName: "is_overtime", editType: "check", defaultValue:"N"},
        {itemName: "is_deadline", editType: "check", defaultValue: "N"},
        {itemName: "user_key", editType: "", dependencyModal: "workerByUserId", defaultValue: ""},
    ];

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "USER_ID", label: "아이디" },
        { value: "USER_NM", label: "이름" },
        { value: "DEPARTMENT", label: "부서/조직명" },
    ];

    // 수정모드에서 추가생성한 데이터 bool
    const isEditModeAddData = (item) => {
        if(ObjChk.all(item.compare_state)) return false;

        // X: 현장근로자에서 추가한 데이터
        if(item.compare_state === "X"){
            return true;
        }
        return false;
    }

    // 테이블 수정상태로 변경
    const onClickEditBtn = () => {
        setIsEdit(true);
        if (tableRef.current) {
            tableRef.current.editTableMode("rnum");
        }
    }

    // 테이블 수정상태 취소
    const onClickEditCancelBtn = () => {
        setIsEdit(false);
        if (tableRef.current) {
            tableRef.current.editModeCancel();
        }
    }

    // 마감버튼 클릭
    const onClickDeadLineBtn = async() => {
        if(tableRef.current){
            const forwradRes = tableRef.current.getCheckedItemList();

            if(forwradRes.length === 0){
                setIsDeadlineSelect(true);
            }else{
                if(forwradRes.filter(item => item.is_deadline === 'Y').length !== 0){
                    setModalTitle("근로자 마감");
                    setModalText("마감 처리가 된 근로자가 있습니다.\n확인 후 다시 시도하여 주세요.");
                    setIsModal(true);
                    return;
                }
                setIsDeadlineModal(true);
            }
        }
    }

    // 마감사유
    const workerDeadlineReason = (type) => {
        setIsDeadlineSelect(false);
        setIsDeadlineModal(false);
        setReasonTitle("근로자 마감");
        setReasonText("근로자 마감 사유를 입력하여 주세요.");
        setReason("");
        setReasonConfirm(() => (reason) => workerDeadline(type, reason));
        setIsReason(true);
    }

    // 마감처리
    const workerDeadline = async(type, reason) => {
        setIsReason(false);
        if(tableRef.current){
            setModalTitle("근로자 마감");
            let forwradRes
            if(type === "ALL"){
                forwradRes = state.list.filter(item => item.is_deadline === 'N');
                setIsDeadlineSelect(false);
            }else if(type === "OUT"){
                forwradRes = state.list.filter(item => item.work_state === "02").filter(item => item.is_deadline === 'N');
                setIsDeadlineSelect(false);
            }else{
                forwradRes = tableRef.current.getCheckedItemList();
                setIsDeadlineModal(false);
            }

            const deadlines = [];
            forwradRes.map(item => {
                const record_date = dateUtil.isYYYYMMDD(item.record_date) ? item.record_date : dateUtil.format(item.record_date);
                const in_recog_time = item.in_recog_time === "0001-01-01T00:00:00Z" ? item.in_recog_time : dateUtil.goTime(record_date + "T" + item.in_recog_time?.split("T")[1]);
                const out_recog_time = item.out_recog_time === "0001-01-01T00:00:00Z" ? item.out_recog_time : dateUtil.goTime(record_date + "T" + item.out_recog_time?.split("T")[1]);
                const deadline = {
                    sno: item.sno,
                    jno: item.jno,
                    user_key: item.user_key,
                    user_id: item.user_id,
                    record_date: dateUtil.goTime(record_date),
                    in_recog_time: in_recog_time,
                    out_recog_time: out_recog_time,
                    work_hour: item.work_hour,
                    work_state: item.work_state,
                    is_overtime: item.is_overtime,
                    is_deadline: 'Y',
                    message: `[DEADLINE FINISH]`,
                    mod_uno: user.uno,
                    mod_user: user.userName,
                    reason: reason,
                    reason_type: "03",
                }
                deadlines.push(deadline);
            });

            setIsLoading(true);
            try {
                const res = await Axios.POST("worker/site-base/deadline", deadlines);
                
                if (res?.data?.result === "Success") {
                    setIsModal(true);
                    setModalText("근로자 마감에 성공하였습니다.");
                    await getData();
                }else {
                    setIsModal(true);
                    setModalText("근로자 마감에 실패하였습니다.");
                }
            } catch(err) {
                navigate("/error");
            } finally {
                setIsLoading(false);
            }
        }
    }

    // 공수입력 버튼 클릭
    // 체크한 근로자가 있는지 확인하고 후 공수 입력 모달 오픈
    // 실제 변경시도하는 로직은 다른 함수에 구현
    const onClickWorkHourBtn = () => {
        if(tableRef.current){
            setModalTitle("공수 입력");
            const forwradRes = tableRef.current.getCheckedItemList();
            
            if(forwradRes.length === 0){
                setModalText("공수를 입력할 근로자를 선택하세요.");
                setIsModal(true);
                return;
            }

            const deadlineArr = forwradRes.filter(item => item.is_deadline === "Y");
            if(deadlineArr.length > 0){
                setModalText("마감처리된 근로자는 공수를 입력 할 수 없습니다.\n선택한 근로자를 확인해주세요.");
                setIsModal(true);
                return;
            }
        }
        
        setWorkHour(0);
        setIsWorkHour(true);
    }

    const workHourSaveReason = () => {
        setReasonTitle("공수 입력");
        setReasonText("공수 입력 사유를 입력하여 주세요.");
        setReason("");
        setReasonConfirm(() => (reason) => workHourSave(reason));
        setIsReason(true);
        setIsWorkHour(false);
    }

    // 일괄공수처리
    const workHourSave = async(reason) => {
        if(tableRef.current){
            setIsReason(false);
            setModalTitle("공수입력");

            let forwradRes
            forwradRes = tableRef.current.getCheckedItemList();
            
            const workers = [];
            forwradRes.map(item => {
                const record_date = dateUtil.isYYYYMMDD(item.record_date) ? item.record_date : dateUtil.format(item.record_date);
                const in_recog_time = item.in_recog_time === "0001-01-01T00:00:00Z" ? item.in_recog_time : dateUtil.goTime(record_date + "T" + item.in_recog_time?.split("T")[1]);
                const out_recog_time = item.out_recog_time === "0001-01-01T00:00:00Z" ? item.out_recog_time : dateUtil.goTime(record_date + "T" + item.out_recog_time?.split("T")[1]);
                const before = state.list.find(obj => obj.sno === item.sno && obj.jno === item.jno && obj.user_id === item.user_id);
                const worker = {
                    sno: item.sno,
                    jno: item.jno,
                    user_key: item.user_key,
                    user_id: item.user_id,
                    record_date: dateUtil.goTime(record_date),
                    in_recog_time: in_recog_time,
                    out_recog_time: out_recog_time,
                    work_hour: workHour,
                    work_state: item.work_state,
                    is_overtime: item.is_overtime,
                    is_deadline: item.is_deadline,
                    message: `[WORK HOUR MOD]before: ${before.work_hour}, after: ${workHour}`,
                    mod_uno: user.uno,
                    mod_user: user.userName,
                    reason: reason,
                    reason_type: "04",
                }
                workers.push(worker);
            });

            const param = createLogParam({
                type: "MODIFY",
                menu: "site-base",
                items: workers, 
            });
            
            setIsLoading(true);
            try {
                const res = await Axios.POST("worker/site-base/work-hours", param);
                
                if (res?.data?.result === "Success") {
                    setModalText("공수 입력에 성공하였습니다.");
                    await getData();
                }else {
                    
                    setModalText("공수 입력에 실패하였습니다.");
                }
            } catch(err) {
                navigate("/error");
            } finally {
                setIsLoading(false);
                setIsModal(true);
            }
        }
    }

    // 프로젝트 변경
    // 체크한 근로자가 있는지 확인하고 변경할 프로젝트를 선택할 모달창 오픈.
    // 실제 변경시도하는 로직은 다른 함수에 구현
    const onClickModProjectBtn = () => {
        if(tableRef.current){
            setModalTitle("근로자 프로젝트 변경");
            const forwradRes = tableRef.current.getCheckedItemList();
            
            if(forwradRes.length === 0){
                setModalText("프로젝트를 변경할 근로자를 선택하세요.");
                setIsModal(true);
                return;
            }

            const deadlineArr = forwradRes.filter(item => item.is_deadline === "Y");
            if(deadlineArr.length > 0){
                setModalText("마감처리된 근로자는 프로젝트 이동을 할 수 없습니다.\n선택한 근로자를 확인해주세요.");
                setIsModal(true);
                return;
            }
        }
        
        setIsProjectModal(true);
    }

    // 프로젝트 모달의 row 클릭 이벤트
    const handleProjectRowClickReason = (item) => {

        setSelectedProject(item);
        setReasonTitle("프로젝트 변경");
        setReasonText("프로젝트 변경 사유를 입력하여 주세요.");
        setReason("");
        setReasonConfirm(() => (reason) => handleProjectModConfirm(reason));
        setIsReason(true);
    }

    // 프로젝트 변경 선택용 모달 "예" 클릭
    const handleProjectModConfirm = async(reason) => {
        setIsReason(false);
        setModalTitle("근로자 프로젝트 변경");

        if(tableRef.current){
            const forwradRes = tableRef.current.getCheckedItemList();
            const checkJno = forwradRes.filter(item => item.jno === selectedProject.jno);
            if ( ObjChk.undefined(selectedProject.jno) || ObjChk.null(selectedProject.jno) ) {
                setModalText("프로젝트를 다시 선택해 주세요.");
                setIsModal(true);
                return;
            }
            if(checkJno.length !== 0){
                setModalText("선택한 프로젝트와 근로자의 프로젝트가 동일합니다.");
                setIsModal(true);
                return;
            }
            
            const workers = [];
            forwradRes.map(item => {
                const record_date = dateUtil.isYYYYMMDD(item.record_date) ? item.record_date : dateUtil.format(item.record_date);
                const in_recog_time = item.in_recog_time === "0001-01-01T00:00:00Z" ? item.in_recog_time : dateUtil.goTime(record_date + "T" + item.in_recog_time?.split("T")[1]);
                const out_recog_time = item.out_recog_time === "0001-01-01T00:00:00Z" ? item.out_recog_time : dateUtil.goTime(record_date + "T" + item.out_recog_time?.split("T")[1]);
                const message = `[PROJECT MOVE]jno[before:${item.jno}, after:${selectedProject.jno}]`;

                const worker = {
                    sno: item.sno,
                    jno: item.jno,
                    after_jno: selectedProject.jno,
                    user_id: item.user_id,
                    user_key: item.user_key,
                    record_date: dateUtil.goTime(record_date),
                    in_recog_time: in_recog_time,
                    out_recog_time: out_recog_time,
                    work_hour: workHour,
                    work_state: item.work_state,
                    is_overtime: item.is_overtime,
                    is_deadline: item.is_deadline,
                    message: message,
                    mod_uno: user.uno,
                    mod_user: user.userName,
                    reason: reason,
                    reason_type: "05",
                }
                workers.push(worker);
            });
            
            setIsLoading(true);
            try {
                const res = await Axios.POST("worker/site-base/project", workers);
                
                if (res?.data?.result === "Success") {
                    setIsModal(true);
                    setModalText("프로젝트 변경에 성공하였습니다.");
                    await getData();
                }else {
                    setIsModal(true);
                    setModalText("프로젝트 변경에 실패하였습니다.\n해당 날짜 프로젝트에 등록되어 었는지 확인하시기 바랍니다.");
                }
            } catch(err) {
                navigate("/error");
            } finally {
                setIsLoading(false);
            }
        }
    }

    // 프로젝트 선택용 모달 "아니요" 클릭
    const handleProjectModCancel = () => {
        setIsModal2(false);
        setModalTitle("근로자 프로젝트 변경");
        setModalText("프로젝트 변경을 취소하였습니다.");
        setIsModal(true);
    }

    // 현장 근로자 삭제
    // 체크한 근로자가 있는지 확인하고 후 삭제 모달 오픈
    // 실제 변경시도하는 로직은 다른 함수에 구현
    const onClickDeleteWorkerBtn = () => {
        if(tableRef.current){
            setModalTitle("근로자 삭제");
            const forwradRes = tableRef.current.getCheckedItemList();
            
            if(forwradRes.length === 0){
                setModalText("삭제할 근로자를 선택하세요.");
                setIsModal(true);
                return;
            }

            const deadlineArr = forwradRes.filter(item => item.is_deadline === "Y");
            if(deadlineArr.length > 0){
                setModalText("마감처리된 근로자는 삭제를 할 수 없습니다.\n선택한 근로자를 확인해주세요.");
                setIsModal(true);
                return;
            }
        }
        
        setIsDelWorker(true);
    }

    const deleteWorkersReason = () => {
        setIsDelWorker(false);
        setReasonTitle("근로자 삭제");
        setReasonText("근로자 삭제 사유를 입력하여 주세요.");
        setReason("");
        setReasonConfirm(() => (reason) => deleteWorkers(reason));
        setIsReason(true);
    }

    // 현장 근로자 삭제 처리
    const deleteWorkers = async(reason) => {
        setIsReason(false);
        if(tableRef.current){
            const selectWorkers = tableRef.current.getCheckedItemList();
            
            const workers = [];
            selectWorkers.map(item => {
                const record_date = dateUtil.isYYYYMMDD(item.record_date) ? item.record_date : dateUtil.format(item.record_date);
                const in_recog_time = item.in_recog_time === "0001-01-01T00:00:00Z" ? item.in_recog_time : dateUtil.goTime(record_date + "T" + item.in_recog_time?.split("T")[1]);
                const out_recog_time = item.out_recog_time === "0001-01-01T00:00:00Z" ? item.out_recog_time : dateUtil.goTime(record_date + "T" + item.out_recog_time?.split("T")[1]);
                const deadline = {
                    sno: item.sno,
                    jno: item.jno,
                    user_key: item.user_key,
                    user_id: item.user_id,
                    record_date: dateUtil.goTime(record_date),
                    in_recog_time: in_recog_time,
                    out_recog_time: out_recog_time,
                    work_hour: item.work_hour,
                    work_state: item.work_state,
                    is_overtime: item.is_overtime,
                    is_deadline: item.is_deadline,
                    message: `[DELETE DATA]in_recog_time: ${item.in_recog_time}|out_recog_time: ${item.out_recog_time}|work_hour: ${item.work_hour}`,
                    mod_uno: user.uno,
                    mod_user: user.userName,
                    reason: reason,
                    reason_type: "06",
                }
                workers.push(deadline);
            });

            setIsLoading(true);
            try {
                const res = await Axios.POST("worker/site-base/delete", workers);
                
                if (res?.data?.result === "Success") {
                    setModalText("근로자 삭제에 성공하였습니다.");
                    await getData();
                }else {
                    setModalText("근로자 삭제에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
                }
            } catch(err) {
                navigate("/error");
            } finally {
                setIsLoading(false);
                setIsModal(true);
            }
        }
    }

    // 근로자 리스트의 마감일 유효성 검사
    // {'Y' | 'N' | 'C'} - 'Y': 유효, 'N': 유효하지 않음, 'C': 마감코드 없음
    const isDeadlineValid = (forwradRes) => {
        if (
            !state?.projectSetting?.cancel_code ||
            !Array.isArray(state.deadlineCode) ||
            !Array.isArray(forwradRes)
        ) {
            return 'C';
        }
        
        const cancelCode = state.projectSetting.cancel_code;
        const matchedDeadline = state.deadlineCode.find((d) => d.code === cancelCode);

        if (!matchedDeadline) {
            return 'C';
        }

        const codeNm = parseInt(matchedDeadline.code_nm.replace(/[^0-9]/g, ''), 10);
        if (isNaN(codeNm)) return 'C';

        const today = dayjs().startOf('day');

        for (const worker of forwradRes) {
            const recordDate = dayjs(worker.record_date);
            let deadlineDate;

            // `일`이 기준이 되면 일수를 +하여 검사하고
            // `월`이 기준이 되면 월을 +하고 말일로 하고 검사
            if (codeNm === 0) {
                deadlineDate = recordDate;
            // } else if (codeNm % 30 === 0) {
            //     // 30, 60, 90 ... , 30일 기준으로 월로 기준을 잡음
            //     // 30을 기준으로 1개월로 하여 날짜중 월을 +하고 그 달의 말일로 설정
            //     // ex) 30/2025-06-01 -> 2025-07-31, 90/2025-06-01 -> 2025-09-30
            //     const monthsToAdd = codeNm / 30;
            //     deadlineDate = recordDate.add(monthsToAdd, 'month').endOf('month');
            } else if (codeNm >= 30) {
                // 30~59 → 1, 60~89 → 2, ..., 30일 보다 클 경우 월로 기준을 잡음
                // 30을 기준으로 1개월 이상의 일 수이면 일 수는 반영하지 않고 월만 +하고 그 달의 말일로 설정
                // ex) 30/2025-06-01 -> 2025-07-31, 49/2025-06-01 -> 2025-07-31, 101/2025-06-01 -> 2025-09-30
                const monthsToAdd = Math.floor(codeNm / 30); 
                deadlineDate = recordDate.add(monthsToAdd, 'month').endOf('month');
            } else {
                deadlineDate = recordDate.add(codeNm, 'day');
            }

            if (deadlineDate.isBefore(today)) {
                return 'N';
            }
        }

        return 'Y';
    };

    // 현장 근로자 마감 취소
    // 체크한 근로자가 있는지 확인하고 후 취소 모달 오픈
    // 실제 변경시도하는 로직은 다른 함수에 구현
    const onClickDeadlineCancelBtn = () => {
        if(tableRef.current){
            setModalTitle("마감 취소");
            const forwradRes = tableRef.current.getCheckedItemList();
            
            if(forwradRes.length === 0){
                setModalText("마감 취소할 근로자를 선택하세요.");
                setIsModal(true);
                return;
            }

            const deadlineArr = forwradRes.filter(item => item.is_deadline === "N");
            if(deadlineArr.length > 0){
                setModalText("마감 상태가 아닌 근로자가 있습니다.\n선택한 근로자를 확인해주세요.");
                setIsModal(true);
                return;
            }

            const deadlineValid = isDeadlineValid(forwradRes);
            if(deadlineValid === "C"){
                setModalText("마감 코드에 해당하는 항목이 없습니다.\n프로젝트 설정에서 마감취소기간을 재설정이후 다시 시도하여 주세요.");
                setIsModal(true);
                return;
            }else if(deadlineValid === "N"){
                setModalText("마감 취소 가능 기간이 넘은 근로자가 있습니다.\n선택한 근로자를 확인해주세요.");
                setIsModal(true);
                return;
            }
        }
        
        setIsDeadlineCancel(true);
    }

    // 마감 취소 사유
    const deadlineCancelReason = () => {
        setIsDeadlineCancel(false);
        setIsModal(false);
        setReasonTitle("마감 취소");
        setReasonText("마감 취소 사유를 입력하여 주세요.");
        setReason("");
        setReasonConfirm(() => (reason) => deadlineCancel(reason));
        setIsReason(true);
    }

    // 마감 취소
    const deadlineCancel = async(reason) => {
        // 마감 취소 사유입력 사용 o
        setIsReason(false);
        // 마감 취소 사유입력 사용 x
        // setIsDeadlineCancel(false);

        if(tableRef.current){
            const selectWorkers = tableRef.current.getCheckedItemList();
            
            const workers = [];
            selectWorkers.map(item => {
                const record_date = dateUtil.isYYYYMMDD(item.record_date) ? item.record_date : dateUtil.format(item.record_date);
                const in_recog_time = item.in_recog_time === "0001-01-01T00:00:00Z" ? item.in_recog_time : dateUtil.goTime(record_date + "T" + item.in_recog_time?.split("T")[1]);
                const out_recog_time = item.out_recog_time === "0001-01-01T00:00:00Z" ? item.out_recog_time : dateUtil.goTime(record_date + "T" + item.out_recog_time?.split("T")[1]);
                const deadline = {
                    sno: item.sno,
                    jno: item.jno,
                    user_key: item.user_key,
                    user_id: item.user_id,
                    record_date: dateUtil.goTime(record_date),
                    in_recog_time: in_recog_time,
                    out_recog_time: out_recog_time,
                    work_hour: item.work_hour,
                    work_state: item.work_state,
                    is_overtime: item.is_overtime,
                    is_deadline: 'N',
                    message: `[DEADLINE CANCEL]`,
                    mod_uno: user.uno,
                    mod_user: user.userName,
                    reason: reason,
                    reason_type: "07",
                }
                workers.push(deadline);
            });

            setIsLoading(true);
            try {
                const res = await Axios.POST("worker/site-base/deadline-cancel", workers);
                
                if (res?.data?.result === "Success") {
                    setModalText("마감 취소에 성공하였습니다.");
                    await getData();
                }else {
                    setModalText("마감 취소에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
                }
            } catch(err) {
                navigate("/error");
            } finally {
                setIsLoading(false);
                setIsModal(true);
            }
        }
    }

    // 시작날짜 선택 이벤트
    const onChangeSearchStartTime = (value) => {
        if (value <= searchEndTime) {
            setSearchStartTime(value);
        }else{
            setSearchStartTime(value);
            setSearchEndTime(value);
        }
    }
    // 종료날짜 선택 이벤트
    const onChangeSearchEndTime = (value) => {
        if (value >= searchStartTime) {
            setSearchEndTime(value);
        }else{
            setSearchEndTime(value);
            setSearchStartTime(value);
        }
    }

    // 추가/수정 사유
    const onClickSaveReason = () => {
        setReasonTitle("근로자 추가/수정");
        setReasonText("근로자 추가/수정 사유를 입력하여 주세요.");
        setReason("");
        setReasonConfirm(() => (reason) => onClickSave(reason));
        setIsReason(true);
    }

    // 추가/수정 근로자 저장
    const onClickSave = async(reason) => {
        setIsReason(false);
        setModalText("근로자 추가/수정");

        // 유효성 검사   
        for(const item of editList){
            if(ObjChk.all(item.user_id)){   // 아이디
                setIsModal(true);
                setModalText("근로자를 선택하세요.");
                return;
            } else if(ObjChk.all(item.user_nm)){   // 이름

            } else if(ObjChk.all(item.department)){   // 부서

            } else if(!dateUtil.isDate(item.record_date)){   // 날짜
                setIsModal(true);
                setModalText("날짜를 입력하세요.");
                return;
            } else if(ObjChk.all(item.in_recog_time)){   // 출근시간
    
            } else if(ObjChk.all(item.out_recog_time)){   // 퇴근시간
    
            } else if(ObjChk.all(item.work_state)){
                setIsModal(true);
                setModalText("출퇴근 상태를 선택하세요.");
                return;
            } else if(item.is_deadline === "Y"){   // 마감여부
                if(ObjChk.all(item.in_recog_time)){
                    setIsModal(true);
                    setModalText("출근 시간을 입력하세요.");
                    return;
                }
                if(ObjChk.all(item.out_recog_time)){
                    setIsModal(true);
                    setModalText("출근 시간을 입력하세요.");
                    return;
                }
            }
        }

        // 데이터 저장/수정
        let params = [];
        editList.forEach(item => {
            const record_date = dateUtil.isYYYYMMDD(item.record_date) ? item.record_date : dateUtil.format(item.record_date);
            const in_recog_time = item.in_recog_time === "0001-01-01T00:00:00Z" ? item.in_recog_time : dateUtil.goTime(record_date + "T" + item.in_recog_time?.split("T")[1]);
            const out_recog_time = item.out_recog_time === "0001-01-01T00:00:00Z" ? item.out_recog_time : dateUtil.goTime(record_date + "T" + item.out_recog_time?.split("T")[1]);
            
            let reasonType = "";
            let message = [];
            if(item.rnum === "ADD_ROW"){
                reasonType = "01";
                message = `[ADD DATA]in_recog_time: ${item.in_recog_time}|out_recog_time: ${item.out_recog_time}|work_hour: ${item.work_hour}`;
            }else{
                const find = state.list.find(data => data.sno === item.sno && data.user_id === item.user_id);
                if(find !== undefined){
                    if(dateUtil.getTime(find.in_recog_time) !== dateUtil.getTime(item.in_recog_time)){
                        message.push(`in_recog_time[before:${find.in_recog_time}, after:${item.in_recog_time}]`);
                    }

                    if(dateUtil.getTime(find.out_recog_time) !== dateUtil.getTime(item.out_recog_time)){
                        message.push(`out_recog_time[before:${find.out_recog_time}, after:${item.out_recog_time}]`);
                    }

                    if(find.work_hour !== item.work_hour){
                        message.push(`work_hour[before:${find.work_hour}, after:${item.work_hour}]`);
                    }

                    if(find.work_state !== item.work_state){
                        message.push(`work_state[before:${find.work_state}, after:${item.work_state}]`);
                    }

                    if(find.is_overtime !== item.is_overtime){
                        message.push(`is_overtime[before:${find.is_overtime}, after:${item.is_overtime}]`);
                    }

                    if(find.is_deadline !== item.is_deadline){
                        message.push(`is_deadline[before:${find.is_deadline}, after:${item.is_deadline}]`);
                    }
                }
                message.join(" | ")
                message = find.is_deadline !== item.is_deadline ? "[UPDATE DATA | DEADLINE FINISH]" + message : "[UPDATE DATA]" + message;
                reasonType = find.is_deadline !== item.is_deadline ? "08" : "02";
            }

            const param = {
                sno: project.sno,
                jno: project.jno,
                user_key: item.user_key,
                user_id: item.user_id,
                user_nm: item.user_nm,
                reg_no: item.reg_no,
                record_date: dateUtil.goTime(record_date),
                in_recog_time: in_recog_time,
                out_recog_time: out_recog_time,
                is_deadline: item.is_deadline,
                is_overtime: item.is_overtime,
                work_state: item.work_state,
                work_hour: item.work_hour,
                reason: reason,
                reason_type: reasonType,
                message: message,
                mod_user: user.userName,
                mod_uno: user.uno,
            }
            params.push(param);
        });
        
        try {
            setIsLoading(true);
            const res = await Axios.POST("/worker/site-base", params);
            
            if (res?.data?.result === "Success") {
                setIsModal(true);
                setModalText("근로자 추가/수정에 성공하였습니다.");
                if(tableRef.current){
                    tableRef.current.editModeCancel();
                }
                setIsEdit(false);
                getData();
            }else {
                setIsModal(true);
                setModalText("근로자 추가/수정에 실패하였습니다.");
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 출퇴근상태 코드 조회
    const getWorkStateDate = async() => {
        setIsLoading(true);

        try {
            const res = await Axios.GET(`/code?p_code=WORK_STATE`);
            if (res?.data?.result === "Success") {
                dispatch({ type: "WORK_STATE_CODE", code: res?.data?.values?.list });
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 현장 근로자 조회
    const getData = async () => {
        if (project === null) {
            setIsModal(true);
            setModalTitle("근로자 조회");
            setModalText("프로젝트를 선택해주세요.");
            dispatch({type: "EMPTY"});
            return;
        }

        
        if (project.sno == null) return;
        setIsLoading(true);

        try {
            const res = await Axios.GET(`/worker/site-base?page_num=${pageNum}&row_size=${rowSize}&order=${order}&rnum_order=${rnumOrder}&search_start_time=${searchStartTime}&search_end_time=${searchEndTime}&jno=${project.jno}&user_id=${searchValues.user_id}&user_nm=${searchValues.user_nm}&department=${searchValues.department}&retry_search=${retrySearchText}`);
            if (res?.data?.result === "Success") {
                if(res?.data?.values?.list.length === 0) {
                    setIsModal(true);
                    setModalTitle("근로자 조회");
                    setModalText("조회된 현장 근로자 데이터가 없습니다.");
                }
                dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count, loginCompany: loginCompany });
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    };

    // 프로젝트 마감 유예기간 코드 불러오기
    const getProjectSettingCode = async() => {
        setIsLoading(true);

        try {
            const res = await Axios.GET(`/code?p_code=PROJECT_SETTING`);
            
            if (res?.data?.result === "Success") {
                dispatch({type: "DEADLINE_CANCEL_CODE", list: res?.data?.values?.list}) ;
            }
        } catch (err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 프로젝트 설정 조회
    const getProjectSetData = async() => {
        setIsLoading(true);
        
        try {
            if(ObjChk.all(project?.jno)) return;

            const res = await Axios.GET(`/project-setting/${project.jno}`)
            
            if(res?.data?.result === "Success"){
                dispatch({type:"PROJECT_SETTING", list: ObjChk.ensureArray(res?.data?.values?.project)});
            }
        } catch (err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 현장근로자 엑셀 양식 다운로드
    const getDailyWorkerFormExport = async() =>{
        let res = undefined;
        try {
            setIsLoading(true);
            res = await Axios.GET_BLOB(`/excel/daily-worker/form/export`);
            
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

    // 현장 근로자 엑셀 업로드
    const dailyWorkerExcelImport = () => {
        setWorkerExcelText("상단에 선택된 프로젝트로 적용이 됩니다.\n전체근로자에 등록된 정보(이름, 생년월일, 핸드폰번호)와 다를시 추가되지 않습니다.\n\n※양식 다운로드를 통해 작성된 엑셀 파일이 아닌 경우 업로드에 실패할 수도 있습니다.");
        setFncWorkerExcelFile(() => () => dailyWorkerExcelImportReason());
        // setFncWorkerExcelFile(() => () => inputFileOpen());
        setIsWorkerExcel(true);
    }

    // 업로드 사유
    const dailyWorkerExcelImportReason = () => {
        setReasonTitle("근로자 엑셀 업로드");
        setReasonText("근로자 엑셀 업로드 사유를 입력하여 주세요.");
        setReason("");
        setReasonConfirm(() => () => inputFileOpen());
        setIsReason(true);
        setIsWorkerExcel(false);
    }

    // 파일 선택 오픈
    const inputFileOpen = () => {
        setIsReason(false);
        if(excelRefs.current){
            excelRefs.current.click();
        }
    }

    // excel upload
    const excelUpload = async(e) => {
        let res = undefined;
        try {
            setIsLoading(true);
            res = await handleSelectAndUpload("/excel/import", e, {
                file_type: "ADD_DAILY_WORKER",
                work_date: dateUtil.format(Date.now()), 
                sno: project.sno,
                jno: project.jno,
                reg_user: user.userName,
                reg_uno: user.uno,
                reason: reason,
                reason_type: "09",
            });
            
            if(res?.result === resultType.SUCCESS){
                setModalText("업로드에 성공하였습니다.");
                const resData = (res?.values ?? []).map(item => {
                    if(!ObjChk.all(item.fail_reason)){
                        return {...item, backgroundColor: "#ffaea0"};
                    }
                    return item;
                });
                setSuccessWorkers(resData);
                setIsSuccessWorker(true);
            }else if(res?.result === resultType.EXCEL_FORMAT_ERROR){
                setModalText(res?.message || "엑셀 양식이 잘 못 되었습니다.");
                setIsModal(true);
            }else {
                setModalText(res?.message || "업로드에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
                setIsModal(true);
            }
        } catch (err) {
            setModalText("업로드에 실패하였습니다.\n잠시후에 다시 시도하거나 관리자에게 문의하여 주세요.");
            setIsModal(true);
        } finally {
            setIsLoading(false);
        }
    }

    // 현장근로자 엑셀 업로드 테이블 모달 확인
    const onClickWorkerModalConfirm = () => {
        setIsSuccessWorker(false);
        getData();        
    }

    // 근태정보 다운로드
    const onClickRecordData = () => {
        getRecordData();
    }

    // 근태정보 조회
    const getRecordData = async() => {
        setIsLoading(true);
        
        try {
            const res = await Axios.GET(`/worker/site-base/record?jno=${project.jno}&start_date=${searchStartTime}&end_date=${searchEndTime}`);
            
            if(res?.data?.result === "Success"){
                const groupMap = {};
                ObjChk.ensureArray(res?.data?.values).forEach(item => {
                    const key = `${item.job_name}|${item.user_nm}|${item.department}|${item.phone}`;

                    if (!groupMap[key]) {
                        groupMap[key] = {
                            job_name: item.job_name,
                            user_nm: item.user_nm,
                            department: item.department,
                            phone: item.phone,
                            sum_work_hour: 0,
                            sum_work_date: 0,
                            worker_time_excel: [],
                            __work_date_set: new Set()
                        };
                    }

                    if (item.work_hour != null) {
                        groupMap[key].sum_work_hour += item.work_hour;
                    }

                    const dateKey = item.record_date?.slice(0, 10);
                    if (dateKey && !groupMap[key].__work_date_set.has(dateKey)) {
                        groupMap[key].__work_date_set.add(dateKey);
                        groupMap[key].sum_work_date += 1;
                    }

                    groupMap[key].worker_time_excel.push({
                        record_date: item.record_date?.slice(0, 10),                      // '2025-07-02'
                        in_recog_time: item.in_recog_time?.slice(11, 16),                 // '08:00'
                        out_recog_time: item.out_recog_time?.slice(11, 16),               // '17:00'
                        work_hour: item.work_hour,
                        is_deadline: item.is_deadline,
                    });
                });

                const groupedWorkers = Object.values(groupMap).map(worker => {
                    delete worker.__work_date_set;
                    return worker;
                });

                const recordData = {
                    start_date: searchStartTime,
                    end_date: searchEndTime,
                    worker_excel: groupedWorkers
                };

                dailyWorkerRecordExport(recordData);
            }
        } catch (err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 근로자 근태기록 export
    const dailyWorkerRecordExport = async(param) => {
        let res = undefined;
        try {
            setIsLoading(true);
            res = await Axios.POST_BLOB(`/excel/daily-worker/record/export`, param);
            
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
        getWorkStateDate();
        getProjectSettingCode();
    }, []);

    // 상단 프로젝트 변경
    useEffect(() => {
        setIsEdit(false);
        getData();
        if(tableRef.current){
            tableRef.current.initEditList();
        }
        setEditList([]);
        getProjectSetData();
    }, [project, searchStartTime, searchEndTime]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시: 끝나는 날짜를 변경한 경우 (시작 날짜를 끝나는 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchStartTime(searchEndTime)
        }
    }, [searchEndTime]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시: 시작 날짜를 변경한 경우 (끝나는 날짜를 시작 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchEndTime(searchStartTime)
        }
    }, [searchStartTime]);

    useEffect(() => {
        if(editList.length > 0){
            setIsEditTable(true);
        }else{
            setIsEditTable(false);
        }
    }, [editList]);

    // 상단의 project 표시 여부 설정: 표시
    useEffect(() => {
        setIsProject(true);
    }, []);

    return(
        <div>
            <Loading isOpen={isLoading} />
            <Modal 
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
                isConfirmFocus = {true}
            />
            <SelectModal
                isOpen={isDeadlineSelect}
                title={"마감"}
                text={"마감유형을 선택하세요."}
                first={"전체 마감"}
                fncFirst={() => workerDeadlineReason("ALL")}
                second={"퇴근자 마감"}
                fncSecond={() => workerDeadlineReason("OUT")}
                cancel={"취소"}
                fncCancel={() => setIsDeadlineSelect(false)}
            />
            <Modal
                isOpen={isDeadlineModal}
                title={"마감"}
                text={"마감처리를 하시겠습니까?"}
                confirm={"예"}
                fncConfirm={workerDeadlineReason}
                cancel={"아니요"}
                fncCancel={() => setIsDeadlineModal(false)}
            />
            <Modal 
                isOpen={isModal2}
                title={"근로자 프로젝트 변경"}
                text={modalText2}
                confirm={"예"}
                fncConfirm={handleProjectModConfirm}
                cancel={"아니요"}
                fncCancel={handleProjectModCancel}
            />
            <Modal
                isOpen={isWorkHour}
                title={"공수 입력"}
                content={
                    <div className="d-flex flex-column align-items-center gap-2 mb-3">
                        <div>※ 공수 입력 후 마감처리를 하지 않으면 자정 이후에</div>
                        <div> 프로젝트 설정에 따라 입력한 공수가 변경될 수 있습니다.</div>

                        <div className="d-flex align-items-center gap-1 fw-bold">
                            {"저장할 공수 "}
                            <DigitFormattedInput
                                initNum={workHour}
                                setNum={(num) => setWorkHour(num)}
                                format="1.3"
                                step={0.1}
                                style={{width: "5rem", marginLeft:"1rem"}}
                            />
                        </div>
                    </div>
                }
                confirm={"확인"}
                fncConfirm={() => workHourSaveReason()}
                cancel={"취소"}
                fncCancel={() => setIsWorkHour(false)}
            />
            <Modal
                isOpen={isDelWorker}
                title={"근로자 삭제"}
                text={"선택한 근로자를 삭제 하시겠습니까?\n삭제한 기록은 복구하실 수 없습니다."}
                confirm={"예"}
                fncConfirm={deleteWorkersReason}
                cancel={"아니요"}
                fncCancel={() => setIsDelWorker(false)}
            />
            <Modal
                isOpen={isDeadlineCancel}
                title={"마감취소"}
                text={"선택한 근로자를 마감취소 하시겠습니까?"}
                confirm={"예"}
                // 마감 취소 사유입력 사용 o
                fncConfirm={deadlineCancelReason}
                // 마감 취소 사유입력 사용 x
                // fncConfirm={deadlineCancel}
                cancel={"아니요"}
                fncCancel={() => setIsDeadlineCancel(false)}
            />
            <Modal
                isOpen={isWorkerExcel}
                title={"근로자 엑셀 업로드"}
                text={workerExcelText}
                confirm={"확인"}
                fncConfirm={() => fncWorkerExcelFile()}
                align="left"
                isConfirmFocus = {true}
            />
            <SearchProjectModal
                isOpen={isProjectModal}
                fncExit={() => setIsProjectModal(false)}
                isUsedProject={true}
                includeJno={project?.jno}
                onClickRow={handleProjectRowClickReason}
            />
            <SiteBaseHistory
                isOpen={isHistory}
                fncExit={() => setIsHistory(false)}
                startDate={searchStartTime}
                endDate={searchEndTime}
                checkList={tableRef?.current?.getCheckedItemList() || []}
            />
            <Modal
                isOpen={isReason}
                title={reasonTitle}
                text={reasonText}
                content={
                    <div className="form-control text-none-border" style={{padding: 0, marginBottom: "5px"}}>
                        <div style={{ width: "100%" }}>
                            <div className="form-textbox">
                                <textarea
                                    rows={4}
                                    value={(reason !== null ? reason.replace(/\\n/g, "\n") : "")}
                                    name={"etc"}
                                    onChange={(e) => {
                                        // 실제 개행문자 '\n'을 '\\n'으로 치환하여 상태에 저장
                                        setReason(e.target.value);
                                    }}
                                    placeholder="0 / 4000"
                                />
                            </div>
                        </div>
                    </div>
                }
                confirm={"확인"}
                fncConfirm={() => {reasonConfirm(reason)}}
                cancel={"취소"}
                fncCancel={() => setIsReason(false)}
            />
            <Modal
                isOpen={isSuccessWorker}
                title={"근로자 엑셀 업로드"}
                content={
                    <div className="table-wrapper" style={{marginBottom: "10px"}}>
                        <div className="table-container" id="table-container" style={{overflow: "auto", maxHeight: "calc(100vh - 350px)"}}>
                            <Table
                                columns={workerSColumns} 
                                data={successWorkers}
                                noDataText={"추가에 성공한 근로자가 없습니다."}
                                styles={{minWidth: "400px"}}
                                isHeaderFixed={true}
                            />
                        </div>
                    </div>
                }
                confirm={"확인"}
                fncConfirm={onClickWorkerModalConfirm}
                width="1000px"
                isConfirmFocus = {true}
            />
            <div>
                <div className="container-fluid px-4">
                    <ol className="breadcrumb mb-2 content-title-box">
                        <li className="breadcrumb-item content-title">현장</li>
                        <li className="breadcrumb-item active content-title-sub">근로자</li>
                        <div className="table-header-right">
                            {
                                isEditTable ?
                                    isEditTableOpen ?
                                        <Button text={"수정 숨김"} onClick={() => setIsEditTableOpen(false)} />
                                    :   <Button text={"수정 확인"} onClick={() => setIsEditTableOpen(true)} />
                                : null
                            }
                            {
                                isEditTable ?
                                    <Button text={"저장"} onClick={onClickSaveReason} />
                                : null
                            }
                            {
                                isEdit ? 
                                    <>
                                        <Button text={"취소"} onClick={onClickEditCancelBtn} />
                                        {/* <Button text={"추가"} onClick={onClickEditAddBtn} /> */}
                                    </>
                                // :   state.list.length > 0 ?
                                :   project !== null ?
                                        <>
                                           { isRoleValid(workerRoles.SITE_WORKER_HISTORY) && <Button text={"변경이력"} onClick={() => setIsHistory(true)} /> }
                                           { isRoleValid(workerRoles.SITE_WORKER_RECORD_INFO_DOWNLOAD) && <Button text={"근태 다운로드"} onClick={onClickRecordData} />}
                                           { isRoleValid(workerRoles.SITE_WORKER_EXCEL_UPLOAD) && <Button text={"근태 업로드"} onClick={dailyWorkerExcelImport} /> }
                                           { isRoleValid(workerRoles.SITE_WORKER_FORM_DOWNLOAD) && <Button text={"양식 다운로드"} onClick={getDailyWorkerFormExport} /> }
                                           { isRoleValid(workerRoles.SITE_WORKER_MOD) && <Button text={"수정"} onClick={onClickEditBtn} /> }
                                            <input ref={(e) => (excelRefs.current = e)} type="file" id="fileInput" accept=".xlsx, .xls" onChange={(e) => excelUpload(e)} style={{display: "none"}}/>                              
                                        </>
                                    :   null
                            }
                        </div>
                    </ol>
                    
                    {
                        isEditTableOpen && isEdit && editList.length !== 0 ?
                            <div className="table-wrapper" style={{marginBottom: "5px"}}>
                                <div className="table-container" style={{overflow: "auto", maxHeight: "calc(100vh - 350px)"}}>
                                    <EditTable
                                        isOpen={isEditTable}
                                        columns={columns}
                                        data={editList}
                                    />
                                </div>
                            </div>
                        :   null
                    }

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>

                            <div>
                                조회일 <DateInput time={searchStartTime} setTime={(value) => onChangeSearchStartTime(value)}></DateInput> ~ <DateInput time={searchEndTime} setTime={(value) => onChangeSearchEndTime(value)}></DateInput>
                                {
                                    !isEdit && state.list.length > 0 ?
                                        <>
                                            { isRoleValid(workerRoles.SITE_WORKER_BATCH_DEADLINE) && <Button text={"마감"} onClick={onClickDeadLineBtn} /> }
                                            { isRoleValid(workerRoles.SITE_WORKER_BATCH_WORK_HOUR) && <Button text={"공수입력"} onClick={onClickWorkHourBtn} /> }
                                            { isRoleValid(workerRoles.SITE_WORKER_TRANS_PROJECT) && <Button text={"프로젝트 변경"} onClick={onClickModProjectBtn} /> }
                                            { isRoleValid(workerRoles.SITE_WORKER_DEL) && <Button text={"근로자 삭제"} onClick={onClickDeleteWorkerBtn} /> }
                                            { isRoleValid(workerRoles.SITE_WORKER_CANCEL_DEADLINE) && <Button text={"마감취소"} onClick={onClickDeadlineCancelBtn} /> }
                                        </>
                                    : null
                                }
                            </div>
                        
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
                            <SiteBaseContext.Provider value={{editList}}>
                                <TableProvider searchTime={searchStartTime} funcIsEditModeAddData={isEditModeAddData}>
                                    <Table 
                                        ref={tableRef}
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
                                        isEdit={isEdit}
                                        editInfo={editInfo}
                                        onChangeEditList={handleEditList}
                                    />
                                </TableProvider>
                            </SiteBaseContext.Provider>
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

export default SiteBase;