import React, { useRef, useEffect } from "react";

export default function AutoPlaySilentVideo(props) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.defaultMuted = true;
            videoRef.current.play().catch(() => {
                videoRef.current.muted = true;
                videoRef.current.play();
            });
        }
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