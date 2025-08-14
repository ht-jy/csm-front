import { ObjChk } from "./ObjChk";

export const Common = {
    // 핸드폰 번호 검증
    isValidMobileNumber(phoneNumber) {
        // 허용되는 문자: 숫자, '-'와 '.'만 가능
        if (!/^[0-9.-]+$/.test(phoneNumber)) {
            return false;
        }

        // 구분자('-', '.') 제거
        const cleaned = phoneNumber.replace(/[-.]/g, '');

        // 번호 검증
        if (cleaned.startsWith("010")) {
            // 010으로 시작하는 경우: 반드시 11자리여야 함
            if (!/^010\d{8}$/.test(cleaned)) {
                return false;
            }
        } else if (cleaned.startsWith("011") || cleaned.startsWith("016") || cleaned.startsWith("017") || cleaned.startsWith("018") || cleaned.startsWith("019")) {
            // 011, 016, 017, 018, 019로 시작하는 경우: 10자리 또는 11자리 가능
            if (!/^01(?:1|6|7|8|9)\d{7,8}$/.test(cleaned)) {
                return false;
            }
        }else {
            return false;
        }

        return true;
    },
    // '-'으로 핸드폰번호 포맷
    formatMobileNumber(phoneNumber) {
        if(phoneNumber === null) return "";

        const numbers = phoneNumber.replace(/\D/g, '');

        let formatted = '';

        // 숫자의 길이에 따라 다른 포맷 적용
        if (numbers.length < 4) {
            // 숫자가 3자리 이하이면 그대로 반환
            formatted = numbers;
        } else if (numbers.length < 7) {
            // 4~6자리: 예) 010-123
            formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
        } else if (numbers.length <= 10) {
            // 7~10자리: 예) 010-123-4567 (10자리의 경우)
            formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 6) + '-' + numbers.slice(6);
        } else {
            // 11자리 이상: 예) 010-1234-5678 (11자리의 경우; 초과된 자리수는 무시)
            formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
        }

        return formatted;
    },
    // 주민번호인지 검증
    isValidResidentNumber(jumin) {
        // 허용되는 문자: 숫자와 '-' 만 가능
        if (!/^[0-9-]+$/.test(jumin)) {
            return false;
        }

        // '-'가 포함되어 있으면, 반드시 6번째 인덱스(앞자리 6자리 뒤)에 위치해야 함
        if (jumin.includes('-') && jumin.indexOf('-') !== 6) {
            return false;
        }

        // '-'를 제거한 후 총 13자리 숫자인지 확인
        const cleaned = jumin.replace(/-/g, '');
        if (!/^\d{13}$/.test(cleaned)) {
            return false;
        }

        // 생년월일 검증
        const yy = parseInt(cleaned.slice(0, 2), 10);
        const mm = parseInt(cleaned.slice(2, 4), 10);
        const dd = parseInt(cleaned.slice(4, 6), 10);
        const genderCode = parseInt(cleaned.charAt(6), 10);

        // 성별/세기 코드를 통해 전체 연도 결정  
        // 1,2,5,6: 1900년대, 3,4,7,8: 2000년대 (다른 숫자는 유효하지 않음)
        let fullYear;
        if ([1, 2, 5, 6].includes(genderCode)) {
            fullYear = 1900 + yy;
        } else if ([3, 4, 7, 8].includes(genderCode)) {
            fullYear = 2000 + yy;
        } else {
            return false;
        }

        // 유효한 날짜인지 확인
        const birthDate = new Date(fullYear, mm - 1, dd);
        if (
            birthDate.getFullYear() !== fullYear ||
            birthDate.getMonth() !== mm - 1 ||
            birthDate.getDate() !== dd
        ) {
            return false;
        }

        // 체크섬 검증
        // 가중치: 2,3,4,5,6,7,8,9,2,3,4,5
        const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleaned.charAt(i), 10) * weights[i];
        }
        const mod = sum % 11;
        const checkDigit = (11 - mod) % 10;

        if (checkDigit !== parseInt(cleaned.charAt(12), 10)) {
            return false;
        }

        return true;
    },
    // 주민번호 
    residentNumber(jumin) {
        if(ObjChk.all(jumin)) return "";

        let cleaned = jumin.replace(/[^0-9*]/g, '');

        // 주민번호 최대 길이 13자리로 제한
        if (cleaned.length > 13) {
            cleaned = cleaned.slice(0, 13);
        }

        // 생년월일(6자리) 미만이면 그대로 반환
        if (cleaned.length < 7) {
            return cleaned;
        }

        const birth = cleaned.slice(0, 6);
        const remainder = cleaned.slice(6);

        return `${birth}-${remainder}`;
    },
    // 주민번호 마스킹
    maskResidentNumber(jumin) {
        if(ObjChk.all(jumin)) return "";

        // 모든 숫자가 아닌 문자는 제거
        let cleaned = jumin.replace(/[^0-9*]/g, '');

        if (cleaned.length > 13) {
            cleaned = cleaned.slice(0, 13);
        }

        // 생년월일(6자리) 미만이면 그대로 반환
        if (cleaned.length < 7) {
            return cleaned;
        }

        // 6자리보다 길면 앞 6자리는 그대로, 그 이후 첫 자리는 노출, 나머지는 마스킹 처리
        const birth = cleaned.slice(0, 6);
        const remainder = cleaned.slice(6);

        const visible = remainder.charAt(0);
        const masked = '*'.repeat(remainder.length > 1 ? remainder.length - 1 : 0);

        return `${birth}-${visible}${masked}`;
    },
    // 주민번호 마스킹(뒷자리)
    maskResidentBackNumber(jumin) {
        if(ObjChk.all(jumin)) return "";

        // 모든 숫자가 아닌 문자는 제거
        let cleaned = jumin.replace(/[^0-9*]/g, '');

        if (cleaned.length > 7) {
            cleaned = cleaned.slice(0, 7);
        }

        // 6자리보다 길면 앞 6자리는 그대로, 그 이후 첫 자리는 노출, 나머지는 마스킹 처리
        const visible = cleaned.charAt(0);
        const masked = '*'.repeat(cleaned.length > 1 ? cleaned.length - 1 : 0);

        return `${visible}${masked}`;
    },
    // 특정길이 반환
    clipToMaxLength(size, str){
        if(typeof size === Number){
            return str;
        }

        if(str.length > size){
            return str.slice(0, size);
        }else{
            return str;
        }
    },
    // 숫자 천 단위 ','
    formatNumber(input) {
        if (input === undefined || input === null) {
            return "";
        }

        let str = typeof input === "number" ? input.toString() : input;
        let numericStr = str.replace(/\D/g, "");

        if (numericStr === "") {
            return "";
        }

        if (numericStr !== "0") {
            numericStr = numericStr.replace(/^0+/, "");
            if (numericStr === "") {
                numericStr = "0";
            }
        }

        return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    sanitizeNumberInput(input) {
        let inputStr = String(input);
        let sanitized = inputStr.replace(/\D/g, '');

        if (sanitized === '') {
            return 0;
        }

        if (sanitized.length > 1) {
            sanitized = sanitized.replace(/^0+/, '');
        }

        let numberValue = parseInt(sanitized, 10);

        numberValue = Math.min(Math.max(numberValue, 0), 100);

        return numberValue;
    },
    // 숫자 n자리까지만 허용
    limitDigits(value, maxDigits) {
        const str = String(value).replace(/\D/g, "");
        return str.slice(0, maxDigits);
    },
    // 숫자 자릿수 고정, 0으로 채우기
    fillZeroNumber(num, length) {
        if (ObjChk.all(length) ){
            return num
        }
        return String(num).padStart(length, '0');   
    },
    // 영문스펠링 한글로 치환. 영문만 변환하고 나머지는 그대로 반환
    spellToHangul(str = "") {
        return str.split("").map(ch => /[a-zA-Z]/.test(ch) ? alphabetToHangul[ch.toLowerCase()] || ch : ch).join("");
    },
    // 주민등록번호 -> 생년월일로 변환
    regNoToBirth(input) {
        const digits = (input ?? "").replace(/\D/g, ""); // 숫자만
        if (digits.length < 6) return "";                // 6자리 미만이면 공백

        const yy = digits.slice(0, 2);
        const mm = digits.slice(2, 4);
        const dd = digits.slice(4, 6);

        // 7번째 자리(성별 코드) 사용
        let century = "";
        if (digits.length >= 7) {
            const s = digits[6];
            if ("1256".includes(s)) century = "19"; // 1900~1999
            else if ("3478".includes(s)) century = "20"; // 2000~2099
            else if ("90".includes(s)) century = "18"; // 1800~1899
        }

        // 없으면 현재 연도 기준 추정 (규칙: yy > yyNow ? 19 : 20)
        if (!century) {
            const yyNow = new Date().getFullYear() % 100;
            const yyNum = Number(yy);
            century = yyNum > yyNow ? "19" : "20";
        }

        return `${century}${yy}-${mm}-${dd}`;
    }
} 

const alphabetToHangul = {
  a: "에이", b: "비", c: "씨", d: "디", e: "이",
  f: "에프", g: "지", h: "에이치", i: "아이", j: "제이",
  k: "케이", l: "엘", m: "엠", n: "엔", o: "오",
  p: "피", q: "큐", r: "알", s: "에스", t: "티",
  u: "유", v: "브이", w: "더블유", x: "엑스", y: "와이", z: "지"
};