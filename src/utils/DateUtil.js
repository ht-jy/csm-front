import { format } from 'date-fns';

export const dateUtil = {
    format(date, formatStr){
        if(formatStr === ""){
            formatStr = "yyyy-MM-dd";
        }
        return format(new Date(date), formatStr);
    }
}