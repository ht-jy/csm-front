import { createContext, useContext } from "react";

const TableContext = createContext({
    searchTime: "",
    setCheckedList: () => {},
    nonEditSelect: {},
    funcIsEditModeAddData: () => {},
});

export const TableProvider = ({children, searchTime, setCheckedList, nonEditSelect, funcIsEditModeAddData}) => {

    return(
        <TableContext.Provider value={{searchTime, setCheckedList, nonEditSelect, funcIsEditModeAddData}}>
            {children}
        </TableContext.Provider>
    );
}

export const useTableContext = () => {
    const context = useContext(TableContext);
    if (context) {
        return context;
    }
}