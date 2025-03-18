import { format, parseISO } from 'date-fns';

export const dateUtil = {
    // "yyyy-MM-dd" 및 특정 형태로 반환
    format(date, formatStr = "yyyy-MM-dd") {
        if (!date) return "-"; // 빈 값 처리
        if (date === "0001-01-01T00:00:00Z") return "-"; // 특정 날짜 처리
    
        try {
            return format(new Date(date), formatStr);
        } catch (error) {
            return "-";
        }
    },
    // "yyyy-MM-dd'\n'HH:mm:ss" 시,분,초까지 반환. 시,분,초는 줄내림
    formatWithTime(date) {
        if (!date) return "-";
        if (date === "0001-01-01T00:00:00Z") return "-";
        try {
            const parsedDate = parseISO(date); // ISO 8601 형식 변환
            return format(parsedDate, "yyyy-MM-dd'\n'HH:mm:ss"); // 줄바꿈 포함된 포맷
        } catch (error) {
            return "-";
        }
    },
    // "yyyy-MM-dd"형태의 현재시간 date 객체 반환
    now(formatStr = "yyyy-MM-dd") {
        return format(new Date(), formatStr);
    },
    // date객체로 변환
    parseToDate(dateStr) {
        if (!dateStr) return null;
        try {
            return parseISO(dateStr);
        } catch (error) {
            return null;
        }
    },
    // go의 date 포맷으로 변경 ("yyyy-MM-dd"의 경우에)
    parseToGo(dateStr) {
        if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return "0001-01-01T00:00:00Z";
        try {
            return format(dateStr, "yyyy-MM-dd") + "T00:00:00+09:00"  

        }catch (error){
            return "0001-01-01T00:00:00Z";
        }

    },
    // go의 date 기준으로 값이 있는지 없는지 체크
    isDate(date) {
        if (date === "0001-01-01T00:00:00Z") return false;
        return true;
    }
}