import { useEffect, useState } from "react";
import {Axios} from "../../utils/axios/Axios"
import markerIcon from "../../assets/image/marker.png"
import markerZoomIcon from "../../assets/image/markerZoom.png"
// import markerZoomIcon from "../../assets/image/markerZoom(2).png"
import Modal from "./Modal";
import zoomInIcon from "../../assets/image/zoom-in.png"
import zoomOutIcon from "../../assets/image/zoom-out.png"
import ExitIcon from "../../assets/image/exit.png"
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
    const [zoomOpen, setZoomOpen] = useState(false);

    const getPoint = async () => {
        console.log(roadAddress);
        // vworld상 좌표값을 얻기 위한 요청
        const res = await Axios.GET(`/site/point?roadAddress=${roadAddress}`)
        if (res?.data?.result === "Success") {
            setPoint(res?.data?.values?.point)
        }else {
            setIsModal(true);
        }
    }

    // const handleZoomClick = () => {
    //     if (point === null) return;

    //     window.vw.ol3.MapOptions = {
    //         basemapType: window.vw.ol3.BasemapType.GRAPHIC
    //         , controlDensity: window.vw.ol3.DensityType.EMPTY
    //         , interactionDensity: window.vw.ol3.DensityType.BASIC
    //         , controlsAutoArrange: true
    //         , homePosition: window.vw.ol3.CameraPosition
    //         , initPosition: window.vw.ol3.CameraPosition
    //     } 

    //     const vMapZoom = new window.vw.ol3.Map("vMapZoom", window.vw.ol3.MapOptions);

    //     vMapZoom.getView().setCenter([Number(point.x), Number(point.y)]);
    //     vMapZoom.getView().setZoom(18);
        
    //     // 마커 설정하기
    //     const markerLayer = new window.vw.ol3.layer.Marker(vMapZoom);
    //     vMapZoom.addLayer(markerLayer);
    //     window.vw.ol3.markerOption = {
    //         x : point.x,
    //         y : point.y,
    //         epsg : "EPSG:900913",
    //         iconUrl : markerIcon,
            
    //         text : {
    //             offsetX: 0.5, //위치설정
    //             offsetY: 20,   //위치설정
    //             fill: {color: '#000'},
    //             stroke: {color: '#fff', width: 2},
    //         },
    //     }

    //     markerLayer.addMarker(window.vw.ol3.markerOption);
            
    // }


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

        if (point === null) return;
        if(zoomOpen === false) return;

        window.vw.ol3.MapOptions = {
            basemapType: window.vw.ol3.BasemapType.GRAPHIC
            , controlDensity: window.vw.ol3.DensityType.EMPTY
            , interactionDensity: window.vw.ol3.DensityType.BASIC
            , controlsAutoArrange: true
            , homePosition: window.vw.ol3.CameraPosition
            , initPosition: window.vw.ol3.CameraPosition
        } 

        const vMapZoom = new window.vw.ol3.Map("vMapZoom", window.vw.ol3.MapOptions);
        vMapZoom.getView().setCenter([Number(point.x), Number(point.y)]);
        vMapZoom.getView().setZoom(18);

        const zoom = new window.vw.ol3.control.Zoom(vMapZoom);
        zoom.sliderVisible = true;
        zoom.site = window.vw.ol3.SiteAlignType.CENTER_RIGHT;
        zoom.draw();
        vMapZoom.addControl(zoom);


            // 마커 설정하기
        const markerLayer = new window.vw.ol3.layer.Marker(vMapZoom);
        vMapZoom.addLayer(markerLayer);
        window.vw.ol3.markerOption = {
            x : point.x,
            y : point.y,
            epsg : "EPSG:900913",
            iconUrl : markerZoomIcon,
            
            text : {
                offsetX: 0.5, //위치설정
                offsetY: 20,   //위치설정
                fill: {color: '#000'},
                stroke: {color: '#fff', width: 2},
            },
        }

        markerLayer.addMarker(window.vw.ol3.markerOption);

    }, [zoomOpen])

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

            { zoomOpen &&
                <div style={{...overlayStyle}} >
                    <div style={{...modalStyle}} >
                        <img
                            style={{
                                position: "absolute",
                                top: "10vh",
                                right: "12vw",
                                zIndex: 1000,
                                width:"30px",
                                backgroundColor:"rgba(0, 0, 0, 0.2)",
                                borderRadius: "5px"
            
                            }}
                            src={zoomOutIcon}
                            onClick={() => setZoomOpen(false)}
                            ></img>
                            <div id="vMapZoom"  style={mapStyle}></div>
                    </div>
                </div>
            }

            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div id="vMap"  style={{width:"100%", height:"100%", left:"0px", top:"0px"}}></div>
                <img
                    style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    zIndex: 1000,
                    width:"30px",
                    backgroundColor:"rgba(0, 0, 0, 0.2)",
                    borderRadius: "5px"
                    }}

                    src={zoomInIcon}
                    onClick={() => {
                        setZoomOpen(true);
                    }}
                >
                </img>
            </div>       

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
    // padding : '5px',
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
    // border : "1px solid rgba(0, 0, 0, 0.3)",
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width:"100%", 
    height:"100%", 
    left:"0px", 
    top:"0px"
}

export default Map;