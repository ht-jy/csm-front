
import { dateUtil } from "../../../../../utils/DateUtil";

/**
 * @description: 프로젝트 상세 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-04
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - dateUtil: 날짜 포맷
 * 
 */
const DetailProject = ({data, projectNo, projectLength, isMain}) => {

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
        return "-"
    }
    
    return(
        <div className="grid-project">
            {/* 첫 번째 열 */}
            <div className="form-control" style={{ gridColumn: "1 / span 2", gridRow: "1", border: "none" }}>
                <div className="grid-project-title">
                    {`프로젝트 상세 ${projectTitle()}`}
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "2" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        번호
                    </label>
                    <div className="read-only-input">
                        {data.project_no}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "3" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        등록일
                    </label>
                    <div className="read-only-input">
                        {dateUtil.format(data.reg_date)}{dateUtil.isDate(data.mod_date) ? ` (수정일: ${dateUtil.format(data.mod_date)})` : ""}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "4" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        착수년도
                    </label>
                    <div className="read-only-input">
                        {data.project_year}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "5" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        업무 코드
                    </label>
                    <div className="read-only-input">
                        {data.project_code_name}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "6" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        시작(착수)일
                    </label>
                    <div className="read-only-input">
                        {dateUtil.format(data.project_stdt)}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "7" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        PM
                    </label>
                    <div className="read-only-input">
                        {data.job_pm_nm}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "8" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        고객사
                    </label>
                    <div className="read-only-input">
                        {data.comp_name}
                    </div>
                </div>
            </div>

            {/* 두번째 열 */}
            <div className="form-control text-none-border" style={{ gridColumn: "2", gridRow: "2" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        진행상태
                    </label>
                    <div className="read-only-input">
                        {data.project_state_nm}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "2", gridRow: "3" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        프로젝트 명
                    </label>
                    <div className="read-only-input">
                        {data.project_nm}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "2", gridRow: "4" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        사업소
                    </label>
                    <div className="read-only-input">
                        {data.project_loc_name}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "2", gridRow: "5" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        프로젝트 유형
                    </label>
                    <div className="read-only-input">
                        {data.project_type_nm}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "2", gridRow: "6" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        종료(예정)일
                    </label>
                    <div className="read-only-input">
                        {dateUtil.format(data.project_eddt)}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "2", gridRow: "7" }}>
                <div className="text-overflow">
                    <label className="detail-text-label">
                        PE
                    </label>
                    <div className="read-only-input">
                        {peTextJoin()}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "2", gridRow: "8" }}>
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