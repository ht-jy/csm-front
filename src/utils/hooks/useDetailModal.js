import { useState } from "react";

const useDetailModal = () => {
    const [isDetailModal, setIsDetailModal] = useState(false);  // 상세모달 온오프 플래그
    const [detailMode, setDetailMode] = useState("");           // 상세모달 상태값(DETAIL:상세, SAVE:추가, EDIT:수정, REMOVE:삭제)
    const [detailData, setDetailData] = useState([]);           // 상세모달 실제 데이터
    const [isMod, setIsMod] = useState(false);                  // 상세모달 이벤트 성공, 실패 플래그

    // 상세페이지 클릭 or 버튼 클릭 - 상세모달 온
    const handleDetailModalOn = (item, mode) => {
        setDetailMode(mode);
        setDetailData(item);
        setIsDetailModal(true);
    }

    // detailModal의 gridMode props 변경 이벤트
    const handleModeSet = (mode) => {
        setDetailMode(mode)
    }

    // Modal or GridModal 문구 출력
    const getModeString = () => {
        switch (detailMode) {
            case "SAVE":
                return "저장";
            case "DETAIL":
                return "상세";
            case "EDIT":
                return "수정";
            case "REMOVE":
                return "삭제";
            default:
                return "상세";
        }
    }

    // detailModal의 'X', '종료' 버튼 클릭 이벤트
    const handleExitBtnClick = () => {
        setDetailData([]);
        setIsDetailModal(false);
    }

    return {isDetailModal, setIsDetailModal, detailData, detailMode, setDetailMode, isMod, setIsMod, handleDetailModalOn, handleModeSet, getModeString, handleExitBtnClick}
}

export default useDetailModal;