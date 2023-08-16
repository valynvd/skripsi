import socketIO from 'socket.io-client';

const URL = socketIO.connect('http://localhost:4000');

export const socket = URL;
