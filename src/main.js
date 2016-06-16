import {Observable} from 'rx';
import {run} from '@cycle/core';
import {makeDOMDriver, button, div, input} from '@cycle/dom';
import {makeAnimationDriver} from 'cycle-animation-driver';
import {floor, head} from 'lodash/fp';

const COLORS = [
  '#2f3439',
  '#95BF78',
  '#DA7E00',
  '#D92626'
];

const linearGradient = pourcent => {
  const level = floor(pourcent);
  let COLOR = COLORS[level + 1] || head(COLORS);
  let BACKGROUND_COLOR = COLORS[level];

  const remainder = pourcent % 1;
  if (remainder > 0.50)
    return `linear-gradient(${90 + (remainder * 360)}deg, ${COLOR} 50%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0)), linear-gradient(270deg, ${COLOR} 50%, ${BACKGROUND_COLOR} 50%, ${BACKGROUND_COLOR})`;
  return `linear-gradient(90deg, ${BACKGROUND_COLOR} 50%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0)), linear-gradient(${90 + (remainder * 360)}deg, ${COLOR} 50%, ${BACKGROUND_COLOR} 50%, ${BACKGROUND_COLOR})`;
};

const ui = (pourcent, edit) => {
  return div({style: {
    width: '90vmin',
    height: '90vmin',
    borderRadius: '50%',
    backgroundImage: linearGradient(pourcent)
  }}, [edit]);
};

function main ({DOM, animation}) {
  console.log('HELLO MAIN');
  const click$ = DOM.select('.app').events('click');
  const timeout$ = DOM.select('.timeout').events('change').pluck('target').pluck('value').startWith(30000).scan((curr, next) => {
    try {
      next = parseInt(next, 10);
      return isNaN(next) ? curr : next;
    }
    catch(e) {
      return curr;
    }
  });

  const timer$ = click$.startWith('').withLatestFrom(timeout$, (noop, timeout) => {
    const latestValue =  timeout * (COLORS.length - 1);
    return animation.pluck('delta')
      .scan((sum, delta) => sum + delta)
      .takeWhile(sum => sum < latestValue)
      .concat(Observable.just(latestValue))
      .map(delta => delta / timeout);
  }).switch();

  const edit$ =  click$.buffer(() => click$.debounce(250))
    .map(arr => arr.length)
    .filter(x => x === 2).startWith(false).scan(d => !d);

  const editUI$ = edit$.combineLatest(timeout$, (edit, timeout) => {
    if (!edit) return null;
    return input({
      className: 'timeout',
      value: timeout,
      type: 'number',
      pattern: '\d*'
    });
  });

  return {
    DOM: timer$.startWith(0).withLatestFrom(editUI$, ui)
  }
}


const drivers = {
  DOM: makeDOMDriver('.app'),
  animation: makeAnimationDriver()
};

run(main, drivers);
