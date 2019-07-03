import {Machine, assign} from 'xstate';

const getContext = size => ({
  current: 0,
  pin: new Array(size).fill(''),
});

const verifierWrapper = verifier => ctx => verifier(ctx);

export const pinStateMachine = (size, verifier, debounceTimeout) => {
  const initCtx = getContext(size);
  const verifierFunc = verifierWrapper(verifier);
  return Machine(
    {
      id: 'personal-identify-number',
      context: initCtx,
      initial: 'insert',
      states: {
        insert: {
          on: {
            KEYPRESS: [
              {target: 'intermission', actions: ['insert'], cond: 'isComplete'},
              {target: 'insert', actions: ['insert']},
            ],
            BACKSPACE: {
              target: 'insert',
              actions: ['remove'],
              cond: 'isNotEmpty',
            },
          },
        },
        intermission: {
          on: {
            BACKSPACE: {target: 'insert', actions: ['remove']},
          },
          after: {[debounceTimeout]: 'verify'},
        },
        verify: {
          invoke: {
            id: 'verify-pin',
            src: verifierFunc,
            onDone: {target: 'granted'},
            onError: {target: 'denied'},
          },
        },
        granted: {},
        denied: {
          on: {
            RETRY: {target: 'insert', actions: ['reset']},
          },
        },
      },
    },
    {
      guards: {
        isNotEmpty: ctx => ctx.current !== 0,
        isComplete: ctx => ctx.current === ctx.pin.length - 1,
      },
      actions: {
        reset: assign(initCtx),
        insert: assign({
          current: ctx => ctx.current + 1,
          pin: (ctx, evt) => {
            const newPin = [...ctx.pin];
            newPin[ctx.current] = evt.keyValue;
            return newPin;
          },
        }),
        remove: assign({
          current: ctx => ctx.current - 1,
          pin: (ctx, evt) => {
            const newPin = [...ctx.pin];
            newPin[ctx.current - 1] = '';
            return newPin;
          },
        }),
      },
    },
  );
};
