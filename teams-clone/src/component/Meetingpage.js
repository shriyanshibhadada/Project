import { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory, useParams } from 'react-router-dom';
import Peer from 'simple-peer';
import { postRequest, getRequest } from '../utils/RequestApis';
import io from 'socket.io-client';

let peer = null;
const socket = io.connect("http://localhost:5000");

const Meetingpage = () => {

    const history = useHistory();
    let { id } = useParams();
    const isAdmin = window.location.hash === "#init" ? true : false;
    const url = `${window.location.origin}${window.location.pathname}`;
    const myVideo = useRef();
    const userVideo = useRef();

    const [streamObj, setStreamObj] = useState();
    const [isAudio, setIsAudio] = useState(true);

    useEffect(() => {
        initWebRTC();
        socket.on("code", (data) => {
            peer.signal(data);
        });
    }, []);

    const BASE_URL = "http://localhost:5000";
    const SAVE_CALL_ID = "/api/save-call-id";
    const GET_CALL_ID = "/api/get-call-id";

    const getRecieversCode = async () => {
        const response = await getRequest(`${BASE_URL}${GET_CALL_ID}/${id}`);
        if (response.code) {
            peer.signal(response.code);
        }
    }

    const initWebRTC = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setStreamObj(stream);
                console.log(stream);
                myVideo.current.srcObject = stream;


                peer = new Peer({
                    initiator: isAdmin,
                    trickle: false,
                    stream: stream,
                });

                if (!isAdmin) {
                    getRecieversCode();
                }

                peer.on("signal", async (data) => {
                    if (isAdmin) {
                        let payload = {
                            id,
                            signalData: data,
                        };
                        // console.log(payload);
                        await postRequest(`${BASE_URL}${SAVE_CALL_ID}`, payload);
                    } else {
                        socket.emit("code", data, (callBackData) => {
                            console.log("code sent")
                        });
                    }
                });

                peer.on("connect", () => {
                    console.log("peer connected");
                })

                peer.on("stream", (stream) => {
                    // let video = document.querySelector("video");
                    // if ("srcObject" in video) {
                    //     video.srcObject = stream;
                    // }
                    // else {
                    //     video.src = window.URL.createObjectURL(stream);
                    // }
                    // video.play();
                    console.log(stream);
                    userVideo.current.srcObject = stream;
                });
            })
            .catch(() => {
                console.log('error');
            })
    };

    const disconnectCall = () => {
        peer.destroy();
        history.push("/");
        window.location.reload();
    };
    const changeAudio = (value) => {
        streamObj.getAudioTracks()[0].enabled = !value;
        setIsAudio(!value);
    };

    return (
        <div className="container">
            
            <div className="row">
                <div className="col-6" >
                    {/* my vid */}
                    <video playsInline muted ref={myVideo} autoPlay />
                    {/* <myvideo src="" controls></myvideo>  */}
                </div>
                <div className="col-6">
                    {/* user vid */}
                    {/* <video src="" controls></video> */}
                    <video playsInline ref={userVideo} autoPlay />
                </div>
            </div>
            <div className="row justify-content-md-center">
            <div className = "col-md-auto">
                    <button onClick={() => changeAudio(isAudio)} className="btn btn-danger">{isAudio ? `Mute Audio` :  `Unmute Audio`}</button>
                </div>
                <div className = "col-md-auto">
                    <button onClick={disconnectCall} className="btn btn-danger">Leave Call</button>
                </div>
            </div>
        </div>
    );
}

export default Meetingpage;