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
                const siteDate = site.site_date;
                const orderCompName = originalOrderCompName
                .replaceAll("(주)", "")
                .replaceAll("㈜", "")
                .replaceAll("주식회사", "");
                const hasDailyItem = !!projectList?.[0]?.daily_content_list;
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
    }
}

export default SiteReducer;