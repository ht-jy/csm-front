import { useState, useEffect, useCallback, useRef } from "react";
import { Axios } from "../axios/Axios";

/**
 * @description:
 * - 지정된 API URL에 대해 캐시 기반으로 데이터 호출
 * - 자동 또는 수동 요청, 요청 지연, 콜백 등을 지원하는 커스텀 훅
 * @author 작성자: 김진우
 * @created 작성일: 2025-07-29
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @modified Description: 
 * -
 * 
 * @param 
 * url {string}: api url
 * options {object}: 설정 옵션 객체
 * - storageKey {string, default: url}: 캐시에 사용할 키
 * - useSession {boolean, default: false}: sessionStorage를 사용할지 여부 -> false면 localStorage 사용
 * - enabled {boolean, default: true}: 훅 전체를 활성화할지 여부. false로 설정하면 캐시 로딩, 자동 요청, refetch 등 모든 요청 동작이 비활성화. 조건이 충족될 때만 데이터를 요청하고 싶을 때 사용
 * - useCache {boolean, default: true}: 캐시를 사용할지 여부 -> false면 캐시 무시 및 저장 안함
 * - autoRequest {boolean, default: true}: 마운트 시 자동으로 API 요청을 보낼지 여부. false일 경우 refetch()을 이용하여 수동으로 요청을 해야 함.
 * - delaySecondsAfterCache {number, default: 0}: 캐시가 있을 경우 마운트 후 API 요청을 몇 초 지연할지
 * - refetchDelaySeconds {number, default: 0}: refetch() 호출 시 API 요청을 몇 초 지연할지
 * - onCacheLoad {function}: 화면 진입시 캐시데이터로 실행할 콜백 함수 -> 저장된 캐시데이터를 받음
 * - onBeforeRequest {function}: 요청 실행 전 실행할 콜백 함수 -> 실행시점의 캐시여부(boolean)를 받음
 * - onSuccess {function}: 요청 성공 후 실행할 콜백 함수 -> res 인자를 받음
 * - onError {function}: 요청 실패 시 실행할 콜백 함수 -> err 인자를 받음
 * - onFinally {function}: 요청 마무리 후 실행할 콜백 함수 -> 실행시점의 캐시여부(boolean)를 받음
 * 
 * @returns
 * - cacheData {any}: 현재 화면에 표시할 데이터 (캐시 또는 최신)
 * - isStale {boolean}: 현재 데이터가 캐시인지 여부
 * - isFetchedLoading {boolean}: 요청이 진행 중인지 여부
 * - refetch {function}: 수동으로 API를 재요청할 수 있는 함수
 */

// 최신 요청을 관리하기 위한 전역 번수
const apiRequestMap = {};

export function useCachedFetch(url, options = {}) {
    // 옵션 설정
    const {
        storageKey = url,                // 캐시 키 (기본: url)
        useSession = false,              // 세션 스토리지 사용 여부
        enabled = true,                  // 훅 전체 활성화 여부
        useCache = true,                 // 캐시 사용 여부
        autoRequest = true,              // 마운트 시 자동 요청 여부
        delaySecondsAfterCache = 0,      // 캐시가 있을 경우 지연 요청 시간 (초)
        refetchDelaySeconds = 0,         // refetch 호출 시 지연 요청 시간 (초)
        onCacheLoad = () => {},          // 화면 진입시 캐시를 이용하여 실행할 콜백 함수
        onBeforeRequest = () => {},      // 호출 직전에 실행 콜백 함수
        onSuccess = () => {},            // 성공 콜백 함수
        onError = () => {},              // 실패 콜백 함수
        onFinally = () => {},            // 호출 마무리 후 실행 콜백 함수
    } = options;

    const [cacheData, setCacheData] = useState(null);          // 최종 데이터
    const [isStale, setIsStale] = useState(false);   // 캐시 여부
    const [isFetchedLoading, setIsFetchedLoading] = useState(true); // 로딩 상태

    const isMounted = useRef(true);                                      // 컴포넌트 언마운트 확인용
    const storage = useSession ? sessionStorage : localStorage;          // 저장소 결정

    // onSuccess/onError/onBeforeRequest/onFinally 참조 최신화
    const beforeRequestRef = useRef(onBeforeRequest);
    const successRef = useRef(onSuccess);
    const errorRef = useRef(onError);
    const finallyRef = useRef(onFinally);
    useEffect(() => {
        successRef.current = onSuccess;
    }, [onSuccess]);
    useEffect(() => {
        errorRef.current = onError;
    }, [onError]);
    useEffect(() => {
        beforeRequestRef.current = onBeforeRequest;
    }, [onBeforeRequest]);
    useEffect(() => {
        finallyRef.current = onFinally;
    }, [onFinally]);

    // url에서 엔드포인트만 추출
    const apiKey = url?.split("?")[0];

    // 공통 API 요청 함수 (자동/수동에서 모두 사용)
    const fetchData = useCallback(async (isCache = false, saveCache = true, isRefetch = false) => {
        setIsFetchedLoading(true);

        // 엔드포인트별 요청번호 증가
        if (!apiRequestMap[apiKey]) apiRequestMap[apiKey] = 1;
        else apiRequestMap[apiKey]++;
        const myRequestId = apiRequestMap[apiKey];

        try {
            // 호출전 실행 콜백
            beforeRequestRef.current({ isCache, isRefetch });

            const res = await Axios.GET(url); 

            // 최신 요청 응답이 아니면 중단
            if (myRequestId !== apiRequestMap[apiKey]) return;

            // 언마운트시 중단
            if (!isMounted.current) return;

            const result = res ?? null;
            setCacheData(result);
            setIsStale(false);

            if (useCache && saveCache) {
                // 캐시 저장
                storage.setItem(storageKey, JSON.stringify(result));
            }

            // 성공 콜백
            successRef.current(result);
        } catch (err) {
            if (myRequestId !== apiRequestMap[apiKey]) return;
            if (!isMounted.current) return;
            

            // 실패 콜백
            errorRef.current(err);
        } finally {
            if (myRequestId !== apiRequestMap[apiKey]) return;
            if (!isMounted.current) return;
            // 호출 마무리 실행 콜백
            setIsFetchedLoading(false);
            finallyRef.current({ isCache, isRefetch });
        }
    }, [url, storageKey, storage, useCache]);

    // 외부에서 호출 가능한 수동 요청 함수
    const refetch = useCallback((saveCache = true, isDelay = true) => {
        if(!isDelay) {
            fetchData(true, saveCache, true);
            return;
        }
        const delayMs = refetchDelaySeconds > 0 ? refetchDelaySeconds * 1000 : 0;
        setTimeout(() => {
            if (enabled) fetchData(true, saveCache, true);
        }, delayMs);
    }, [fetchData, enabled, refetchDelaySeconds]);

    const lastCacheKeyRef = useRef(null);

    // 마운트 시 자동 요청 처리
    useEffect(() => {
        isMounted.current = true;

        if (!enabled || !autoRequest) {
            setIsFetchedLoading(false);
        }

        let hasCache = false;

        // 캐시 불러오기
        if (useCache) {
            const cached = storage.getItem(storageKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setCacheData(parsed);
                    setIsStale(true);
                    setIsFetchedLoading(false);
                    hasCache = true;
                    
                    if (lastCacheKeyRef.current !== storageKey) {
                        lastCacheKeyRef.current = storageKey;
                        onCacheLoad(parsed); // ★ 딱 한 번만 실행!
                    }
                } catch (e) {
                    // ...
                }
            }
        }

        if (!enabled || !autoRequest) {
            return;
        }

        // 캐시가 있으면 delay 후 요청, 없으면 바로 요청
        const delayMs = hasCache && delaySecondsAfterCache > 0 ? delaySecondsAfterCache * 1000 : 0;

        let timer;
        if (delayMs > 0) {
            timer = setTimeout(() => {
                fetchData(hasCache, true, false);
            }, delayMs);
        } else {
            fetchData(hasCache, true, false); // 즉시 실행
        }

        return () => {
            isMounted.current = false;
            clearTimeout(timer);
        };
    }, [url, enabled, autoRequest, useCache, delaySecondsAfterCache, fetchData, storageKey, storage]);

    return {cacheData, isStale, isFetchedLoading, refetch};
}