# @nacelle/nacelle-react-hooks

> Custom hooks for fetching data from Nacelle's Hail Frequency API

[![NPM](https://img.shields.io/npm/v/@nacelle/nacelle-react-hooks.svg)](https://www.npmjs.com/package/@nacelle/nacelle-react-hooks) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

### With NPM

```bash
npm i @nacelle/nacelle-react-hooks
```

### With Yarn

```bash
yarn add @nacelle/nacelle-react-hooks
```

### Example Usage

```JavaScript
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
  }, [checkoutData, dispatch]);
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
