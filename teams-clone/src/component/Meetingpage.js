import { useEffect, useReducer, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory, useParams } from 'react-router-dom';
import Peer from 'simple-peer';
import { postRequest, getRequest } from '../utils/RequestApis';
import io from 'socket.io-client';
import React from 'react';
import { MDBIcon } from 'mdb-react-ui-kit';
// import 'mdbreact/dist/css/mdb.css';
import 'font-awesome/css/font-awesome.min.css'

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
    const [isMessenger, setIsMessenger] = useState(false);
    const [msg, setMsg] = useState("");

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

    const MessageListReducer = (state, action) => {
        let draftState = [...state];
        switch (action.type) {
            case "addMessage":
                return [...draftState, action.payload];
            default:
                return state;
        }
    };
    const [messageList, messageListReducer] = useReducer(
        MessageListReducer,
        []
    );

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

                peer.on("data", (data) => {
                    messageListReducer({
                        type: "addMessage",
                        payload: {
                            user: "Other",
                            msg: data.toString(),
                            time: Date.now(),
                        },
                    })
                });

                peer.on("stream", (stream) => {

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

    const sendmsg = (msg) => {
        peer.send(msg);
        messageListReducer({
            type: "addMessage",
            payload: {
                user: "You",
                msg: msg,
                time: Date.now(),
            },
        });
        // console.log(msg);

    }

    const changeMsg = (e) => {
        // console.log("executed");
        setMsg(e.target.value);
    }
    const sendText = () => {
        sendmsg(msg);
        setMsg("");
        post();
    }
    
    function post() {
        document.getElementById("changeToEmpty").value = ''
      }



    // css starts here
    const fullheight = {
        height: (window.innerHeight) * 95 / 100,
    };
    const topmargin = {
        marginTop: "15px",
        marginBottom: "15px"
    };
    // css ends here

    return (
        <div className="container">
            <div className="row" style={topmargin}>
                <div className="col-9">
                    <div className="row">
                        <div className="col-6" >
                            {/* my vid */}
                            <video className="h-100 w-100" playsInline muted ref={myVideo} autoPlay />
                        </div>
                        <div className="col-6">
                            {/* user vid */}
                            <video className="h-100 w-100" playsInline ref={userVideo} autoPlay />
                        </div>
                    </div>

                    <div className="row justify-content-md-center">
                        <div className="col-md-auto">
                            <button className="btn btn-info" onClick={() => navigator.clipboard.writeText(url)} >
                                <i class="fa fa-copy"></i>
                                {"   "}
                                Copy Invite Link
                            </button>
                        </div>
                        <div className="col-md-auto">
                            <button onClick={() => changeAudio(isAudio)} className="btn btn-warning">{isAudio ? `Mute Audio` : `Unmute Audio`}</button>
                        </div>
                        <div className="col-md-auto">
                            <button onClick={disconnectCall} className="btn btn-danger">Leave Call</button>
                        </div>
                    </div>
                </div>
                <div className="col-3">
                    <div className="row">
                        <div className="col-12 bg-light position-relative" style={fullheight}>
                            <div className="h-100 w-100 overflow-auto">
                                {messageList.map((item) => (
                                    <div className="card bg-white mt-1 mb-2">
                                        <h5 className="card-header">{item.user}</h5>
                                        <p className="card-body">{item.msg}</p>
                                    </div>

                                ))}
                            </div>
                            <div className="position-absolute bottom-0 start-0 w-100 ">
                                <div className="input-group">
                                    <input
                                        className="form-control"
                                        placeholder="Enter message"
                                        id="changeToEmpty"
                                        onChange={(e) => changeMsg(e) }
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                              sendText();
                                            }
                                          }}
                                    />

                                    <div className="input-group-append">
                                        <button className="btn btn-outline-secondary" onClick={sendText} >
                                            <i class="fa fa-paper-plane"></i>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Meetingpage;