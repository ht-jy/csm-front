import { useState } from "react";

/**
 * @description: 상세모달에 조작에 필요한 state 모음
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-14
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 */
const useGridModalControlState = () => {
    const [isGridModal, setIsGridModal] = useState(false);  // 상세모달 온오프 플래그
    const [gridMode, setGridMode] = useState("");           // 상세모달 상태값(DETAIL:상세, SAVE:추가, EDIT:수정, REMOVE:삭제)
    const [detail, setDetail] = useState([]);               // 상세모달 실제 데이터
    const [isMod, setIsMod] = useState(false);              // 상세모달 이벤트 성공, 실패 플래그

    return {isGridModal, setIsGridModal, gridMode, setGridMode, detail, setDetail, isMod, setIsMod}
}

export default useGridModalControlState;