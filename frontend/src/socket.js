import socketIO from 'socket.io-client';

const URL = socketIO.connect('https://stembot.vercel.app/');

export const socket = URL;
