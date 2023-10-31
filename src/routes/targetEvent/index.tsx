import { component$, useSignal } from '@builder.io/qwik';

export default component$(() => {

  const currentElm = useSignal<HTMLElement | null>(null);
  const targetElm = useSignal<HTMLElement>(null);

  return (
    <div id="1" onClick$={(event, currentTarget) => {
      currentElm.value = currentTarget;
      targetElm.value = event.target as HTMLElement;
    }}>
      Click
      <ul>
        <li id="5">currentElm: {currentElm.value?.tagName}</li>
        <li id="6">target: {targetElm.value?.id}</li>
      </ul>
    </div>
  );
});
