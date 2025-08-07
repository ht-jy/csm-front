import { useEffect, useReducer, useState } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dateUtil } from "../../../../../utils/DateUtil";
import Modal from "../../../../module/Modal";
import NoticeReducer from "./NoticeReducer";
import Loading from "../../../../module/Loading";
import NoticeModal from "./NoticeModal";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { noticeRoles } from "../../../../../utils/rolesObject/noticeRoles";


/**
 * @description: 
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-07
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project/my-job_name/{uno} (프로젝트데이터 조회)
 *    Http Method - POST : /notice (공지사항 추가)
 *    Http Method - PUT : /notice (공지사항 수정)
 *    Http Method - DELETE :  /notice/${idx} (공지사항 삭제)
 */
const NoticeDetail = ( {notice, isDetail, setIsDetail, getData} ) => {
    const [state, dispatch] = useReducer(NoticeReducer, {
        notices: [],
        count: 0,
        selectList: {},
    });

    const navigate = useNavigate();
    const { user } = useAuth(); 
    const {isRoleValid} = useUserRole();

    // [GridModal]
    const [detail, setDetail] = useState([]);
    const [noticeData, setNoticeData] = useState([]);
    const [gridMode, setGridMode] = useState("DETAIL");
    const [isLoading, setIsLoading] = useState(false);
    const [isGridModal, setIsGridModal] = useState(false);
    const [isAuthorization, setIsAuthorization] = useState(false); 

    // [Modal]
    const [modalText, setModalText] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [saveNotice, setSaveNotice] = useState(null);

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isValidation, setIsValidation] = useState(true);

    const gridData = [
        { type: "text", span: "double", label: "제목", value: "", isRequired: true },
        { type: "checkbox", span: "double", label: "상시공지", value: "N" },
        { type: "date-duration", span: "full", label: "게시기간", value: {startTime: "", endTime:""}, isRequired: true},
        { type: "project", span: "full", label: "프로젝트명", value: {job_name: "", jno:0}, isRequired: true, isAll: true},
        { type: "html", span: "full", label: "내용", vlaue: ""},
        { type: "hidden", value: "" },
    ]

    const getModeString = () => {
        switch (gridMode) {
            case "SAVE":
                return "저장";
            case "EDIT":
                return "수정";
            case "REMOVE":
                return "삭제";
            default:
                return "";
        }
    }

    // [GridModal-Post] 공지사항 수정, 등록
    const handlePostGridModal = (mode, notice) => {
        const arr = [...gridData]

        setGridMode( (mode === "COPY") ? "SAVE": mode)

        if (mode === "EDIT" || mode === "COPY") {
            arr[0].value = notice.title;
            arr[1].value = notice.is_important;
            arr[2].value.startTime = dateUtil.format(notice.posting_start_date);
            arr[2].value.endTime = dateUtil.format(notice.posting_end_date);
            arr[3].value.job_name = (mode === "COPY") ? "" : notice.job_name;
            arr[3].value.jno = notice.jno;
            arr[4].value = notice.content;
            arr[5].value = Number(notice.idx);
        }

        // 수정을 저장하고 난 후에, value값이 초기화 되지 않는 문제 해결하기 위해 사용.
        if (mode === "SAVE") {
            arr[2].value.startTime = "-";
            arr[2].value.endTime = "-";
            arr[4].value = "";
        }

        setIsGridModal(true);
        setNoticeData(notice);
        setDetail(arr);
        // getSiteData();
    }

    // [GridModal-Get] 공지사항 상세
    const handleGetGridModal = (mode, notice) => {
            setGridMode(mode)
            const arr = [...gridData]
            if (mode === "DETAIL") { 
                arr[0].value = notice.title;
                arr[1].value = notice.is_important;
                arr[2].value.startTime = dateUtil.format(notice.posting_start_date);
                arr[2].value.endTime = dateUtil.format(notice.posting_end_date);
                arr[3].value.job_name = notice.job_name;
                arr[3].value.jno = notice.jno
                arr[4].value = notice.content;
                arr[5].value = Number(notice.idx);
                if (user.uno === notice.reg_uno) {
                    setIsAuthorization(true);
                }else{
                    setIsAuthorization(false);
                }   
            }
            setNoticeData(notice);
            setDetail(arr);
            setIsGridModal(true);
        }

    // [GridModal] gridMode props 변경 이벤트
    const onClickModeSet = (mode) => {
        setGridMode(mode);
    }

    // [GridModal] 삭제 이벤트
    const onClickGridModalDeleteBtn = async (item) => {
        setIsLoading(true);

        var idx;
        if (gridMode === "DETAIL") {
            idx = Number(item[5].value);
        } else {
            idx = Number(item[5].value);
        }
        try {

            const res = await Axios.DELETE(`notice/${idx}`)
            // 성공 모달
            if (res?.data?.result === "Success") {                
                setModalTitle("공지사항");
                setModalText("삭제에 성공하였습니다.");
                setIsOpenModal(true);
                
                setIsDetail(false);
            } else {
                setModalTitle("공지사항");
                setModalText("삭제에 실패하였습니다.");
                setIsOpenModal(true);
            }

            setGridMode("REMOVE");
            setIsGridModal(false);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }

    }
    
     // [GridModal-Get] 공지사항 상세 X 버튼 클릭 이벤트
    const onClickGridModalExitBtn = () => {
            setDetail([]);
            setIsGridModal(false);
            setIsDetail(false);
        }

    // [GridModal-Post] 저장 버튼을 눌렀을 경우
    const onClickModalSave = async (item, mode) => {
        setGridMode(mode);

        // 제목을 입력 안했을 경우 모달
        if (item[0].value === "") {
            setIsValidation(false);
            setModalTitle("입력오류");
            setModalText("제목을 입력해 주세요.");
            setIsOpenModal(true);
        }

        // 프로젝트 지정 안했을 경우 모달
        else if (item[3].value.job_name === '') {
            setIsValidation(false);
            setModalTitle("입력오류");
            setModalText("프로젝트를 선택해 주세요.");
            setIsOpenModal(true);
        
        // 게시시작일을 선택 안했을 경우 모달
        }else if ( dateUtil.goTime(item[2].value.startTime) === "0001-01-01T00:00:00Z" ){
            setIsValidation(false);
            setModalTitle("입력오류");
            setModalText("게시시작일을 선택해 주세요.");
            setIsOpenModal(true);
        
        // 게시마감일을 선택 안했을 경우 모달 
        }else if ( dateUtil.goTime(item[2].value.endTime) === "0001-01-01T00:00:00Z" ){
            setIsValidation(false);
            setModalTitle("입력오류");
            setModalText("게시마감일을 선택해 주세요.");
            setIsOpenModal(true);
        }
        else {
            setIsValidation(true);
            setModalTitle("공지사항");
            setModalText("저장하시겠습니까?");
            setIsOpenModal(true);
            setSaveNotice(item);
        }
    }

    const save = async () => {
        setIsLoading(true);
        setIsOpenModal(false);
        setIsValidation(false);
        const notice = {
            jno: Number(saveNotice[3].value.jno) || Number(0),
            title: saveNotice[0].value || "",
            content: saveNotice[4].value || "",
            is_important: saveNotice[1].value || "N",
            show_yn: "Y",
            posting_start_date: dateUtil.goTime(saveNotice[2].value.startTime) || "0001-01-01T00:00:00Z",
            posting_end_date: dateUtil.parseToGo(saveNotice[2].value.endTime) || "0001-01-01T00:00:00Z",
            reg_uno: Number(user.uno) || 0,
            reg_user: user.userName || "",
        }

        let res;

        try {
            if (gridMode === "SAVE") {
                res = await Axios.POST(`/notice`, notice);
            } else {
                notice.idx = Number(saveNotice[5].value);
                notice.mod_user = user.userName || "";
                notice.mod_uno = Number(user.uno) || 0;

                res = await Axios.PUT(`/notice`, notice);
            }

            if (res?.data?.result === "Success") {
                // Axios 요청 성공했을 경우
                setIsDetail(false);
                setModalTitle("공지사항")
                setModalText("저장에 성공하였습니다.");
        
            } else {
                // Axios 요청 실패했을 경우
                setIsDetail(false);
                setModalTitle("공지사항")
                setModalText("저장에 실패하였습니다.");

            }
            setDetail([]);
            setIsGridModal(false);
            setIsOpenModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            await getData();
            setIsLoading(false);
        }
    }

    // [GridModal] 모드 변경 시
    useEffect(() => {
        if (gridMode === "EDIT" ) {
            handlePostGridModal("EDIT", notice[0]);
        }
    }, [gridMode])

    // [GridModal] 수정 또는 디테일 모달 켜기
    useEffect(() => {
        if (isDetail === true && notice.length !== 0) {                    
            handleGetGridModal("DETAIL", notice[0]);
        } 
        else if (isDetail === true) {
            handlePostGridModal("SAVE");
        }
    }, [isDetail])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal
                isOpen={isOpenModal}
                title={modalTitle}
                text={modalText}
                confirm={isValidation ? "예" : null}
                fncConfirm={save}
                cancel={isValidation ? "아니오" : "확인"}
                fncCancel={() => setIsOpenModal(false)}
            />
             <NoticeModal
                data={noticeData}
                isOpen={isGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={isRoleValid(noticeRoles.NOTICE_ADD_MANAGER) || isAuthorization}
                removeBtn={isRoleValid(noticeRoles.NOTICE_ADD_MANAGER) || isAuthorization}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickGridModalExitBtn}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClickModalSave}
                removeBtnClick={onClickGridModalDeleteBtn}
                isCancle={true}
                isCopy={isRoleValid(noticeRoles.NOTICE_ADD_MANAGER) && true}
                copyBtnClick={() => {handlePostGridModal("COPY", noticeData)}}
            />
        </div>
        )
}

export default NoticeDetail;