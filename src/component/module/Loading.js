import React from 'react';
import {Background, LoadingText} from '../../assets/styleJS/Style';
import Loading from "../../assets/image/Loading.gif";

// 커스텀 로딩창
// api호출 같은 대기시간이 긴 요청이 있을 경우 사용
export default ({ isOpen }) => {
    return (
        <div>
            {
                isOpen ? 
                <Background>
                    {/* <LoadingText>잠시만 기다려 주세요.</LoadingText> */}
                    <img src={Loading} alt="로딩중" width="15%" />
                </Background>
                : <></>
            }
        </div>
    );
};