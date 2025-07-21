import { useEffect, useState } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { Common } from "../../../../../utils/Common";
import { useAuth } from "../../../../context/AuthContext";
import Button from "../../../../module/Button";
/**
 * @description: 현장에 들어오는 장비 조회 및 관리를 위한 페이지. 현재 현장에서 임시로 보이도록 만든 상태 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-09
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /equip (장비조회-임시)
 *    Http Method - POST : /equip (장비입력-임시)
 *    Http Method - PUT : 
 *    Http Method - DELETE :  
 * - 주요 상태 관리: 
 */
const Equip = () => {
    const [temp, setTemp] = useState([]);
    const {setIsProject} = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (idx, e) => {
        const newValue = e.target.value;
        setTemp(prevTemp => {
            // 이전 배열 복사 후 특정 요소만 갱신
            const newTemp = [...prevTemp];
            newTemp[idx] = { ...newTemp[idx], cnt: newValue };
            return newTemp;
        });
    };

    const equipSave = async() => {
        setIsLoading(true);

        const res = await Axios.POST(`/equip`, temp);
        
        if (res?.data?.result === "Success") {
            getData();
        } else if (res?.data?.result === "Failure") {

        }

        setIsLoading(false);
    }

    const getData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/equip`);
        
        if (res?.data?.result === "Success") {
            setTemp(res?.data?.values?.list);
            // dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count });
        } else if (res?.data?.result === "Failure") {

        }

        setIsLoading(false);
    };

    useEffect(() => {
        getData();
    }, []);

    // 상단의 project 표시 여부 설정: 표시
    useEffect(() => {
        setIsProject(true);
    }, [])

    return(
        <div>
            {
                temp.map((item, idx) => (
                    <div style={{display: "flex", height: "20px", margin: "10px"}}>
                        <div key={`job${idx}`} style={{width: "500px"}}>{item.job_name}</div>
                        <input type="text" value={Common.formatNumber(item.cnt)} onChange={(e) => handleInputChange(idx, e)}/>
                    </div>
                ))
            }
            <Button text={"저장"} onClick={equipSave}/>
        </div>
    );
}

export default Equip;