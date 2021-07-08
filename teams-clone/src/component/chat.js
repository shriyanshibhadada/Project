import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';
import 'bootstrap/dist/css/bootstrap.min.css';


const Chat = ({ display, roomId }) => {

    const currentUser = sessionStorage.getItem('user');//user name
    const [msg, setMsg] = useState([]);// msg list
    const [tempMsg, setTempMsg] = useState([]);// temporary update of msg typed using on change
    const messagesEndRef = useRef(null);// reference to last msg for automatic scroll
    const inputRef = useRef();// change the input box to empty string when msg is send

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

    // send msg when clicked enter
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

    // send msg when clicked send button
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
        height: (window.innerHeight) * 90 / 100,
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