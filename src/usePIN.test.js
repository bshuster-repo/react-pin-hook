import {act, renderHook} from '@testing-library/react-hooks';
import {fireEvent} from '@testing-library/react';
import {usePIN, handleKeyDown} from './usePIN';

describe('key pressed down event handler', () => {
  const mockSender = jest.fn(evt => null);
  const handler = handleKeyDown(mockSender);

  beforeEach(() => {
    mockSender.mockClear();
  });

  test('triggers KEYPRESS when key is a number', () => {
    handler(new KeyboardEvent('keypressed', {key: '1'}));
    expect(mockSender).toBeCalledWith({type: 'KEYPRESS', keyValue: '1'});
  });

  test('triggers BACKSPACE when key is the backspace key', () => {
    handler(new KeyboardEvent('keypressed', {key: 'Backspace'}));
    expect(mockSender).toBeCalledWith({
      type: 'BACKSPACE',
      keyValue: 'Backspace',
    });
  });

  test('triggers no event otherwise', () => {
    handler(new KeyboardEvent('keypressed', {key: 'Space'}));
    expect(mockSender).not.toBeCalled();
    handler(new KeyboardEvent('keypressed', {key: 'd'}));
    expect(mockSender).not.toBeCalled();
    handler(new KeyboardEvent('keypressed', {key: '!'}));
    expect(mockSender).not.toBeCalled();
    handler(new KeyboardEvent('keypressed', {key: ','}));
    expect(mockSender).not.toBeCalled();
  });
});

const getHookState = result =>
  result && result.current && result.current.length === 2 && result.current[0];

describe('usePIN api', () => {
  test('by default it returns ctx (current = 0, pin array[6]) and state(empty)', () => {
    const {result} = renderHook(() => usePIN(ctx => Promise.resolve()));
    expect(getHookState(result)).toEqual({
      index: 0,
      pin: ['', '', '', '', '', ''],
      stage: 'insert',
    });
  });

  test('pressing key down that is a number increase current and add digit to pin', () => {
    const {result} = renderHook(() => usePIN(jest.fn()));
    act(() => {
      fireEvent.keyDown(document.body, {key: '1'});
    });
    const currState = getHookState(result);
    expect(currState.index).toBe(1);
    expect(currState.pin).toStrictEqual(['1', '', '', '', '', '']);
    expect(currState.stage).toBe('insert');
  });

  test('when pressing 6 digits there is intermission', () => {
    const {result} = renderHook(() => usePIN(() => Promise.reject('')));
    act(() => {
      fireEvent.keyDown(document.body, {key: '1'});
      fireEvent.keyDown(document.body, {key: '1'});
      fireEvent.keyDown(document.body, {key: '1'});
      fireEvent.keyDown(document.body, {key: '1'});
      fireEvent.keyDown(document.body, {key: '1'});
      fireEvent.keyDown(document.body, {key: '1'});
    });
    const currState = getHookState(result);
    expect(currState.index).toBe(6);
    expect(currState.pin).toStrictEqual(['1', '1', '1', '1', '1', '1']);
    expect(currState.stage).toBe('intermission');
  });

  test('in intermission pressing backspace reset state', () => {
    const {result} = renderHook(() => usePIN(() => Promise.reject(''), 2));
    act(() => {
      fireEvent.keyDown(document.body, {key: '5'});
      fireEvent.keyDown(document.body, {key: '5'});
      fireEvent.keyDown(document.body, {key: 'Backspace'});
    });
    const currState = getHookState(result);
    expect(currState.index).toBe(1);
    expect(currState.pin).toStrictEqual(['5', '']);
    expect(currState.stage).toBe('insert');
  });
});
