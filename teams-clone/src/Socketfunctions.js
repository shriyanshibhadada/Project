import React, {createContext, useState, useRef, useEffect} from 'react';
import {io} from 'socket.io-client';
import peer from 'simple-peer';

const SocketContext = createContext();
const socket = io('http://localhost:5000');

const ContextProvider = ({children}) => {

    const [stream , setstream] = useState(null);
    const [me, setMe] = useState('');
    const [call, setcall] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');
    const myvideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(()=>{
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((currentStream) => {
                setstream(currentStream);

                myvideo.current.srcObject = currentStream;
            });

        socket.on('me', (id) => setMe(id));
        socket.on('calluser', ({from, name: callername, signal}) => {
            setcall({isRecievedCall: true, from, name: callername, signal});
        });

    }, []);

    const answercall = ()=> {
        setCallAccepted(true);

        const peer = new peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('answercall', {signal: data, to: call.from});
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    const calluser = (id) => {

        peer.on('signal', (data) => {
            socket.emit('calluser', {usertocall: id, signaldata: data, from: me, name});
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        socket.on("callaccepted", (signal) => {
            setCallAccepted(true);

            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const leavecall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();
        window.location.reload();
    };

    return (
        <SocketContext.Provider value = {{ call, callAccepted, myvideo, userVideo, stream, name, setName, callEnded, me, calluser, leavecall, answercall }}>
            {children}
        </SocketContext.Provider>
    );
};

export {ContextProvider, SocketContext};