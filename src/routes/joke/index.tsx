import {
  component$,
  useSignal,
  useTask$,
  useStylesScoped$,
  useComputed$,
  useResource$,
  Resource,
} from "@builder.io/qwik";
import { routeLoader$, Form, routeAction$ } from "@builder.io/qwik-city";

import styles from "./index.css?inline";

export const useDadJoke = routeLoader$(async () => {
  const response = await fetch("https://icanhazdadjoke.com/", {
    headers: { Accept: "application/json" },
  });
  return (await response.json()) as {
    id: string;
    status: number;
    joke: string;
  };
});

export const useJokeVoteAction = routeAction$((props) => {
  console.log("VOTE", props);
});

export default component$(() => {
  useStylesScoped$(styles);
  const dadJokeSignal = useDadJoke();
  const favoriteJokeAction = useJokeVoteAction();
  const name1 = useSignal<string>();

  const ageResource = useResource$<{
    name1: string;
    age: number;
    count: number;
  }>(async ({ track, cleanup }) => {
    track(() => name1.value);
    const abortController = new AbortController();
    cleanup(() => abortController.abort("cleanup"));
    const res = await fetch(`https://api.agify.io?name=${name1.value}`, {
      signal: abortController.signal,
    });
    return res.json();
  });

  const name = useSignal("Qwik");
  const capitalizedName = useComputed$(() => {
    return name.value.toLocaleUpperCase();
  });

  const isFavoriteSignal = useSignal(false);

  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log("FAVORITE (isomorphic)", isFavoriteSignal.value);
  });

  return (
    <>
      <section>
        <div>
          <label>
            Enter your name, and I'll guess your age!
            <input
              onInput$={(e: Event) =>
                (name1.value = (e.target as HTMLInputElement).value)
              }
            />
          </label>
        </div>
        <Resource
          value={ageResource}
          onPending={() => <p>Loading...</p>}
          onRejected={() => <p>Failed to person data</p>}
          onResolved={(ageGuess) => {
            return (
              <p>
                {name1.value && (
                  <>
                    {ageGuess.name1} {ageGuess.age} years
                  </>
                )}
              </p>
            );
          }}
        />
      </section>

      <section class="section bright">
        <input type="text" bind:value={name} />
        <p>Name: {name.value}</p>
        <p>{capitalizedName.value}</p>

        <p>{dadJokeSignal.value.joke}</p>
        <Form action={favoriteJokeAction}>
          <input type="hidden" name="jokeID" value={dadJokeSignal.value.id} />
          <button name="vote" value="up">
            👍
          </button>
          <button name="vote" value="down">
            👎
          </button>
        </Form>

        <button
          onClick$={() => {
            isFavoriteSignal.value = !isFavoriteSignal.value;
          }}
        >
          {isFavoriteSignal.value ? "❤️" : "🤍"}
        </button>
      </section>
    </>
  );
});
