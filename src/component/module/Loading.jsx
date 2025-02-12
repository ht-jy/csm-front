import React from 'react';
import LoadingImg from "../../assets/image/Loading.gif";

/**
 * [커스텀 로딩창]
 * - 페이지 기능: 데이터 조회중과 같은 화면 동작이 멈춰 있을 경우 사용자에게 알리기 위한 로딩 화면을 보여주는 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-10
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * 
 * @additionalInfo
 */
const Background = {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    top: '0',
    left: '0',
    background: '#ffffffb7',
    zIndex: '999999999',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}

const Loading = ({ isOpen }) => {
    return (
        <div>
            {
                isOpen ? 
                <div style={Background}>
                    {/* <LoadingText>잠시만 기다려 주세요.</LoadingText> */}
                    <img src={LoadingImg} alt="로딩중" width="60px" />
                </div>
                : <></>
            }
        </div>
    );
};

export default Loading;