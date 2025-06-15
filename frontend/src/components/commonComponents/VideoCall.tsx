import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X, Minimize2, User } from 'lucide-react';
import { Socket } from "socket.io-client";

interface VideoCallProps {
    socket: Socket;
    isCallActive: boolean;
    onEndCall: () => void;
    chatId: string;
    userId: string;
    receiverId: string;
    receiverName: string;
    isInitiator: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({
    socket,
    isCallActive,
    onEndCall,
    chatId,
    userId,
    receiverId,
    receiverName,
    isInitiator
}) => {
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [isCallAccepted, setIsCallAccepted] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [callStatus, setCallStatus] = useState('');
    const [callerName, setCallerName] = useState('');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const hasInitiated = useRef(false);

    useEffect(() => {
        if (isCallActive && !isInitiator) {
            setIncomingCall(true);
            setCallerName(receiverName);
            setCallStatus(`Incoming call from ${receiverName}`);
        } else if (isCallActive && isInitiator) {
            setIncomingCall(false);
            setCallEnded(false);
            setIsCallAccepted(false);
            setIsCallStarted(false);
            hasInitiated.current = false; 
        } else {
            setIncomingCall(false);
        }
    }, [isCallActive, isInitiator, receiverName]);

    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const handleCallAccepted = async ({
        calleeId,
        chatId: acceptedChatId,
    }: { calleeId: string; chatId: string }) => {
        console.log('Call accepted:', { calleeId, chatId: acceptedChatId });
        if (acceptedChatId === chatId) {
            setIsCallAccepted(true);
            setCallStatus('Call accepted, connecting...');

            try {
                const offer = await peerConnection.current?.createOffer();
                await peerConnection.current?.setLocalDescription(offer);

                socket.emit('send_offer', {
                    offer,
                    to: chatId
                });
            } catch (error) {
                console.error('Error creating offer:', error);
                setCallStatus('Connection failed');
            }
        }
    };

    const handleCallRejected = () => {
        console.log('Call rejected');
        setCallStatus('Call rejected');
        setTimeout(() => {
            onEndCall();
        }, 2000);
    };

    const handleCallEnded = () => {
        console.log('Call ended');
        setCallEnded(true);
        setCallStatus('Call ended');

        cleanup();

        setTimeout(() => {
            onEndCall();
        }, 1000);
    };

    const handleCallCancelled = () => {
        console.log('Call cancelled');
        setCallStatus('Call cancelled');
        setIncomingCall(false);
        setTimeout(() => {
            onEndCall();
        }, 2000);
    };

    const handleReceiveOffer = async ({ offer, to }: { offer: RTCSessionDescriptionInit; to: string }) => {
        if (to === chatId) {
            try {
                await peerConnection.current?.setRemoteDescription(offer);

                const answer = await peerConnection.current?.createAnswer();
                await peerConnection.current?.setLocalDescription(answer);

                socket.emit('send_answer', {
                    answer,
                    to: chatId
                });
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        }
    };

    const handleReceiveAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        try {
            await peerConnection.current?.setRemoteDescription(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        try {
            await peerConnection.current?.addIceCandidate(candidate);
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    useEffect(() => {
        if (!isCallActive || !socket) return;

        console.log('Setting up VideoCall component:', {
            isCallActive,
            isInitiator,
            chatId,
            socketConnected: socket.connected,
            socketId: socket.id
        });

        if (!socket.connected) {
            console.error('Socket not connected when trying to start call!');
            setCallStatus('Connection error');
            return;
        }

        socket.on('call_accepted', handleCallAccepted);
        socket.on('call_rejected', handleCallRejected);
        socket.on('call_ended', handleCallEnded);
        socket.on('call_cancelled', handleCallCancelled);
        socket.on('send_offer', handleReceiveOffer);
        socket.on('send_answer', handleReceiveAnswer);
        socket.on('ice_candidate', handleIceCandidate);

        console.log(isInitiator, 'isInitiator', hasInitiated.current);
        if (isInitiator && !hasInitiated.current) {
            hasInitiated.current = true;
            console.log('About to initiate call...');
            setTimeout(() => {
                initiateCall();
            }, 100);
        }

        return () => {
            console.log('Cleaning up VideoCall component');
            socket.off('call_accepted', handleCallAccepted);
            socket.off('call_rejected', handleCallRejected);
            socket.off('call_ended', handleCallEnded);
            socket.off('call_cancelled', handleCallCancelled);
            socket.off('send_offer', handleReceiveOffer);
            socket.off('send_answer', handleReceiveAnswer);
            socket.off('ice_candidate', handleIceCandidate);

            if (!isCallActive) {
                cleanup();
            }
        };
    }, [isCallActive, socket, chatId, isInitiator]);

    const initializePeerConnection = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        peerConnection.current = new RTCPeerConnection(rtcConfig);

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice_candidate', {
                    candidate: event.candidate,
                    to: chatId
                });
            }
        };

        peerConnection.current.ontrack = (event) => {
            console.log('Remote track received');
            remoteStream.current = event.streams[0];
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream.current;
            }
        };

        peerConnection.current.onconnectionstatechange = () => {
            const state = peerConnection.current?.connectionState;
            console.log('Connection state:', state);

            if (state === 'connected') {
                setCallStatus('Connected');
                setIsCallAccepted(true);
            } else if (state === 'disconnected' || state === 'failed') {
                setCallStatus('Connection lost');
                setTimeout(() => {
                    if (peerConnection.current?.connectionState === 'failed') {
                        handleCallEnded();
                    }
                }, 5000);
            }
        };
    };

    const getUserMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStream.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            if (peerConnection.current) {
                stream.getTracks().forEach(track => {
                    peerConnection.current?.addTrack(track, stream);
                });
            }

            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            setCallStatus('Camera/Microphone access denied');
            throw error;
        }
    };

    const initiateCall = async () => {
        try {
            console.log('Initiating call to:', receiverId, 'chatId:', chatId);
            setCallStatus('Initiating call...');
            setIsCallStarted(true);

            console.log('Emitting initiate_call event...');
            socket.emit('initiate_call', {
                callerId: userId,
                calleeId: receiverId,
                callerName: 'You',
                chatId
            });

            setCallStatus('Calling...');
            console.log('Call initiation emitted successfully');

            try {
                initializePeerConnection();
                await getUserMedia();
                console.log('WebRTC setup completed');
            } catch (mediaError) {
                console.error('WebRTC setup failed, but call was still initiated:', mediaError);
                setCallStatus('Media setup failed, but call initiated');
            }

        } catch (error) {
            console.error('Critical error initiating call:', error);
            setCallStatus('Failed to start call');
            setIsCallStarted(false);
            hasInitiated.current = false;
        }
    };

    const acceptCall = async () => {
        try {
            setIncomingCall(false);
            setIsCallStarted(true);
            setCallStatus('Accepting call...');

            initializePeerConnection();
            await getUserMedia();

            socket.emit('accept_call', {
                callerId: receiverId,
                calleeId: userId,
                chatId
            });

            setCallStatus('Call accepted');
        } catch (error) {
            console.error('Error accepting call:', error);
            setCallStatus('Failed to accept call');
        }
    };

    const rejectCall = () => {
        setIncomingCall(false);
        socket.emit('reject_call', {
            callerId: receiverId,
            calleeId: userId,
            chatId
        });
        onEndCall();
    };

    const endCall = () => {
        console.log('Ending call');
        socket.emit('end_call', {
            userId,
            chatId
        });
        handleCallEnded();
    };

    const cancelCall = () => {
        console.log('Cancelling call');
        socket.emit('cancel_call', {
            calleeId: receiverId,
            chatId
        });
        onEndCall();
    };

    const toggleVideo = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const cleanup = () => {
        console.log('Cleaning up media resources');

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
        }

        if (peerConnection.current) {
            peerConnection.current.close();
        }

        localStream.current = null;
        remoteStream.current = null;
        peerConnection.current = null;
        hasInitiated.current = false;

        setIsCallStarted(false);
        setIsCallAccepted(false);
        setIncomingCall(false);
        setCallEnded(false);
        setCallStatus('');
        setCallerName('');
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
        setIsMinimized(false);
    };

    if (!isCallActive || callEnded) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 ${isMinimized ? 'w-80 h-60 bottom-4 right-4 top-auto left-auto rounded-lg' : ''
            }`}>
            <div className={`bg-gray-900 text-white rounded-lg overflow-hidden ${isMinimized ? 'w-full h-full' : 'w-full max-w-4xl h-full max-h-screen'
                } relative`}>

                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">{receiverName}</h3>
                            <p className="text-sm text-gray-300">{callStatus}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            >
                                <Minimize2 size={20} />
                            </button>
                            <button
                                onClick={isCallStarted && !isCallAccepted ? cancelCall : endCall}
                                className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative w-full h-full">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    <div className={`absolute ${isMinimized ? 'bottom-16 right-2 w-20 h-16' : 'bottom-4 right-4 w-48 h-36'
                        } bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600`}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                <VideoOff size={24} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                {incomingCall && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-white text-black p-8 rounded-2xl text-center max-w-sm mx-4 shadow-2xl">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                                <User size={40} className="text-white" />
                            </div>

                            <h3 className="text-2xl font-bold mb-2 text-gray-800">Incoming Video Call</h3>
                            <p className="text-lg text-gray-600 mb-8 font-medium">{callerName}</p>

                            <div className="flex space-x-6 justify-center">
                                <button
                                    onClick={rejectCall}
                                    className="group relative flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg"
                                >
                                    <PhoneOff size={28} className="text-white" />
                                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-gray-600 whitespace-nowrap">Decline</span>
                                    </div>
                                </button>

                                {/* Accept Button */}
                                <button
                                    onClick={acceptCall}
                                    className="group relative flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg animate-bounce"
                                >
                                    <Phone size={28} className="text-white" />
                                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-gray-600 whitespace-nowrap">Accept</span>
                                    </div>
                                </button>
                            </div>

                            {/* Additional Action Text */}
                            <div className="mt-8 flex justify-between text-xs text-gray-500">
                                <span>Swipe left to decline</span>
                                <span>Swipe right to accept</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Call Controls */}
                {isCallStarted && !isMinimized && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <div className="flex justify-center space-x-6">
                            <button
                                onClick={toggleAudio}
                                className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isAudioEnabled
                                        ? 'bg-gray-700 hover:bg-gray-600'
                                        : 'bg-red-600 hover:bg-red-700 animate-pulse'
                                    }`}
                            >
                                {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isVideoEnabled
                                        ? 'bg-gray-700 hover:bg-gray-600'
                                        : 'bg-red-600 hover:bg-red-700 animate-pulse'
                                    }`}
                            >
                                {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                            </button>

                            <button
                                onClick={endCall}
                                className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                            >
                                <PhoneOff size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Connection Status */}
                {!isCallAccepted && isCallStarted && !incomingCall && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-lg font-medium">{callStatus}</p>
                            {isInitiator && (
                                <button
                                    onClick={cancelCall}
                                    className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                                >
                                    Cancel Call
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCall;