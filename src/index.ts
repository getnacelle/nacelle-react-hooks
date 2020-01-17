import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

function parseCredentials({ credentials = null } = {}) {
  if (!credentials) {
    throw new Error(
      `A credentials object containing "nacelle_space_id" and 
        "nacelle_graphql_token" properties must be passed in 
        order to fetch data from the Hail Frequency API.`
    );
  } else {
    const nacelleSpaceId =
      //@ts-ignore */
      credentials.nacelle_space_id ||
      //@ts-ignore */
      credentials["nacelle-space-id"] ||
      //@ts-ignore */
      credentials.nacelleSpaceID ||
      //@ts-ignore */
      credentials.nacelleSpaceId;
    const nacelleGraphQLtoken =
      //@ts-ignore */
      credentials.nacelle_graphql_token ||
      //@ts-ignore */
      credentials["nacelle-graphql-token"] ||
      //@ts-ignore */
      credentials.nacelleGraphQLToken ||
      //@ts-ignore */
      credentials.nacelleGraphqlToken;
    return [nacelleSpaceId, nacelleGraphQLtoken];
  }
}

export async function getHailFrequencyData({
  //@ts-ignore */
  credentials,
  //@ts-ignore */
  query,
  //@ts-ignore */
  variables
} = {}) {
  //
  // Fetch data from Nacelle's Hail Frequency API with Axios
  //
  if (!query) {
    throw new Error(
      `A query object containing a GraphQL query string
        must be passed in order to fetch data from the
        Hail Frequency API.`
    );
  }
  const [nacelleSpaceId, nacelleGraphQLtoken] = parseCredentials({
    credentials
  });
  try {
    const result = await axios({
      url: "https://hailfrequency.com/v2/graphql",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Nacelle-Space-ID": nacelleSpaceId,
        "X-Nacelle-Space-Token": nacelleGraphQLtoken
      },
      data: {
        query,
        variables
      }
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

//@ts-ignore */
export function useNacelle({ credentials, query, variables } = {}) {
  //
  // Fetch data from the Hail Frequency API with any valid query.
  //
  const [data, setData] = useState(null);
  useEffect(
    //@ts-ignore */
    (() => {
      async function fetchData() {
        try {
          const result = await getHailFrequencyData({
            credentials,
            query,
            variables
          });
          setData(result.data);
        } catch (error) {
          throw new Error(error);
        }
      }
      fetchData();
    },
    [])
  );
  return data;
}

export function useCheckout({
  //@ts-ignore */
  credentials,
  //@ts-ignore */
  lineItems,
  //@ts-ignore */
  checkoutId = null
} = {}) {
  //
  // Fetch checkout data (url, id, etc.) from the Hail Frequency API
  //
  const [checkoutData, setCheckoutData] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);
  useEffect(
    // Set isMounted to false when the component is unmounted
    () => () => {
      isMounted.current = false;
    },
    []
  );
  //@ts-ignore */
  const cartItems = lineItems.map((item, idx) => ({
    variantId: item.variant.id,
    cartItemId: `${idx}::${item.variant.id}`,
    quantity: item.variant.qty
  }));
  const checkoutCallback = useCallback(async () => {
    if (isSending) return; // while sending, don't send again
    setIsSending(true);
    const query = `
      mutation sendCheckout($input: CheckoutInput) {
        processCheckout(input: $input) {
          id
          completed
          url
          source
        }
      }
    `;
    const variables = {
      input: {
        cartItems,
        checkoutId
      }
    };
    try {
      const checkoutResult = await getHailFrequencyData({
        credentials,
        query,
        variables
      });
      //@ts-ignore */
      setCheckoutData(checkoutResult);
      if (isMounted.current) {
        setIsSending(false); // only update if still mounted
      }
      return checkoutResult;
    } catch (error) {
      throw new Error(error);
    }
  }, [cartItems, checkoutId, credentials, isSending]);
  return [checkoutData, checkoutCallback];
}
