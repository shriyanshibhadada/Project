import { useHistory } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import 'font-awesome/css/font-awesome.min.css'
import socket from '../socket';
import random from 'random-name';

const Landingpage = (props) => {
    const [err, setErr] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const userRef = useRef();

    useEffect(() => {
        socket.on('FE-error-user-exist', ({ error }) => {
            if (!error) {
                const temp = window.location.pathname.split('/')[1]
                const roomName = `${temp}`;
                var userName = userRef.current.value;
                if(userName == '')
                {
                    userName = random.first();
                }
                sessionStorage.setItem('user', userName);
                props.history.push(`/${roomName}/${userName}`);

            } else {
                setErr(error);
                setErrMsg('User name already exist');
            }
        });
    }, [props.history]);

    const startCall = () => {
        const roomName = `${window.location.pathname}`;
        const userName = 'fcmc5d444ccc';

        if (!roomName || !userName) {
            setErr(true);
            setErrMsg('Enter Room Name or User Name');
        } else {
            socket.emit('BE-check-user', { roomId: roomName, userName });
        }
    }


    return (
        <div className="container d-flex justify-content-center align-items-center h-100">
            {/* <!-- ======= Hero Section ======= --> */}
            <section id="hero" class="d-flex align-items-center">
                <div class="container position-relative" data-aos="fade-up" data-aos-delay="100">
                    <div class="row justify-content-center">
                        <div class="col-xl-7 col-lg-9 text-center">
                            <h1>Teams Clone</h1>
                            <h2>Click the button below to join the meeting</h2>
                        </div>
                    </div>
                    <div class="text-center">
                        <center>
                            <div class="input-name">
                                <input type="text" name="name" class="form-control" id="name" placeholder="Your Name"  ref={userRef}/>
                            </div>
                        </center>

                        <div type="button" class="btn-get-started scrollto" onClick={startCall} >Join Meeting</div>
                    </div>

                    <div class="row icon-boxes">
                        <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0" data-aos="zoom-in" data-aos-delay="200">
                            <div class="icon-box">
                                <div class="icon"><i class="fa fa-envelope"></i></div>
                                <h4 class="title"><a href="">Messaging with participants</a></h4>
                                <p class="description">Make meetings more engaging with live messaging during calls. To share files, links, and other messages with participants.</p>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0" data-aos="zoom-in" data-aos-delay="300">
                            <div class="icon-box">
                                <div class="icon"><i class="fa fa-share-square"></i></div>
                                <h4 class="title"><a href="">Screen sharing with participants</a></h4>
                                <p class="description">Present your entire screen or an application window to share presentations or collaborate on documents.</p>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0" data-aos="zoom-in" data-aos-delay="400">
                            <div class="icon-box">
                                <div class="icon"><i class="fa fa-volume-up"></i></div>
                                <h4 class="title"><a href="">Mute audio</a></h4>
                                <p class="description">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia</p>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0" data-aos="zoom-in" data-aos-delay="500">
                            <div class="icon-box">
                                <div class="icon"><i class="ri-fingerprint-line"></i></div>
                                <h4 class="title"><a href="">Nemo Enim</a></h4>
                                <p class="description">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landingpage;