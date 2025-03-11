import ReactDOM from 'react-dom';

/**
 * @description: 통합검색 검색키워드를 검색창이랑 다른 위치에 분리하기 위한 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-11
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @additionalInfo
 */
const KeywordPortal = ({ children }) => {
  const container = document.getElementById('search-keyword-portal');
  if (!container) return null;
  return ReactDOM.createPortal(children, container);
};

export default KeywordPortal;
