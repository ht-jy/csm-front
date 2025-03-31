import { useEffect, useState } from "react";

function NoticeListModal({ isOpen }) {


    useEffect(() => {

    }, [isOpen])


    return (
        isOpen ?
            <div style={{ modalStyle }}>
                dpdpdd
            </div>
            :
            <></>
    )
}

export default NoticeListModal;

const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    padding: '0px',
    margin: '8vh 0px',
    backgroundColor: '#ececec',
    borderRadius: '8px',
    border: "1px solid rgba(0, 0, 0, 1)",
    maxWidth: '530px',
    width: '100%',
    maxHeight: '600px',
    height: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 100,
};
