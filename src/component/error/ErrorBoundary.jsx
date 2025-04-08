// ErrorBoundary.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // 자식 컴포넌트 렌더링 중 에러 발생 시 상태 업데이트
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // 에러 발생 후 추가적인 처리를 위한 메서드: 로깅, 에러 리포트 등
  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    // 에러 발생한 경우, /error 경로로 리디렉션
    if (this.state.hasError) {
      return <Navigate to="/error" replace />;
    }
    // 에러가 없으면 정상적으로 자식 컴포넌트 렌더링
    return this.props.children;
  }
}

export default ErrorBoundary;
