import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import VWorldMapEffect from "./VWorldMapEffect";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import zoomInIcon from "../../assets/image/zoom-in.png";
import zoomOutIcon from "../../assets/image/zoom-out.png";
import targetIcon from "../../assets/image/target.png";
import "leaflet/dist/leaflet.css";

/**
 * @description: vworld 지도 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-05-14
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : https://api.vworld.kr/req/wmts (vworld 지도api)
 */

// .env에 정의한 https://api.vworld.kr/req/wmts api key 환경변수
const WMTS_KEY = process.env.REACT_APP_MAP_WMTS_API_KEY;

const VWorldMap = ({ point }) => {
    // 좌표
    const [coord, setCoord] = useState(null);
    // 작은맵
    const [map, setMap] = useState(null);
    // 큰맵
    const [fullMap, setFullMap] = useState(null);
    // 최대화면 여부
    const [isFull, setIsFull] = useState(false);
    
    // 마커
    const customMarker = new L.Icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [17, 25],
        iconAnchor: [7, 25],
        popupAnchor: [1, -20],
        shadowSize: [25, 25],
    });

    // 좌표셋팅
    useEffect(() => {
        if (!point) return;
        
        const x = Number(point.x);
        const y = Number(point.y);
        if (isNaN(x) || isNaN(y)) return;

        const lonLat = convertEPSG900913ToWGS84(x, y);
        setCoord(lonLat);
    }, [point]);

    // 좌표변환
    const convertEPSG900913ToWGS84 = (x, y) => {
        const originShift = 2 * Math.PI * 6378137 / 2.0;
        const lon = (x / originShift) * 180.0;
        const lat = (y / originShift) * 180.0;
        const latRadians = (lat * Math.PI) / 180.0;
        const finalLat = (180 / Math.PI) * (2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
        return { lat: finalLat, lon };
    };

    // 마커 cursor 스타일 제거
    useEffect(() => {
        if (!coord) return;

        const interval = setInterval(() => {
            const markerElements = document.querySelectorAll(".leaflet-marker-icon");
            markerElements.forEach((el) => {
                el.style.cursor = "default";
            });
        }, 100);

        setTimeout(() => clearInterval(interval), 1000);

    }, [coord]);

    return (
        <div style={{ position: "relative", height: "338px", width: "100%" }}>
        {
            coord && (
                <>
                    <button className="fullscreen-button" onClick={() => setIsFull(true)}>
                        <img
                            src={zoomInIcon}
                            alt="전체화면"
                            style={{ width: "30px", height: "30px" }}
                        />
                    </button>
                    {
                        map && (
                            <button className="marker-button" onClick={() => map.panTo([coord.lat, coord.lon])}>
                                <img
                                    src={targetIcon}
                                    alt="중심으로 이동"
                                    style={{ width: "20px", height: "20px" }}
                                />
                            </button>
                        )
                    }
                    <MapContainer 
                        center={[coord.lat, coord.lon]} 
                        zoom={13} 
                        style={{ height: "100%", width: "100%" }}
                        attributionControl={false}
                    >
                        <VWorldMapEffect setMap={setMap} />
                        <TileLayer
                            url={`https://api.vworld.kr/req/wmts/1.0.0/${WMTS_KEY}/Base/{z}/{y}/{x}.png`}
                            attribution="VWorld"
                        />
                        <Marker position={[coord.lat, coord.lon]}  icon={customMarker}>
                            {/* <Popup>마커 클릭시 화면에 보여줄 팝업</Popup> */}
                        </Marker>
                    </MapContainer>
                    {
                        // 전체화면 지도
                        isFull && (
                            <>
                                <div className="map-overlay" />
                                <div className="fullscreen-map-modal">
                                    <button className="fullscreen-button" style={{zIndex: "1002"}} onClick={() => setIsFull(false)}>
                                        <img
                                            src={zoomOutIcon}
                                            alt="전체화면"
                                            style={{ width: "30px", height: "30px" }}
                                        />
                                    </button>
                                    {
                                        fullMap && (
                                            <button className="marker-button" style={{zIndex: "1002", top: "750px"}} onClick={() => fullMap.panTo([coord.lat, coord.lon])}>
                                                <img
                                                    src={targetIcon}
                                                    alt="중심으로 이동"
                                                    style={{ width: "20px", height: "20px" }}
                                                />
                                            </button>
                                        )
                                    }
                                    <MapContainer 
                                        center={[coord.lat, coord.lon]} 
                                        zoom={13} 
                                        style={{ height: "100%", width: "100%" }}
                                        attributionControl={false}
                                    >
                                        <VWorldMapEffect setMap={setFullMap} />
                                        <TileLayer
                                            url={`https://api.vworld.kr/req/wmts/1.0.0/${WMTS_KEY}/Base/{z}/{y}/{x}.png`}
                                            attribution="VWorld"
                                        />
                                        <Marker position={[coord.lat, coord.lon]} icon={customMarker} />
                                    </MapContainer>
                                </div>
                            </>
                        )
                    }
                </>
            )
        }
        </div>
    );
};

export default VWorldMap;

