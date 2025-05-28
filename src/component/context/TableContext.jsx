import { createContext, useContext } from "react";

const TableContext = createContext({
    setCheckedList: () => {},
});

export const TableProvider = ({children, setCheckedList}) => {

    return(
        <TableContext.Provider value={{setCheckedList}}>
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