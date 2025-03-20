import { useEffect, useReducer, useState } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { useAuth } from "../../../../context/AuthContext";
import { dateUtil } from "../../../../../utils/DateUtil";
import Modal from "../../../../module/Modal";
import NoticeReducer from "./NoticeReducer";
import GridModal from "../../../../module/GridModal";
import Loading from "../../../../module/Loading";


const NoticeDetail = ( {notice, isDetail, setIsDetail} ) => {
    const [state, dispatch] = useReducer(NoticeReducer, {
        notices: [],
        count: 0,
        selectList: {},
    });

    const { user } = useAuth(); 

    // [GridModal]
    const [detail, setDetail] = useState([]);
    const [gridMode, setGridMode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGetGridModal, setIsGetGridModal] = useState(false);
    const [isPostGridModal, setIsPostGridModal] = useState(false);
    const [isAuthorization, setIsAuthorization] = useState(true); //  FIXME: 나중에 권한 넣을 때는 false로 변경해야함.
    
    // [Modal]
    const [isMod, setIsMod] = useState(true);
    const [modalText, setModalText] = useState("")
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isValidation, setIsValidation] = useState(true);

    // [GridModal]
    const gridGetData = [
        { type: "html", span: "full", label: "", value: "" },
        { type: "html", span: "full", label: "", value: "" },
        { type: "hidden", value: "" },
    ]

    const gridPostData = [
        { type: "text", span: "full", label: "제목", value: "" },
        { type: "select", span: "double", label: "현장(공개범위)", value: 0, selectName: "projectNm" },
        { type: "select", span: "double", label: "공개기간", value: "1", selectName: "noticeNm" },
        { type: "html", span: "full", label: "내용", vlaue: "" },
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

        setGridMode(mode);
        const arr = [...gridPostData]

        // 수정을 저장하고 난 후에, value값이 초기화 되지 않는 문제 해결하기 위해 사용.
        if (mode === "SAVE") {
            arr[3].value = "";
        }

        if (mode === "EDIT") {
            arr[0].value = notice.title;
            arr[1].value = notice.jno;
            arr[2].value = notice.period_code;
            arr[3].value = notice.content;
            arr[4].value = notice.idx;
        }
        
        setDetail(arr);
        getSiteData();
        getPeriodData();
        setIsPostGridModal(true);
    }

       // [GridModal-Get] 공지사항 상세
        const handleGetGridModal = (mode, notice) => {

            const arr = [...gridGetData]

            if (mode === "DETAIL") {
                arr[0].value = `
                            <div class="row mb-2">
                                <div class="col-md-1 fw-bold">제목</div>
                                <div class="col-md-10">${notice.title}</div>
                            </div>
                            <div class="row">
                                <div class="col-md-1 fw-bold">지역</div>
                                <div class="col-md-3">${notice.job_loc_name}</div>
                                <div class="col-md-2 fw-bold">현장(공개범위)</div>
                                <div class="col-md-5">${notice.job_name}</div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-md-1 fw-bold">등록자</div>
                                <div class="col-md-3">${notice.user_info}</div>
                                <div class="col-md-1 fw-bold">게시일</div>
                                <div class="col-md-3">${dateUtil.format(notice.reg_date, "yyyy-MM-dd")} ~ ${dateUtil.format(notice.posting_date, "yyyy-MM-dd")}</div>
                                ${dateUtil.format(notice.mod_date, "yyyy-MM-dd") !== "0001-01-01" ? `                                
                                    <div class="col-md-1 fw-bold">수정일</div>
                                    <div class="col-md-3 ">${dateUtil.format(notice.mod_date, "yyyy-MM-dd")}</div>
                                ` : ""}
                            </div>
                            `
                arr[1].value = `<div class="overflow-auto Scrollbar" style="white-space:pre; height: 28rem; padding: 0.5rem">${notice.content}</div>`;
                arr[2].value = notice.idx;
    
                // FIXME: 수정 삭제 버튼 작성자만 볼 수 있도록
                // if (user.uno == notice.reg_uno) {
                //     setIsAuthorization(true);
                // }
    
    
            }
    
            setDetail(arr);
            setIsGetGridModal(true);
        }

    // [GridModal] gridMode props 변경 이벤트
    const onClickModeSet = (mode) => {
        setGridMode(mode)
    }

// [GridModal] 삭제 이벤트
    const onClickGridModalDeleteBtn = async (item) => {
        setIsLoading(true);

        var idx;
        if (gridMode === "DETAIL") {
            idx = Number(item[2].value)
            setIsGetGridModal(false);
        } else {
            idx = Number(item[4].value)
            setIsPostGridModal(false);
        }
        const res = await Axios.DELETE(`notice/${idx}`)

        if (res?.data?.result === "Success") {
            // 성공 모달
            setIsMod(true);
            setIsOpenModal(true);
            setIsDetail(false);
        } else {
            // 실패 모달
            setIsMod(false);
            setIsOpenModal(true);
        }

        setGridMode("REMOVE")
        setIsLoading(false);

    }
    
     // [GridModal-Get] 공지사항 상세 X 버튼 클릭 이벤트
        const onClickGetGridModalExitBtn = () => {
            setDetail([]);
            setIsGetGridModal(false);
        }
    
        // [GridModal-Post] 닫기 버튼을 눌렀을 경우
        const onClickPostGridModalExitBtn = () => {
            setDetail([]);
            setIsPostGridModal(false);
        }
    
        // [GridModal-Post] 현장데이터 조회
        const getSiteData = async () => {
            setIsLoading(true);
    
            const res = await Axios.GET(`/project/nm`);
    
            if (res?.data?.result === "Success") {
                dispatch({ type: "PROJECT_NM", site: res?.data?.values?.list });
            }
            setIsLoading(false);
        }
    
        // [GridModal-Post] 공지기간 리스트 조회
        const getPeriodData = async () => {
            setIsLoading(true);
            const res = await Axios.GET(`/notice/period`);
            
            if (res?.data?.result === "Success") {
                dispatch({type: "NOTICE_NM", period: res?.data?.values?.periods})
            }
    
            setIsLoading(false);
        }
    
        // [GridModal-Post] 저장 버튼을 눌렀을 경우
        const onClickModalSave = async (item, mode) => {
    
            setGridMode(mode);
    
            // 제목을 입력 안했을 경우 모달
            if (item[0].value === "") {
                setIsValidation(false);
                setModalText("제목을 입력해 주세요.");
                setIsOpenModal(true);
            }
            // 내용을 입력 안했을 경우 모달
            else if (item[3].value === "") {
                setIsValidation(false);
                setModalText("내용을 입력해 주세요.")
                setIsOpenModal(true);
    
            } else {
                setIsLoading(true);
                setIsValidation(true);
    
                const notice = {
                    jno: Number(item[1].value) || 0,
                    title: item[0].value || "",
                    content: item[3].value || "",
                    show_yn: "Y", //item[2].value || "Y",
                    period_code: item[2].value || "1",
                    reg_uno: Number(user.uno) || 0,
                    reg_user: user.userName || "",
                }
    
                let res;
    
                if (gridMode === "SAVE") {
                    res = await Axios.POST(`/notice`, notice);
                } else {
                    notice.idx = item[4].value;
                    notice.mod_user = user.userName || "";
                    notice.mod_uno = Number(user.uno) || 0;
    
                    res = await Axios.PUT(`/notice`, notice);
                }
    
                if (res?.data?.result === "Success") {
                    setIsMod(true);
                    setIsDetail(false);
    
                } else {
                    setIsMod(false);
                }
    
                setIsLoading(false);
                setDetail([]);
                setIsPostGridModal(false);
                setIsOpenModal(true);
            }
        }

            // [GridModal] 모드 변경 시
            useEffect(() => {
                if (gridMode === "EDIT" && isPostGridModal !== true) {
                    setIsGetGridModal(false);
                    handlePostGridModal("EDIT", notice[0]);
                }
            }, [gridMode])
        
            useEffect(() => {
                if(isGetGridModal === false && isPostGridModal === false){
                    // FIXME: 수정 삭제 작성자에게만 주는 권한
                    // setIsAuthorization(false)
                    setIsDetail(false)
                    setGridMode("DETAIL")
                }

            }, [isGetGridModal, isPostGridModal])

            useEffect(() => {
                if (isDetail === true && notice.length != 0) {
                    
                    handleGetGridModal("DETAIL", notice[0]);
                    setIsGetGridModal(true)
                } else if (isDetail === true) {
                    handlePostGridModal("SAVE")
                }
            }, [isDetail])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal
                isOpen={isOpenModal}
                title={isValidation ? (isMod ? "요청 성공" : "요청 실패") : "입력 오류"}
                text={isValidation ? (isMod ? "성공하였습니다." : "실패하였습니다.") : modalText}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />
             <GridModal
                isOpen={isGetGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={isAuthorization}
                removeBtn={isAuthorization}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickGetGridModalExitBtn}
                detailData={detail}
                selectList
                saveBtnClick//={"저장 누를때"}
                removeBtnClick={onClickGridModalDeleteBtn}
            />
            <GridModal
                isOpen={isPostGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={isAuthorization}
                removeBtn={isAuthorization}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickPostGridModalExitBtn}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClickModalSave}
                removeBtnClick={onClickGridModalDeleteBtn}
                isCancle={false}
                isValidation={true}
            />
        </div>
        )
}

export default NoticeDetail;