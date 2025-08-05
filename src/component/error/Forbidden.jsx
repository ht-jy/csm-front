import "../../assets/css/Error.css";
import ErrIcon from "../../assets/image/forbidden.png";

const Forbidden = () => {
    return(
        <div className="container" style={{marginTop: "40px"}}>
            <section className="error-page section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3 col-12">
                            <div className="error-inner">
                                <h1>
                                    <img style={{paddingBottom: "20px"}}
                                        src={ErrIcon}
                                    />
                                    <span>이 페이지에 접근할 권한이 없습니다.<br/>관리자에게 요청하여 주세요.</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section> 
        </div>
    );
}

export default Forbidden;
