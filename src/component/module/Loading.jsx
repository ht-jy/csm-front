import React from 'react';
import LoadingImg from "../../assets/image/Loading.gif";

const Background = {
    position: 'absolute',
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

// 커스텀 로딩창
// api호출 같은 대기시간이 긴 요청이 있을 경우 사용
const Loading = ({ isOpen }) => {
    return (
        <div>
            {
                isOpen ? 
                <div style={Background}>
                    {/* <LoadingText>잠시만 기다려 주세요.</LoadingText> */}
                    <img src={LoadingImg} alt="로딩중" width="15%" />
                </div>
                : <></>
            }
        </div>
    );
};

export default Loading;