global.Buffer = require('buffer').Buffer;

const { TextEncoder, TextDecoder } = require('text-encoding');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { decode, encode } from 'base-64';
if (!global.btoa) {  
    global.btoa = encode; 
}
if (!global.atob) { 
    global.atob = decode; 
}

global.window = global;
global.document = {
    createElement: () => {}, // Pusta funkcja, żeby nie wyrzucało błędu
    createElementNS: () => {},
};

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
