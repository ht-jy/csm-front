import { useCallback, useRef } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";

// react-quick-pinch-zoom 라이브러리 사용하여 이미지만 pinchZoom(모바일상에서 손가락으로 확대/축소)기능을 사용
const PinchPicture = ({ image }) => {
    const imgRef = useRef();

    const onUpdate = useCallback(({ x, y, scale }) => {
        const { current: img } = imgRef;
    
        if (img) {
          const value = make3dTransformValue({ x, y, scale });
    
          img.style.setProperty("transform", value);
        }
    }, []);

    return(
        <div className="container" style={{padding:'0px', paddingTop:'50px'}}>
            <QuickPinchZoom
                onUpdate={onUpdate}
                tapZoomFactor={2}   //탭을 하면 확대/축소 계수
                zoomOutFactor={2}   //확대/축소 비율이 설정된 값보다 적으면 이전으로 되돌아감
                inertiaFriction={0} //0보다 크고 1보다 작은 숫자로, 동작이 느려지는 속도를 설정. 값이 작을수록 속도가 더 빨리 느려짐.
                maxZoom={10}
                minZoom={1}
                >
                <img
                    width="100%"
                    ref={imgRef}
                    alt="img"
                    src={image}
                />
            </QuickPinchZoom>
        </div>
    );
}

export default PinchPicture;