import {ObjChk} from "../../../../../utils/ObjChk";

const SiteReducer = (state, action) => {

    switch (action.type){
        case "INIT":
            const setColor = (code) => {
                const foundItem = action.code.find(item => item.code == code);
                return foundItem ? foundItem.code_color : undefined;
            }

            const sites = [];
            action.site.map((site, idx) => {
                const projectList = site.project_list;
                const defaultProject = projectList?.find((prj) => prj.is_default === "Y");
                const projectLength = projectList?.length;
                const rowSpan = projectLength > 1 ? projectList?.length + 1 : 1;
                const originalOrderCompName = defaultProject?.order_comp_name ?? "";
                // const siteDate = site.site_date;
                // const orderCompName = originalOrderCompName
                // .replaceAll("(주)", "")
                // .replaceAll("㈜", "")
                // .replaceAll("주식회사", "");
                // const hasDailyItem = !!projectList?.[0]?.daily_content_list;
                const siteStatsColor = setColor(site.current_site_stats);

                sites.push(
                    {...site, type: "main", rowSpan: rowSpan, originalOrderCompName: originalOrderCompName, siteStatsColor: siteStatsColor}
                );
                
                if(projectList.length > 1){
                    projectList.map(item => {
                        sites.push({...item, type: "sub"});
                    })
                }
            });
            
            return {...state, list: JSON.parse(JSON.stringify(sites)), code: JSON.parse(JSON.stringify(action.code))};
        case "STATS":
            const setColor2 = (code) => {
                const foundItem = state.code.find(item => item.code == code);
                return foundItem ? foundItem.code_color : undefined;
            }

            const stats = action.list;
            let list = state.list;
            list = list?.map(site => {
                const matchingItem = stats.find(item => site.sno === item.sno);
                if (matchingItem) {
                    return { ...site, siteStatsColor: setColor2(matchingItem.current_site_stats) };
                }
                return site;
            });

            return {...state, list: JSON.parse(JSON.stringify(list))};
        case "COUNT":
            const count = action.list;
            let list2 = state.list;
            list2 = list2?.map(site => {
                if(site.type === "main"){
                    const matchingItems = count.filter(item => item.sno === site.sno);
                    site.project_list.map(item => {
                        const matchingItem = matchingItems.find(obj => obj.jno === item.jno);
                        item.worker_count_all = matchingItem.worker_count_all;
                        item.worker_count_date = matchingItem.worker_count_date;
                        item.worker_count_htenc = matchingItem.worker_count_htenc;
                        item.worker_count_manager = matchingItem.worker_count_manager;
                        item.worker_count_not_manager = matchingItem.worker_count_not_manager;
                        item.worker_count_safe = matchingItem.worker_count_safe;
                        item.worker_count_work = matchingItem.worker_count_work;
                        return item;
                    })
                }else{
                    const matchingItem = count.find(obj => obj.jno === site.jno);
                    site.worker_count_all = matchingItem.worker_count_all;
                    site.worker_count_date = matchingItem.worker_count_date;
                    site.worker_count_htenc = matchingItem.worker_count_htenc;
                    site.worker_count_manager = matchingItem.worker_count_manager;
                    site.worker_count_not_manager = matchingItem.worker_count_not_manager;
                    site.worker_count_safe = matchingItem.worker_count_safe;
                    site.worker_count_work = matchingItem.worker_count_work;
                }
                return site;
            });

            return {...state, list: JSON.parse(JSON.stringify(list2))};
    }
}

export default SiteReducer;