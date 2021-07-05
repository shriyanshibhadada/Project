import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';
import 'bootstrap/dist/css/bootstrap.min.css';


const Chat = ({ display, roomId }) => {
    const currentUser = sessionStorage.getItem('user');
    const [msg, setMsg] = useState([]);
    const [tempMsg, setTempMsg] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef();

    useEffect(() => {
        socket.on('FE-receive-message', ({ msg, sender }) => {
            setMsg((msgs) => [...msgs, { sender, msg }]);
        });
    }, []);

    // Scroll to Bottom of Message List
    useEffect(() => { scrollToBottom() }, [msg])

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    const sendMessage = (e) => {
        if (e.key === 'Enter') {
            const msg = e.target.value;
            if (msg) {
                socket.emit('BE-send-message', { roomId, msg, sender: currentUser });
                inputRef.current.value = '';
            }
        }
    };

    const changeMsg = (e) => {
        const a = e.target.value;
        setTempMsg(a);
        // console.log(tempMsg);
    };

    const sendMessage2 = () => {
        console.log(tempMsg);
        const msg = tempMsg;
        if (msg) {
            socket.emit('BE-send-message', { roomId, msg, sender: currentUser });
            inputRef.current.value = '';
        }
    }

    //some css
    const fullheight = {
        height: (window.innerHeight) * 95 / 100,
    };

    return (
        <div className="row" className={display ? '' : 'width0'}>
            <div className="col-12 bg-light position-relative" style={fullheight}>
                <div className="h-100 w-100 overflow-auto">
                    {/* {console.log(msg)} */}
                    {msg &&
                        msg.map(({ sender, msg }, idx) => {
                            return (
                                <div className="card bg-white mt-1 mb-2" key={idx}>
                                    <h5 className="card-header">{sender}</h5>
                                    <p className="card-body">{msg}</p>
                                </div>
                            );
                        })}
                    <div ref={messagesEndRef} ></div>
                </div>
                <div className="position-absolute bottom-0 start-0 w-100 ">
                    <div className="input-group">
                        <input
                            ref={inputRef}
                            className="form-control"
                            placeholder="Enter message"
                            onChange={(e) => changeMsg(e)}
                            onKeyUp={sendMessage}
                        />

                        <div className="input-group-append">
                            <button className="btn btn-outline-secondary" onClick={sendMessage2} >
                                <i class="fa fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;