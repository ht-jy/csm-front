import "../../assets/css/Error.css";
import ErrIcon from "../../assets/image/error.png";

const ErrorPage = () => {
    // return (
    //     <div>
    //         <h1>문제가 발생했습니다.</h1>
    //         <p>죄송합니다. 요청하신 서비스를 사용할 수 없습니다.</p>
    //     </div>
    // );
    return(
        <div className="container">
            <section className="error-page section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3 col-12">
                            <div className="error-inner">
                                <h1>
                                    <img style={{paddingBottom: "20px"}}
                                        src={ErrIcon}
                                    />
                                    <span>죄송합니다.<br/>요청하신 서비스를 잠시 사용할 수 없습니다.<br/>잠시후에 다시 시도하여 주세요.</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section> 
        </div>
    );
}

export default ErrorPage;
