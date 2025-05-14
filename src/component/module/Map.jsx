import { useEffect, useState } from "react";
import {Axios} from "../../utils/axios/Axios"
import Modal from "./Modal";
import VWorldMap from "./VWorldMap";

/**
 * @description: vworld의 지도 보여주는 컴포넌트
 * @modified description: 
 * - 2025-05-14
 * : 기존의 vw.ol3.MAP, vw.ol3.layer.Marker은 사진을 여러개의 타일로 제공을 해주어서 위치별로 줌인/아웃을 하는 경우 지도가 제대로 표시 안되고 깨지는 경우가 생겨서 
 *   https://api.vworld.kr/req/wmts를 사용해서 보여주는 것으로 변경
 * - 
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-03-18
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 김진우
 * @usedComponents
 * - Modal
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET: /map/point (주소 x,  y좌표 조회)
 * 
 */

const Map = ( {roadAddress} ) => {

    const [point, setPoint] = useState(null);
    const [isModal, setIsModal] = useState(false);

    // 좌표값 불러오기
    const getPoint = async () => {
        if(roadAddress === null){
            setIsModal(true);
            return
        }
        // vworld상 좌표값을 얻기 위한 요청
        const res = await Axios.GET(`/api/map/point?roadAddress=${roadAddress}`)
        
        if (res?.data?.result === "Success") {
            setPoint(res?.data?.values)
        }
    }

    useEffect(() => {
        if(roadAddress === undefined || roadAddress === "") return;

        getPoint();
    }, []);

    return (
        <> 
            <Modal
                isOpen={isModal}
                title={"지도"}
                text={"지도를 불러올 수 없습니다.\n주소를 설정해 주세요.\n"}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />   
            <VWorldMap point={point}/>
        </>
    );
}


const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 9998,
}

const modalStyle = {
    display:"flex",
    flexDirection:"column", 
    margin : '8vh 0px',
    backgroundColor: '#ececec',
    borderRadius: '8px',
    border: "1px solid rgba(0, 0, 0, 1)",
    maxWidth: '80vw',
    width: '80vw',
    maxHeight: '80vh',
    height: '80vh',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 100,
};

const mapStyle = {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width:"100%", 
    height:"100%", 
    left:"0px", 
    top:"0px"
}

export default Map;