import React, { useRef, useEffect } from "react";

export default function AutoPlaySilentVideo(props) {
    const videoRef = useRef(null);

    useEffect(() => {
        videoRef.current.defaultMuted = true;
    }, []);

    return (
        <video
            className={props.className}
            ref={videoRef}
            loop
            autoPlay
            muted
            playsInline
        >
            <source src={props.video} type="video/mp4" />
        </video>
    );
}