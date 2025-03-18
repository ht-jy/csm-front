import { useState } from "react";

/**
 * @description: 상세모달 조작에 필요한 동일한 동작의 반복 이벤트 모음
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-14
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - handleGridModalOn(): mode에는 상황에 맞는 modal을 보여주기 위하여 DETAIL|SAVE|EDIT을 넣어주고, item에는 gridData의 순서에 맞게 modal에 보여줄 데이터를 리스트로 넘겨준다.
 * 
 */
const useGridModalSearch = ({gridData=[], getSelectOptionData=[], setIsGridModal, gridMode, setGridMode, setDetail}) => {
    // 상세페이지 클릭 or 버튼 클릭 - 상세모달 온
    const handleGridModalOn = async (mode, item) => {
        setGridMode(mode);

        const arr = [...gridData];
        if (mode === "DETAIL") {
            arr.map((obj, idx) => {
                obj.value = item[idx];
            });
        }

        setDetail(arr);
        for (const fn of getSelectOptionData) {
            try {
              await fn();
            } catch (error) {
              // 필요시 에러 처리 로직 추가
            }
        }

        setIsGridModal(true);
    }

    // GridModal의 gridMode props 변경 이벤트
    const handleModeSet = (mode) => {
        setGridMode(mode)
    }

    // Modal or GridModal 문구 출력
    const getModeString = () => {
        switch (gridMode) {
            case "SAVE":
                return "저장";
            case "DETAIL":
                return "상세";
            case "EDIT":
                return "수정";
            case "REMOVE":
                return "삭제";
        }
    }

    // GridModal의 'X', '종료' 버튼 클릭 이벤트
    const handleExitBtnClick = () => {
        setDetail([]);
        setIsGridModal(false);
    }

    return {handleGridModalOn, handleModeSet, getModeString, handleExitBtnClick};
}

export default useGridModalSearch;