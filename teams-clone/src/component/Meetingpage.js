import { useEffect, useReducer, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory, useParams } from 'react-router-dom';
import Peer from 'simple-peer';
import { postRequest, getRequest } from '../utils/RequestApis';
import io from 'socket.io-client';

let peer = null;
const initialState = [];
const socket = io.connect("http://localhost:5000");

const Meetingpage = () => {

    const history = useHistory();
    let { id } = useParams();
    const isAdmin = window.location.hash == "#init" ? true : false;
    const url = `${window.location.origin}${window.location.pathname}`;

    const [streamObj, setStreamObj] = useState();

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
                    let video = document.querySelector("video");
                    if ("srcObject" in video) {
                        video.srcObject = stream;
                    }
                    else {
                        video.src = window.URL.createObjectURL(stream);
                    }
                    video.play();
                });
            })
            .catch(() => {
                console.log('error');
            })
    };

    return (
        <div className="container">
            <video src="" controls></video>
            <div className="row">
                <div className="col-6" >
                    my vid
                    
                </div>
                <div className="col-6">
                    user vid
                </div>
            </div>
        </div>
    );
}

export default Meetingpage;