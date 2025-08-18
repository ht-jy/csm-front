import { ObjChk } from "../../../../../utils/ObjChk";

const SiteReducer = (state, action) => {

    switch (action.type){
        case "INIT":
            const setColor = (code) => {
                const codeList = ObjChk.ensureArray(action.code);
                const foundItem = codeList.find(item => item.code === code);
                return foundItem ? foundItem.code_color : undefined;
            }

            const sites = [];
            const total = {
                worker_count_date: 0,
                worker_count_htenc: 0,
                worker_count_manager: 0,
                worker_count_not_manager: 0,
                worker_count_safe: 0,
                worker_count_work: 0,
                equip_count: 0,
            };
            
            const siteList = Array.isArray(action.site) ? action.site : [];
            siteList.map((site, idx) => {
                const projectList = site.project_list;
                const defaultProject = Array.isArray(projectList) ? projectList.find(prj => prj.is_default === "Y") : null;
                const projectLength = Array.isArray(projectList) ? projectList.length : 0;
                const rowSpan = projectLength > 1 ? projectList?.length + 1 : 1;
                const originalOrderCompName = defaultProject?.order_comp_name ?? "";
                const siteStatsColor = setColor(site.current_site_stats);

                sites.push(
                    {...site, type: "main", rowSpan: rowSpan, originalOrderCompName: originalOrderCompName, siteStatsColor: siteStatsColor}
                );
                
                if (Array.isArray(projectList) && projectList.length > 1) {
                    projectList.forEach(item => {
                        sites.push({...item, type: "sub", is_parent_use: site.is_use}); // useSites, nonUseSite 분리하는 부분에서 작업완료된 프로젝트가 현장이 작업 완료 안됬는데 nonUseSite 때문에 부모 완료여부(is_parent_use)를 추가함
                    });
                }
            });

            const newSites = sites.map(obj => {
                if (obj.type.trim().toLowerCase() === "main") {
                    const dailyContents = [];
                    if (Array.isArray(obj.project_list)) {
                        obj.project_list.forEach(item => {
                            total.worker_count_date += item.worker_count_date;
                            total.worker_count_htenc += item.worker_count_htenc;
                            total.worker_count_manager += item.worker_count_manager;
                            total.worker_count_not_manager += item.worker_count_not_manager;
                            total.worker_count_safe += item.worker_count_safe;
                            total.worker_count_work += item.worker_count_work;
                            total.equip_count += item.equip_count;
            
                            if (Array.isArray(item.daily_content_list)) {
                                const contents = Array.isArray(item.daily_content_list) ? item.daily_content_list : [];
                                dailyContents.push(...contents);
                            }
                        });
                    }
                    return { ...obj, daily_content_list: dailyContents };
                } else {
                    const contents = (Array.isArray(obj.daily_content_list) ? obj.daily_content_list.map(item => item.content) : []);
                    return { ...obj, daily_content_list: contents };
                }
            });

            const useSites = newSites.filter(item => item.is_use === 'Y' || item?.is_parent_use === 'Y');
            const nonUseSite = newSites.filter(item => item.is_use !== 'Y' && item?.is_parent_use !== 'Y');
            
            return {...state, list: JSON.parse(JSON.stringify(useSites)), useList: JSON.parse(JSON.stringify(useSites)), nonUseList: JSON.parse(JSON.stringify(nonUseSite)), code: JSON.parse(JSON.stringify(action.code)), dailyTotalCount: JSON.parse(JSON.stringify(total))};
        case "STATS":
            const setColor2 = (code) => {
                const foundItem = state?.code?.find(item => item.code === code);
                return foundItem ? foundItem.code_color : undefined;
            }

            const stats = Array.isArray(action?.list) ? action.list : [];;
            let list = Array.isArray(state?.list) ? state.list : [];
            list = list?.map(site => {
                const matchingItem = stats.find(item => site.sno === item.sno);
                if (matchingItem) {
                    return { ...site, siteStatsColor: setColor2(matchingItem.current_site_stats) };
                }
                return site;
            });

            return {...state, list: JSON.parse(JSON.stringify(list))};
        case "COUNT":
            const count = Array.isArray(action?.list) ? action.list : [];
            let list2 = state.list;
            const total2 = {
                worker_count_date: 0,
                worker_count_htenc: 0,
                worker_count_manager: 0,
                worker_count_not_manager: 0,
                worker_count_safe: 0,
                worker_count_work: 0,
                equip_count: 0,
            };
            list2 = list2?.map(site => {
                if(site.type === "main"){
                    const matchingItems = count.filter(item => item.sno === site.sno);
                    site.project_list.map(item => {
                        const matchingItem = matchingItems.find(obj => obj.jno === item.jno);
                        if (matchingItem){
                            item.worker_count_all = matchingItem.worker_count_all;
                            item.worker_count_date = matchingItem.worker_count_date;
                            item.worker_count_htenc = matchingItem.worker_count_htenc;
                            item.worker_count_manager = matchingItem.worker_count_manager;
                            item.worker_count_not_manager = matchingItem.worker_count_not_manager;
                            item.worker_count_safe = matchingItem.worker_count_safe;
                            item.worker_count_work = matchingItem.worker_count_work;
                            
                            total2.worker_count_date += matchingItem.worker_count_date;
                            total2.worker_count_htenc += matchingItem.worker_count_htenc;
                            total2.worker_count_manager += matchingItem.worker_count_manager;
                            total2.worker_count_not_manager += matchingItem.worker_count_not_manager;
                            total2.worker_count_safe += matchingItem.worker_count_safe;
                            total2.worker_count_work += matchingItem.worker_count_work;
                            total2.equip_count += matchingItem.equip_count;
                        }
                        return item;
                    })
                }else{
                    const matchingItem = count.find(obj => obj.jno === site.jno);
                    if (matchingItem) {
                        site.worker_count_all = matchingItem.worker_count_all;
                        site.worker_count_date = matchingItem.worker_count_date;
                        site.worker_count_htenc = matchingItem.worker_count_htenc;
                        site.worker_count_manager = matchingItem.worker_count_manager;
                        site.worker_count_not_manager = matchingItem.worker_count_not_manager;
                        site.worker_count_safe = matchingItem.worker_count_safe;
                        site.worker_count_work = matchingItem.worker_count_work;
                    }
                }
                return site;
            });
            
            return {...state, list: JSON.parse(JSON.stringify(list2)), dailyTotalCount: JSON.parse(JSON.stringify(total2))};
        
        case "WEATHER" :
            const weathers = [];
            const weatherList = Array.isArray(action?.list) ? action.list : [];
            weatherList.map(item => {
                if(item.weather.length !== 0){
                    weathers.push(item);

                }
            });
            return {...state, dailyWeather: structuredClone(weathers)};

        case "USE_LIST":
            return {...state, list: state.useList};
        case "NON_USE_LIST":
            return {...state, list: state.nonUseList};

        default:
            return state;
    }
}

export default SiteReducer;