// EventMediator.js

const listeners = {};

const subscribe = (eventName, callback) => {
  if (!listeners[eventName]) {
    listeners[eventName] = [];
  }
  listeners[eventName].push(callback);
};

const publish = (eventName, data) => {
  const eventListeners = listeners[eventName] || [];
  eventListeners.forEach((listener) => listener(data));
};

export { subscribe, publish };
