# React PIN Hook

A react hook for personal identification number.

## Getting Started

### Installation

```
yarn add react-pin-hook
```

or

```
npm i react-pin-hook
```

### usePIN

```
import {usePIN} from 'react-pin-hook';

const App = () => {
  const size = 4; // Size of PIN (4 digits)
  const waitTime = 500; // wait 500 ms after PIN entered completely before executing verifier
  const verifier = (ctx) => {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if(ctx.pin.join('') === '1234') {
          return res('success');
        }
        return rej('bad PIN');
      }, 3000);
    });
  };
  const [pstate, retry] = usePIN(verifier, size, waitTime);
  switch (pstate.stage) {
    case 'verify':
      return <div>Verifying...</div>;
    case 'granted':
      return <div>Permission granted!</div>;
    case 'denied':
      return (
        <div>
          <h3>Permission denied!</h3>
          <button onClick={retry}>retry again</button>
        </div>
      );
    default:
      return (
        <div>
          {pstate.pin.map((digit, ix) => (
            <span key={`pin-${ix}`} className={ix === pstate.index ? 'current' : ''}>
              {digit === '' ? '-' : '*'}
            </span>
          ))}
        </div>
      );
  }

}
```

The `usePIN` hook returns a tuple where the first element is the PIN state
and the second element is a `retry` function which resets the state.

The PIN state has the following attributes:

- `stage` - the current state value: `insert`, `intermission`, `verify`, `granted` and `denied`
- `pin` - string array which contains the current pin that was entered. Empty digit are represented by empty string.
- `index` - the current digit that is going to be entered

Use the `state` attribute to determine in what stage the user is:

- `insert` - the "insert" PIN stage
- `intermission` - a stage that allows the user to change PIN before verifying it. The intermission period is set by the `waitTime` variable in the example above
- `verify` - in this stage a verification request is sent to the backend. Probably you would like to show a loading state in this stage
- `granted` - `verify` will transition to this stage if PIN is correct. This is where you would like to show a success message or redirect to the user page
- `denied` - `verify` will transition to this stage if PIN is incorrect. In that case you would like to use the `retry` function in order to reset the state.
