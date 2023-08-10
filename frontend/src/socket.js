import socketIO  from 'socket.io-client';

const URL = socketIO.connect('http://localhost:8000');

export const socket = URL;