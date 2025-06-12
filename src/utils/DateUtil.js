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
    // go time -> yyyy-mm-dd HH:mm 변환
    formatDateTime(value) {
        if (!value || value.trim() === "") return "-";

        const date = new Date(value);
        if (isNaN(date.getTime())) return "-"; // 유효하지 않은 날짜 예외 처리

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const mi = String(date.getMinutes()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    },
    // yyyymmdd -> Date() 변환
    formatNumericDate(numericDate) {
        const str = numericDate.toString();
        if (str.length !== 8) {
          return numericDate
        }
        const year = str.slice(0, 4);
        const month = str.slice(4, 6);
        const day = str.slice(6, 8);
        return new Date(`${year}-${month}-${day}`);
    },
    // go의 time.Time -> 'HH24:mm:ss" 반환
    formatTime24(dateString) {
        if (dateString === '0001-01-01T00:00:00Z' || dateString === '' || dateString === '-' || dateString === null) {
            return '-';
        }

        const date = new Date(dateString);
        const hours = String(dateString?.split("T")[1]?.split(":")[0] || "0").padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    },
    // go의 time.Time -> 'AM|PM HH:mm:ss" 반환
    formatTime12(dateString) {
        if (dateString === '0001-01-01T00:00:00Z' || dateString === '' || dateString === '-') {
            return '-';
        }

        const date = new Date(dateString);
        const hours24 = date.getHours();
        const meridiem = hours24 < 12 ? 'AM' : 'PM';
        let hours12 = hours24 % 12;
        let hour = hours12;
        if(Number(hours24) === 0|| Number(hours24) === 12 || Number(hours24) === 24){
            hour = "00";
        } else if(hours12 > 0 && hours12 < 10) {
            hour = "0"+hours12;
        }else{
            hour = hours12;
        }

        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${meridiem} ${hour}:${minutes}:${seconds}`;
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
    // "yyyy-MM-dd" -> go의 date 포맷으로 변경 (T23:59:59+09:00)
    parseToGo(dateStr) {
        if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return "0001-01-01T00:00:00Z";
        try {
            return format(dateStr, "yyyy-MM-dd") + "T00:00:00+09:00"  

        }catch (error){
            return "0001-01-01T00:00:00Z";
        }

    },
    // "AM|PM hh:mm:ss" -> go의 date 포맷으로 변경
    parseFormatTime12ToGo(formattedTime) {
        if (formattedTime.trim().startsWith('-')) {
            return '0001-01-01T00:00:00Z';
        }
      
        // 입력 예시: "AM 07:23:00" 또는 "PM 07:23:00"
        const regex = /^(AM|PM)\s+(\d{2}):(\d{2}):(\d{2})$/;
        const match = formattedTime.match(regex);
        if (!match) {
            throw new Error('유효하지 않은 formatted time입니다.');
        }
        const [, meridiem, hourStr, minuteStr, secondStr] = match;
        let hour = Number(hourStr);
        const minute = Number(minuteStr);
        const second = Number(secondStr);
      
        // 12시간제 -> 24시간제 변환
        if (meridiem === 'AM' && hour === 12) {
            hour = 0;
        } else if (meridiem === 'PM' && hour !== 12) {
            hour += 12;
        }
      
        // 고정 날짜 "2006-01-02"를 사용하여 Date 객체 생성
        // (월은 0부터 시작하므로 1월은 0)
        const date = new Date(2006, 0, 2, hour, minute, second, 0);
      
        // 결과 문자열 포맷팅을 위한 헬퍼: 2자리 문자열로 변환
        const pad = (num) => String(num).padStart(2, '0');
      
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hoursFormatted = pad(date.getHours());
        const minutesFormatted = pad(date.getMinutes());
        const secondsFormatted = pad(date.getSeconds());
      
        // 로컬 타임존 오프셋 계산 (분 단위)
        const offsetMinutesTotal = -date.getTimezoneOffset();
        const sign = offsetMinutesTotal >= 0 ? '+' : '-';
        const absOffset = Math.abs(offsetMinutesTotal);
        const offsetHours = pad(Math.floor(absOffset / 60));
        const offsetMinutes = pad(absOffset % 60);
      
        return `${year}-${month}-${day}T${hoursFormatted}:${minutesFormatted}:${secondsFormatted}${sign}${offsetHours}:${offsetMinutes}`;
    },
    // "hh24:mm:ss" -> go의 date 포맷으로 변경
    parseFormatTime24ToGo(formattedTime) {
        if (formattedTime.trim().startsWith('-')) {
            return '0001-01-01T00:00:00Z';
        }

        if (formattedTime === "00:00:00") {
            return '0001-01-01T00:00:00Z';
        }

        const regex = /^(\d{2}):(\d{2}):(\d{2})$/;
        const match = formattedTime.match(regex);
        if (!match) {
            return '0001-01-01T00:00:00Z';
        }
        const [, hourStr, minuteStr, secondStr] = match;
        let hour = Number(hourStr);
        let minute = Number(minuteStr);
        const second = Number(secondStr);

        if(hour > 24){
            hour = 24;
        }
        if(minute > 59){
            minute = 59;
        }

        const date = new Date(2006, 0, 2, hour, minute, second, 0);
        const pad = (num) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hoursFormatted = pad(hour);
        // const hoursFormatted = pad(date.getHours());
        const minutesFormatted = pad(date.getMinutes());
        const secondsFormatted = pad(date.getSeconds());

        const offsetMinutesTotal = -date.getTimezoneOffset();
        const sign = offsetMinutesTotal >= 0 ? '+' : '-';
        const absOffset = Math.abs(offsetMinutesTotal);
        const offsetHours = pad(Math.floor(absOffset / 60));
        const offsetMinutes = pad(absOffset % 60);
        
        return `${year}-${month}-${day}T${hoursFormatted}:${minutesFormatted}:${secondsFormatted}${sign}${offsetHours}:${offsetMinutes}`;
    },
    // go의 date 기준으로 값이 있는지 없는지 체크
    isDate(date) {
        if (date === "0001-01-01T00:00:00Z" || date === "" || date === "-") return false;
        return true;
    },
    // go의 time.Time 형식
    goTime(dateStr) {
        if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return "0001-01-01T00:00:00Z";
        
        // go의 time.Time
        const goTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
        if (goTimeRegex.test(dateStr)) {
            const dateObj = new Date(dateStr);
            const kst = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
            return kst.toISOString().replace('Z', '+09:00');
        }

        // "YYYY-MM-DD"
        const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateOnlyRegex.test(dateStr)) {
            return dateStr + "T00:00:00+09:00";
        }
        
        // JavaScript Date
        const dateObj = new Date(dateStr);
        
        if (isNaN(dateObj)) {
            return "0001-01-01T00:00:00Z";
        }
        
        const kst = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
        return kst.toISOString().replace('Z', '+09:00');
    },
    // 'YYYY-MM-DD' 형식의 문자열인이 체크
    isYYYYMMDD(dateString){
        const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateOnlyRegex.test(dateString)) {
            return true;
        }
        return false;
    },
    // 0001-01-01T00:00:00+09:00 -> hh:mm:00
    getTime(dateString){
        if (!dateString || dateString === '0001-01-01T00:00:00Z') return "00:00:00";

        if(!dateString.includes("T")) return "00:00:00";

        const t = dateString.split("T");
        if(!t[1].includes(":")) return "00:00:00";

        const time = t[1].split(":");
        if(time.length < 3) return "00:00:00";

        return `${time[0]}:${time[1]}:00`;
    }
}