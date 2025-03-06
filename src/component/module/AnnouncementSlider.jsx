import React, { useState, useEffect } from "react";
import "../../assets/css/slider.css";
import arrorRight from "../../assets/image/arrow-right.png";
import arrorLeft from "../../assets/image/arrow-left.png";
import upAndDown from "../../assets/image/up-and-down.png";

const announcements = [
  "공지 1: 시스템 점검 예정",
  "공지 2: 신규 기능 추가",
  "공지 3: 이벤트 참여 안내",
  "공지 4: 업데이트 소식1111111111111111111111111111111111111111111111111",
];

function AnnouncementSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const resetAutoSlide = () => {
    clearInterval(window.autoSlide);
    window.autoSlide = setInterval(handleNext, 3000);
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const imageHeight = rect.height;

    if (clickY < imageHeight / 2) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
    );
    resetAutoSlide();
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    resetAutoSlide();
  };

  const handleAnnouncementClick = () => {
    alert(`현재 공지사항: ${announcements[currentIndex]}`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  return (
    <div className="announcement-slider">
      {/* 왼쪽 화살표 버튼 */}
      {/* <img
            src={arrorLeft}
            onClick={handlePrev}
            style={{ 
            width: "12px", 
            zIndex: 10, 
            cursor: "pointer",
            filter: "brightness(0) invert(1)",
            marginRight: "10px"
            }}
            alt="left arrow"
        /> */}
      <div style={{width: "30px", height: "30px", textAlign: "center", cursor: "pointer"}} onClick={handleClick}>
        <img 
          src={upAndDown}
          style={{width: "20px"}}
        />
      </div>
      
      {/* 슬라이드 텍스트 */}
      <div className="slides-container">
        <div className="slide">
          <span className="slide"
            onClick={handleAnnouncementClick}
            style={{
              cursor: "pointer",
            }}
          >
            {announcements[currentIndex]}
          </span>
        </div>
      </div>

      {/* 오른쪽 화살표 버튼 */}
      {/* <img
            src={arrorRight}
            onClick={handleNext}
            style={{ 
                width: "12px", 
                zIndex: 10, 
                cursor: "pointer",
                filter: "brightness(0) invert(1)",
                marginLeft: "10px"
            }}
            alt="right arrow"
        /> */}
    </div>
  );
}

export default AnnouncementSlider;
