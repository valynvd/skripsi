import socketIO from 'socket.io-client';

// const URL = socketIO.connect('http://localhost:4000');
const URL = socketIO.connect('https://stembot.fly.dev');

export const socket = URL;
