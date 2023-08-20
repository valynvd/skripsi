import socketIO from 'socket.io-client';

// const URL = socketIO.connect('http://localhost:4000');
const URL = socketIO.connect('https://stembot.vercel.app:4000/', { transports : ['websocket'] });

export const socket = URL;
