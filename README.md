# @nacelle/nacelle-react-hooks

> React hooks for fetching data from Nacelle's Hail Frequency API

[![npm version](https://img.shields.io/npm/v/@nacelle/nacelle-react-hooks.svg)](https://www.npmjs.com/package/@nacelle/nacelle-react-hooks)
[![GitHub issues](https://img.shields.io/github/issues/getnacelle/gatsby-theme-nacelle)](https://github.com/getnacelle/gatsby-theme-nacelle/issues)
[![GitHub license](https://img.shields.io/github/license/getnacelle/gatsby-theme-nacelle)](https://github.com/getnacelle/gatsby-theme-nacelle/blob/master/LICENSE)
[![install size](https://badgen.net/bundlephobia/minzip/@nacelle/nacelle-react-hooks)](https://badgen.net/bundlephobia/minzip/@nacelle/nacelle-react-hooks)

## Install

### With NPM

```bash
npm i @nacelle/nacelle-react-hooks
```

### With Yarn

```bash
yarn add @nacelle/nacelle-react-hooks
```

## Using the Hooks

#### `useCheckout`

A hook which uses items in a cart to generate a checkout via Nacelle's Hail Frequency API.

##### Accepts

1. `credentials`: an object containing `nacelle_space_id` and `nacelle_graphql_token`
2. `lineItems`: an array containing objects representing items in the cart, where each object contains `variant.id` and `variant.qty` properties
3. `checkoutId`[optional]: a string representing the checkout identification token from a previously-initiated checkout sequence

##### Returns

An array containing:

1. `checkoutData`: an object containing the `data.data.processCheckout` payload, which contains the checkout's `id` token (string), and the `completed` status (boolean)
2. `getCheckoutData`: a callback function that can be passed to an event handler, such as an event handler attached to a checkout button
3. `isLoading`: a boolean that indicates whether or not checkout information is presently being exchanged with Nacelle's Hail Frequency API

##### Example Usage

```JavaScript
// Using the useCheckout hook

import { useCheckout } from '@nacelle/nacelle-react-hooks';

const Cart = () => {
  const lineItems = [
    item1: { variant: { id: 101, qty: 1 }},
    item2: { variant: { id: 102, qty: 4 }}
  ]
  const credentials = {
    nacelle_space_id: process.env.NACELLE_SPACE_ID,
    nacelle_graphql_token: process.env.NACELLE_GRAPHQL_TOKEN
  };
  const [checkoutData, getCheckoutData, isLoading] = useCheckout(
    credentials,
    lineItems
  );
  useEffect(() => {
    if (checkoutData) {
      const payload = checkoutData.data.data.processCheckout;
      window.location = payload.url;
    }
  }, [checkoutData]);
  return (
    <>
      <h2>Cart</h2>
      <button
        type="button"
        onClick={() => getCheckoutData()}
        disabled={isLoading}
      >
        {isLoading ? <>Loading...</> : <>Checkout</>}
      </button>
      <ul>
        {lineItems.map(el => (
          <li key={el.variant.id}>
            <h3>{item.title}</h3>
            <img src={item.src} alt={item.title} />
            <p>{item.variant.title}</p>
            <p>Quantity: {item.variant.qty}</p>
            <p>$ {(Number(item.variant.price) * item.variant.qty).toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </>
  );
};
```


## License

ISC © [getnacelle](https://github.com/getnacelle)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
