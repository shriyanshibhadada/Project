import React, { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
const VideoCard = (props) => {
  const ref = useRef();
  const peer = props.peer;

  useEffect(() => {
    peer.on('stream', (stream) => {
      ref.current.srcObject = stream;
    });
    peer.on('track', (track, stream) => {
    });
  }, [peer]);

  return (
    <div className="h-100 w-100">
        <video className="h-100 w-100"
          playsInline
          autoPlay
          ref={ref}
        />
    </div>
  );
};


export default VideoCard;