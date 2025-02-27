import React, { useEffect, useRef } from "react";


/**
 * @description: OusideClick으로 감싸진 것들 외의 영역을 클릭하면 비활성화 되는 컴포넌트
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-02-27
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @additionalInfo
 * - props
 *  setActive: 비활성화로 값을 바꿀 함수 (지정된 값과 반대로 됨)
 *  children: 내장 props 
 */
const OutsideClick = ({setActive, children}) => {

    const wrapperRef = useRef(null);

    const handleClickOutside = (event) => {
        if(wrapperRef && !wrapperRef.current.contains(event.target)) {
            setActive(prev => !prev);
        }
    }

    useEffect (() => {
        // 컴포넌트가 실행되면, document에 event를 준다.
        document.addEventListener('mousedown', handleClickOutside);

        // 컴포넌트가 언마운트되면, 추가된 eventhandler를 제거한다. 
        return () => {
            document.removeEventListener('mousedown', handleClickOutside );
        }
    }, [wrapperRef])


    return <div ref={wrapperRef}> {children} </div>

}


export default OutsideClick;