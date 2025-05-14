import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * @description: vworld 지도 마커위치로 이동하기 위한 map정도 저장 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-05-14
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 */
const VWorldMapEffect = ({ setMap }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map]);

  return null;
};

export default VWorldMapEffect;