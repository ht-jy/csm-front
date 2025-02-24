const CompanyReducer = (state, action) => {
    switch (action.type) {
        case "INIT":
            return;
        case "PROJECT":
            const projectList = [];
            action.list.map(item => {
                projectList.push({value:item.jno, label:item.project_nm});
            })

            return {...state, projectList: JSON.parse(JSON.stringify(projectList))};
    }
}
export default CompanyReducer;