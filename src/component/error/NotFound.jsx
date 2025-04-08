import React from 'react';
import "../../assets/css/Error.css";

const NotFound = () => {
    return(
        <div className="container">
            <section className="error-page section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3 col-12">
                            <div className="error-inner">
                                <h1>404<span>요청하신 페이지가 존재하지 않습니다.</span></h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section> 
        </div>
    );
}

export default NotFound;
