import { createContext, useContext } from "react";

const TableContext = createContext({
    setCheckedList: () => {},
    nonEditSelect: {},
});

export const TableProvider = ({children, setCheckedList, nonEditSelect}) => {

    return(
        <TableContext.Provider value={{setCheckedList, nonEditSelect}}>
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