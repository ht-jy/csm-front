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
        // 010으로 시작하는 경우: 반드시 11자리여야 함
        if (cleaned.startsWith("010")) {
          if (!/^010\d{8}$/.test(cleaned)) {
            return false;
          }
        } 
        // 011, 016, 017, 018, 019로 시작하는 경우: 10자리 또는 11자리 가능
        else if (
          cleaned.startsWith("011") ||
          cleaned.startsWith("016") ||
          cleaned.startsWith("017") ||
          cleaned.startsWith("018") ||
          cleaned.startsWith("019")
        ) {
          if (!/^01(?:1|6|7|8|9)\d{7,8}$/.test(cleaned)) {
            return false;
          }
        } 
        
        else {
          return false;
        }
        
        return true;
    },
    // '-'으로 핸드폰번호 포맷
    formatMobileNumber(phoneNumber) {
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
    // 주민번호 마스킹
    maskResidentNumber(jumin) {
        // 모든 숫자가 아닌 문자는 제거
        let cleaned = jumin.replace(/[^0-9*]/g, '');

        // 주민번호 최대 길이 13자리로 제한
          if (cleaned.length > 13) {
            cleaned = cleaned.slice(0, 13);
        }

          // 생년월일(6자리) 미만이면 그대로 반환
          if (cleaned.length < 6) {
              return cleaned;
          }
          
          // 6자리이면 하이픈만 붙여서 반환 (예: "250327" -> "250327-")
          if (cleaned.length === 6) {
              return cleaned + '-';
          }
          
          // 6자리보다 길면 앞 6자리는 그대로, 그 이후 첫 자리는 노출, 나머지는 마스킹 처리
          const birth = cleaned.slice(0, 6);
          const remainder = cleaned.slice(6);

          const visible = remainder.charAt(0);
          const masked = '*'.repeat(remainder.length > 1 ? remainder.length - 1 : 0);
          
          return `${birth}-${visible}${masked}`;
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
    formatNumber(input) {
      if (input === undefined || input === null) {
          return "";
      }
      // 입력값을 문자열로 변환
      let str = typeof input === "number" ? input.toString() : input;
      // 숫자가 아닌 모든 문자 제거 (예: 알파벳, 특수문자)
      let numericStr = str.replace(/\D/g, "");
      
      // 숫자가 없으면 빈 문자열 리턴
      if (numericStr === "") {
          return "";
      }
      
      // 값이 "0" 하나인 경우는 그대로 두고, 그 외에는 앞의 불필요한 0 제거
      if (numericStr !== "0") {
          numericStr = numericStr.replace(/^0+/, "");
          // 만약 모든 숫자가 0이었다면 빈 문자열이 될 수 있으므로, 그 경우 "0"으로 설정
          if (numericStr === "") {
              numericStr = "0";
          }
      }
      
      // 천 단위 콤마 삽입
      return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
} 