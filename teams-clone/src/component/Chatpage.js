import { useHistory } from 'react-router-dom';
import { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Peer from 'simple-peer';
import React from 'react';
import 'font-awesome/css/font-awesome.min.css'
import './style.css';
import random from 'random-name';
import Chat from "./chat";
import socket from '../socket';


const Meetingpage = (props) => {

    const history = useHistory();
    const url = `${window.location.origin}/${window.location.pathname.split('/')[1]}`;
    const roomId = props.match.params.id;
    var currentUser = sessionStorage.getItem('user');
    if (!currentUser) {
        currentUser = random.first();
        sessionStorage.setItem('user', currentUser);
    }
    const [peers, setPeers] = useState([]);
    const [userVideoAudio, setUserVideoAudio] = useState({
        localUser: { video: true, audio: true },
    });
    const [displayChat, setDisplayChat] = useState(false);
    const peersRef = useRef([]);



    useEffect(() => {

        window.addEventListener('popstate', goToBack);

        socket.emit('BE-join-room', { roomId, userName: currentUser });
        socket.on('FE-user-join', (users) => {
            // all users
            const peers = [];
            users.forEach(({ userId, info }) => {
                let { userName, video, audio } = info;
                // console.log(userName);
                if (userName !== currentUser) {
                    const peer = createPeer(userId, socket.id);
                    // console.log(currentUser);
                    // console.log(UserName);
                    peer.userName = userName;
                    peer.peerID = userId;

                    peersRef.current.push({
                        peerID: userId,
                        peer,
                        userName,
                    });
                    peers.push(peer);

                    setUserVideoAudio((preList) => {
                        return {
                            ...preList,
                            [peer.userName]: { video, audio },
                        };
                    });
                }
            });

            setPeers(peers);
        });

        socket.on('FE-receive-call', ({ signal, from, info }) => {
            let { userName, video, audio } = info;
            const peerIdx = findPeer(from);

            if (!peerIdx) {
                const peer = addPeer(signal, from);

                peer.userName = userName;

                peersRef.current.push({
                    peerID: from,
                    peer,
                    userName: userName,
                });
                setPeers((users) => {
                    return [...users, peer];
                });
                setUserVideoAudio((preList) => {
                    return {
                        ...preList,
                        [peer.userName]: { video, audio },
                    };
                });
            }
        });

        socket.on('FE-call-accepted', ({ signal, answerId }) => {
            const peerIdx = findPeer(answerId);
            peerIdx.peer.signal(signal);
        });

        socket.on('FE-user-leave', ({ userId, userName }) => {
            const peerIdx = findPeer(userId);
            peerIdx.peer.destroy();
            setPeers((users) => {
                users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
                return [...users];
            });
        });


        socket.on('FE-toggle-camera', ({ userId, switchTarget }) => {
            const peerIdx = findPeer(userId);

            setUserVideoAudio((preList) => {
                let video = preList[peerIdx.userName].video;
                let audio = preList[peerIdx.userName].audio;

                if (switchTarget === 'video') video = !video;
                else audio = !audio;

                return {
                    ...preList,
                    [peerIdx.userName]: { video, audio },
                };
            });
        });

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line
    }, []);

    function createPeer(userId, caller) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            
        });

        peer.on('signal', (signal) => {
            socket.emit('BE-call-user', {
                userToCall: userId,
                from: caller,
                signal,
            });
        });
        peer.on('disconnect', () => {
            peer.destroy();
        });

        return peer;
    }

    function addPeer(incomingSignal, callerId) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            
        });

        peer.on('signal', (signal) => {
            socket.emit('BE-accept-call', { signal, to: callerId });
        });

        peer.on('disconnect', () => {
            peer.destroy();
        });

        peer.signal(incomingSignal);

        return peer;
    }

    function findPeer(id) {
        return peersRef.current.find((p) => p.peerID === id);
    }

    const goToBack = (e) => {
        e.preventDefault();
        socket.emit('BE-leave-room', { roomId, leaver: currentUser });
        sessionStorage.removeItem('user');
        window.location.href = '/';
    };

    const continuemeet = () => {
        var userName = sessionStorage.getItem('user');
        const roomName = window.location.pathname.split('/')[1];
        props.history.push(`/${roomName}/${userName}`);
        window.location.reload();
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
                <div className="col-12" style={fullheight}>
                    <Chat display={displayChat} roomId={roomId} />
                    <button type="button" class="btn btn-outline-secondary" onClick={() => navigator.clipboard.writeText(url)} >Copy Invite Link</button>
                    <button type="button" class="btn btn-outline-success" onClick={continuemeet}>Join Video call</button>
                    <button type="button" class="btn btn-outline-danger" onClick={goToBack}>Leave Call</button>
                </div>
            </div>
        </div>
    );
}

export default Meetingpage;