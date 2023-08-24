import socketIO from 'socket.io-client';

const URL = socketIO.connect('http://localhost:8080');
// const URL = socketIO.connect('https://stembot.fly.dev');

export const socket = URL;
