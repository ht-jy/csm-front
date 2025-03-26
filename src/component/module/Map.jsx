import { useEffect, useState } from "react";
import {Axios} from "../../utils/axios/Axios"
import markerIcon from "../../assets/image/marker.png"
import Modal from "./Modal";
/**
 * @description: vworld의 지도 보여주는 컴포넌트
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-03-18
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Modal
 * 
 * @additionalInfo
 * - vw.ol3.MAP, vw.ol3.layer.Marker: vworld에서 제공하는 지도 이용
 * - API: 
 *    Http Method - GET: /site/point (주소 x,  y좌표 조회)
 * 
 */

const Map = ( {roadAddress} ) => {

    const [point, setPoint] = useState(null);
    const [map, setMap] = useState(null);
    const [isModal, setIsModal] = useState(false);

    const getPoint = async () => {
        // vworld상 좌표값을 얻기 위한 요청
        const res = await Axios.GET(`/site/point?roadAddress=${roadAddress}`)
        if (res?.data?.result === "Success") {
            setPoint(res?.data?.values?.point)
        }else {
            setIsModal(true);
        }
    }
    useEffect( () => {

        if (map && point) {
            
            map.getView().setCenter([Number(point.x), Number(point.y)]);
            map.getView().setZoom(18);

            // 마커 설정하기
            const markerLayer = new window.vw.ol3.layer.Marker(map);
            map.addLayer(markerLayer);
            window.vw.ol3.markerOption = {
                x : point.x,
                y : point.y,
                epsg : "EPSG:900913",
                iconUrl : markerIcon,
                
              text : {
                offsetX: 0.5, //위치설정
                offsetY: 20,   //위치설정
                fill: {color: '#000'},
                stroke: {color: '#fff', width: 2},
              },
        };

               markerLayer.addMarker(window.vw.ol3.markerOption);
            

        }

    }, [point])
    
  
    useEffect(() => {
        if (map === null) {

            window.vw.ol3.MapOptions = {
                basemapType: window.vw.ol3.BasemapType.GRAPHIC
                , controlDensity: window.vw.ol3.DensityType.EMPTY
                , interactionDensity: window.vw.ol3.DensityType.BASIC
                , controlsAutoArrange: true
                , homePosition: window.vw.ol3.CameraPosition
                , initPosition: window.vw.ol3.CameraPosition
            }; 
            
            const vmap = new window.vw.ol3.Map("vMap", window.vw.ol3.MapOptions);
            
            setMap(vmap)
        }
    }, [])
  
    useEffect( () => {
        getPoint()
    }, [roadAddress])

    return (
        <> 
            <Modal
                isOpen={isModal}
                text={"지도를 불러올 수 없습니다."}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <div id="vMap"  style={{width:"100%", height:"100%", left:"0px", top:"0px"}}/>        
        </>
    );
}
export default Map;