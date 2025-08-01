import Slider from "rc-slider";
import 'rc-slider/assets/index.css';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Organization from "../../../../../assets/image/organization_chart.png";
import { Axios } from "../../../../../utils/axios/Axios";
import { Common } from "../../../../../utils/Common";
import { dateUtil } from "../../../../../utils/DateUtil";
import { ObjChk } from "../../../../../utils/ObjChk";
import { useAuth } from "../../../../context/AuthContext";
import SiteContext from "../../../../context/SiteContext";
import Button from "../../../../module/Button";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import OrganizationModal from "../../../../module/modal/OrganizationModal";
import AddDetailSchedule from "../schedule/AddDetailSchedule";
import DetailSchedule from "../schedule/DetailSchedule";
import { roleGroup, useUserRole } from "../../../../../utils/hooks/useUserRole";

/**
 * @description: 프로젝트 상세 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-04
 * @modified 최종 수정일: 2025-07-22
 * @modifiedBy 최종 수정자: 정지영 
 * 2025-07-22: 작업 내용 및 휴무일 컴포넌트 추가 <AddDetailSchedule ... />
 * 
 * @usedComponents
 * - dateUtil: 날짜 포맷
 * 
 */
const DetailProject = ({data, projectNo, projectLength, isMain, isEdit, onClickDeleteBtn, handleChangeValue}) => {

    const [isOrganizationOpen, setIsOrganizationOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState(false);
    const [modalText, setModalText] = useState(false);

    const { getData, selectedDate } = useContext(SiteContext);
    const { user } = useAuth();
    const navigate = useNavigate();

    // 작업 내용 추가 및 수정 권한
    // 권한 체크
    const { isRoleValid } = useUserRole();
    // 전체 프로젝트 수정 권한
    const scheduleRole = isRoleValid(roleGroup.SCHEDULE_MANAGER);

    // 작업내용 상세 모달
    const [isClickDateRest, setIsClickDateRest] = useState(false);
    const [clickRestDates, setClickRestDates] = useState([]); /** 해당 날짜 공휴일, 휴무일 **/
    const [clickDailyJobs, setClickDailyJobs] = useState([]); /** 해당 날짜 작업 내용 **/
    const [isScheduleModal, setIsScheduleModal] = useState(false); /** 상세 모달 **/

    /** 슬라이더 **/
    const [sliderValue, setSliderValue] = useState(0);
    const [isAddSchedule, setIsAddSchedule] = useState(false);

    // 슬라이더 변경 이벤트
    const onChangeSliderValue = (value) => {
        const formatValue = Common.sanitizeNumberInput(value);
        setSliderValue(formatValue);
        handleChangeValue("work_rate", data.jno, formatValue);
    }
    
    // 프로젝트 제목
    const projectTitle = () => {
        let title = "";
        if(projectLength > 1){
            title = `(${projectNo} / ${projectLength})`;
            if(isMain){
                title += ` (기본설정 프로젝트)`;
            }
        }
        return title;
    }
    
    // pe 리스트
    const peTextJoin = () => {
        if(data?.project_pe_list.length !== 0){
            let list = [];
            data?.project_pe_list.map(item => list.push(item.name));
            return list.join(", ");
        }
        return "-";
    }

    // 조직도 열기
    const onClickOrganization = () => {
        setIsOrganizationOpen(true);
    }

    /***** 공정률 및 작업내용 *****/
    // 취소기한 별 날짜 여부 체크: jno
    const checkAllowDate = (cancelDay) => {

        // 오늘날짜에서 마감취소기간을 뺀 최소 허용 기간 구하기
        const allowDate = dateUtil.diffDay(new Date(dateUtil.now()), cancelDay);
        
        const compDate = new Date(selectedDate);

        // 만약 선택한 날짜가 최소허용기간 보다 적으면 false 반환
        if (!ObjChk.all(cancelDay) && !ObjChk.all(compDate) && allowDate > compDate) {
            return false;
        }else{
            return true;
        }

    }

     /***** Schedule 상세 모달 *****/
        const onClickScheduleOpen = (item) => {
            const date = ObjChk.all(selectedDate) ? new Date() : new Date(selectedDate)
            // setIsClickDateRest(isRest(date));
            // setClickRestDates(getIsSameDates(date));
            setClickDailyJobs(item);
            setIsScheduleModal(true);
        }
    
        // 작업내용 수정
        const onClickDailyJobModify = async(item) => {
            setIsLoading(true);
            try {
                const job = {
                    idx: item.idx,
                    jno: item.jno,
                    targetDate: dateUtil.parseToGo(item.date),
                    content: item.content,
                    mod_uno: user.uno,
                    mod_user: user.userName
                }
            
                const res = await Axios.PUT(`/schedule/daily-job`, job);
                
                if (res?.data?.result === "Success") {
                    getData();
                    setModalText("작업내용 수정에 성공하였습니다.");
                    setIsScheduleModal(false);
                    
                }else{
                    setModalText("작업내용 수정에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
                }
                setModalTitle("작업내용");
                setIsModal(true);
            } catch(err) {
                navigate("/error");
            } finally {
                setIsLoading(false);
            }
        }
    
        // 작업내용 삭제
        const onClickDailyJobRemove = async(item) => {
            setIsLoading(true);
            try {
                const res = await Axios.DELETE(`/schedule/daily-job/${item.idx}`);
                if (res?.data?.result === "Success") {
                    getData();
                    setModalText("작업내용 삭제에 성공하였습니다.");
                    setIsScheduleModal(false);
                }else{
                    setModalText("작업내용 삭제에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
                }
                setModalTitle("작업내용");
                setIsModal(true);
            } catch(err) {
                navigate("/error");
            } finally {
                setIsLoading(false);
            }
        }
    
    /***** Schedule 추가 *****/
    // 작업 추가 모달 열기
    const onClickAddSchedule = () => {
        setIsAddSchedule(true);
    }

    // 시작 ~ 종료 날짜 기간 ("YYYY-MM-DD")
    const getDatesBetween = (startDateStr, endDateStr) => {
        const dates = [];
        const start = new Date(startDateStr);
        const end   = new Date(endDateStr);
      
        // 현재 날짜를 start 날짜 복사본으로 초기화
        let current = new Date(start);
      
        // current가 end보다 작거나 같을 때까지 반복
        while (current <= end) {
          // YYYY-MM-DD 형식으로 맞춰서 push
          const yyyy = current.getFullYear();
          const mm   = String(current.getMonth() + 1).padStart(2, '0');
          const dd   = String(current.getDate()).padStart(2, '0');
          dates.push(`${yyyy}-${mm}-${dd}`);
      
          // 하루를 더한다
          current.setDate(current.getDate() + 1);
        }
      
        return dates;
    }

    // 작업내용 저장
    const onClickJobSave = async(item) => {
        const jobs = [];
        const job = {
            jno: item.jno,
            content: item.reason,
            targetDate: dateUtil.parseToGo(item.date),
            reg_uno: user.uno,
            reg_user: user.userName
        }
        if(item.is_period === "Y"){
            const dates = getDatesBetween(item.date, item.period_date);
            dates.map(date => {
                jobs.push({...job, targetDate:dateUtil.parseToGo(date)});
            });
        }else{
            jobs.push(job);
        }
        
        setIsLoading(true);
        try {
            const res = await Axios.POST(`/schedule/daily-job`, jobs);
            
            if (res?.data?.result === "Success") {
                getData();
                setModalText("작업내용 추가에 성공하였습니다.");
                setIsAddSchedule(false);
            }else{
                setModalText("작업내용 추가에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
            }
            setModalTitle("작업내용");
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    const initDataTrans = () => {
        if (!Array.isArray(data?.daily_content_list)) return;

        data.daily_content_list.forEach(item => { 
            item.date = new Date(item.targetDate);
        })

    }
    /***** useEffect *****/
    useEffect(() => {
        setSliderValue(data.work_rate);
        initDataTrans();
    }, []);

    return(
        <div className="grid-project">
            <Loading isLoading={isLoading}></Loading>
            <Modal 
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <OrganizationModal 
                isOpen={isOrganizationOpen}
                fncExit={() => setIsOrganizationOpen(false)}
                type={"detail"}
                projectNo={data?.jno}
            />
            <AddDetailSchedule
                isOpen={isAddSchedule}
                clickDate={new Date(selectedDate)}
                exitBtnClick={() => setIsAddSchedule(false)}
                restSaveBtnClick={() => {}}
                jobSaveBtnClick={onClickJobSave}
                jobjno={data?.jno}
                nonRest={true}
            />
            <DetailSchedule
                isOpen={isScheduleModal}
                isRest={isClickDateRest}
                restDates={clickRestDates}
                dailyJobs={clickDailyJobs}
                clickDate={new Date(selectedDate)}
                exitBtnClick={() => setIsScheduleModal(false)}
                restModifyBtnClick={() => {}}
                restRemoveBtnClick={() => {}}
                dailyJobModifyBtnClick={onClickDailyJobModify}
                dailyJobRemoveBtnClick={onClickDailyJobRemove}
                nonRest={true}
            />
            {/* 첫 번째 열 */}
            <div className="form-control grid-project-bc" style={{ gridColumn: "1 / span 2", gridRow: "1", border: "none" }}>
                <div className="grid-project-title">
                    <span>{`프로젝트 상세 ${projectTitle()}`}</span>
                    {isEdit ? 
                        !isMain && <Button text={"삭제"} style={{marginLeft: "auto"}} onClick={() => onClickDeleteBtn(data.jno)}/>
                    :
                    <>
                        {scheduleRole && selectedDate === dateUtil.format(Date.now()) ?
                            <Button style ={{marginLeft : "auto"}} text={"작업추가"} onClick={() => onClickAddSchedule()}></Button>
                        : 
                            null 
                        }
                        <div className="grid-project-organization-container" onClick={onClickOrganization} style={scheduleRole ? selectedDate === dateUtil.format(Date.now()) ? null : { marginLeft:"auto"} : { marginLeft:"auto"}}>
                            <img src={Organization} style={{width: "20px"}}/>
                        </div>
                    </>
                    }
                </div>
                
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1", gridRow: "2" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        코드
                    </label>
                    <div className="read-only-input">
                        {data.project_no}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1", gridRow: "3" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        등록일
                    </label>
                    <div className="read-only-input">
                        {dateUtil.format(data.reg_date)}{dateUtil.isDate(data.mod_date) ? ` (수정일: ${dateUtil.format(data.mod_date)})` : ""}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1", gridRow: "4" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        착수년도
                    </label>
                    <div className="read-only-input">
                        {data.project_year}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1", gridRow: "5" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        업무 코드
                    </label>
                    <div className="read-only-input">
                        {data.project_code_name}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1", gridRow: "6" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        시작(착수)일
                    </label>
                    <div className="read-only-input">
                        {dateUtil.format(data.project_stdt)}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1", gridRow: "7" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        PM
                    </label>
                    <div className="read-only-input">
                        {data.job_pm_nm}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1", gridRow: "8" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        고객사
                    </label>
                    <div className="read-only-input">
                        {data.comp_name}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "1 / span 2", gridRow: "9" }}>
                <div className="text-overflow">
                    <label className="detail-text-label" style={{width: "130px"}}>
                        공정률
                    </label>
                    <div className="read-only-input">
                        {
                            isEdit && checkAllowDate(data.cancel_day) ?
                                <input className="slider-input" type="text" value={sliderValue} onChange={(e) => onChangeSliderValue(e.target.value)} style={{height: "40px", width: "50px", textAlign: "right", paddingRight: "5px"}}/>
                            :
                                sliderValue
                        }
                        &nbsp;%
                        <div style={{width: "260px", marginLeft: isEdit ? "20px" : "62px",}}>
                            <Slider 
                                min={0}
                                max={100}
                                value={sliderValue}
                                onChange={onChangeSliderValue}
                                disabled={!isEdit}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc" style={{ gridColumn: "1 / span 2", gridRow: "10", border: "none" }}>
                <div className="d-flex">
                    <label className="detail-text-label" style={{width: "130px"}}>
                        작업내용
                    </label>
                    <div className="read-only-input" onClick={() => onClickScheduleOpen(data.daily_content_list)}>
                        <div className="">

                        {data.daily_content_list.length > 0 ?
                            // 작업내용이 여러개인 경우
                            data.daily_content_list.map( (content, idx) => (
                                <div key={idx}>● {content.content}</div>
                            ))
                            :   
                            // 작업내용이 없는 경우
                            <div className="left" style={{ color: "#a5a5a5" }}>-</div>
                        }
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 두번째 열 */}
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "2", gridRow: "2" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        진행상태
                    </label>
                    <div className="read-only-input">
                        {data.project_state_nm}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "2", gridRow: "3" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        프로젝트 명
                    </label>
                    <div className="read-only-input">
                        {data.project_nm}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "2", gridRow: "4" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        사업소
                    </label>
                    <div className="read-only-input">
                        {data.project_loc_name}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "2", gridRow: "5" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        프로젝트 유형
                    </label>
                    <div className="read-only-input">
                        {data.project_type_nm}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "2", gridRow: "6" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        종료(예정)일
                    </label>
                    <div className="read-only-input">
                        {dateUtil.format(data.project_eddt)}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "2", gridRow: "7" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        PE
                    </label>
                    <div className="read-only-input">
                        {peTextJoin()}
                    </div>
                </div>
            </div>
            <div className="form-control grid-project-bc text-none-border" style={{ gridColumn: "2", gridRow: "8" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        발주처
                    </label>
                    <div className="read-only-input">
                        {data.order_comp_name}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailProject;