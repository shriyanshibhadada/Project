import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import shortid from "shortid";


const Landingpage = () => {
    const history = useHistory();

    const startCall = ()=> {
        const uid = shortid.generate();
        history.push(`/${uid}#init`);
    };

    return (
        <div className = "container d-flex justify-content-center align-items-center h-100">
            <div>
            <button type="button" class="btn btn-primary" onClick = {startCall}>Start a meeting</button>
            </div>
        </div>
    ); 
};

export default Landingpage;