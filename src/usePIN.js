import React from 'react';
import {useMachine} from '@xstate/react';
import {pinStateMachine} from './stateMachine';

export const handleKeyDown = send => event => {
  const validCharacters = /^[0-9]$/;
  const isKeyPress = RegExp(validCharacters).test(event.key);
  if (isKeyPress) {
    send({type: 'KEYPRESS', keyValue: event.key});
  }
  if (event.key === 'Backspace') {
    send({type: 'BACKSPACE', keyValue: event.key});
  }
};

export const usePIN = (verifier, size = 6, debouncer = 820) => {
  const [current, send] = useMachine(
    pinStateMachine(size, verifier, debouncer),
  );
  const handler = handleKeyDown(send);
  React.useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  });

  const retry = () => {
    send({type: 'RETRY', keyValue: 'retry'});
  };
  return [
    {
      stage: current.value,
      pin: current.context.pin,
      index: current.context.current,
    },
    retry,
  ];
};
