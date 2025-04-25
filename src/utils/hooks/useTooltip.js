// src/hooks/useTruncatedTooltip.js
import { useEffect } from "react";

/**
 * @description: 툴팁 사용 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-24
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * 
 * @additionalInfo
 * - deps: 해당 의존성이 변경될 때마다 툴팁이 다시 적용되는 변수들의 배열
 */
const useTooltip = (deps = []) => {
    const applyTooltips = () => {
        const elements = document.querySelectorAll(".ellipsis-tooltip");

        elements.forEach(el => {
            if (el.scrollWidth > el.clientWidth) {
                el.setAttribute("data-tooltip-id", "highlightTooltip");
                el.setAttribute("data-tooltip-content", el.textContent.trim());
            } else {
                el.removeAttribute("data-tooltip-id");
                el.removeAttribute("data-tooltip-content");
            }
        });
    };

    useEffect(() => {
        applyTooltips();

        window.addEventListener("resize", applyTooltips);

        return () => {
            window.removeEventListener("resize", applyTooltips);
        };
    }, deps);
};

export default useTooltip;
