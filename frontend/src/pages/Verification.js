import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const Verification = () => {
    const token = useParams().token;

    const navigate = useNavigate();
    
    useEffect(() => {
        const verifyUser = async () => {
            if (token.length > 1) {
                try {
                    // Change to GET request instead of POST
                    await axiosInstance.get(`/auth/verify-email/${token}`);
                    navigate('/login');
                } catch (error) {
                    navigate('/login')
                }
            }
        };
        verifyUser();
    }, [token, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
        </div>
    );
};

export default Verification;
