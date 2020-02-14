import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";

/**
 * @param nacelle_space_id: the target Nacelle Space ID (string)
 * @param nacelle_graphql_token: the GraphQL token associated with the Nacelle Space (string)
 */
interface ICredentials {
  nacelle_space_id: string;
  nacelle_graphql_token: string;
}

interface ICartItem {
  cartItemId: string;
  variantId: string;
  quantity: number;
  metafields?: any[];
}

interface ICheckoutInput {
  cartItems: ICartItem[];
  checkoutId?: string;
  discountCodes?: string[];
  source?: string;
}

interface IAnyObject {
  [name: string]: any;
}

interface IVariableInput {
  [name: string]: ICheckoutInput | IAnyObject;
}

interface IVariant {
  [name: string]: {
    id: string;
    qty: number;
  };
}

/**
 * Fetch data from Nacelle's Hail Frequency API (GraphQL)
 * @param credentials an object containing your nacelle_space_id and your nacelle_graphql_token
 * @param query a GraphQL query string (see the schema & docs at https://hailfrequency.com/v2/graphql)
 * @param variables an object containing any query variables
 * @returns The payload from the Hail Frequency GraphQL server
 */
export async function getHailFrequencyData(
  credentials: ICredentials,
  query: string,
  variables: IVariableInput
) {
  //
  // Fetch data from Nacelle's Hail Frequency API with Axios
  //
  const { nacelle_space_id, nacelle_graphql_token } = credentials;
  try {
    const result = await axios({
      url: "https://hailfrequency.com/v2/graphql",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Nacelle-Space-Id": nacelle_space_id,
        "X-Nacelle-Space-Token": nacelle_graphql_token
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

/**
 * Fetch data from the Hail Frequency API with any valid query
 * @param credentials an object containing your nacelle_space_id and your nacelle_graphql_token
 * @param query a GraphQL query string (see the schema & docs at https://hailfrequency.com/v2/graphql)
 * @param variables an object containing any query variables
 * @returns The payload from the Hail Frequency GraphQL server
 */
export function useNacelle(
  credentials: ICredentials,
  query: string,
  variables: IVariableInput
) {
  const [data, setData] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getHailFrequencyData(
          credentials,
          query,
          variables
        );
        setData(result.data);
      } catch (error) {
        throw new Error(error);
      }
    }
    fetchData();
  }, []);
  return data;
}

/**
 * Fetch checkout data (url, id, etc.) from the Hail Frequency API
 * @param credentials an object containing your nacelle_space_id and your nacelle_graphql_token
 * @param lineItems an array of 'variant' objects containing an 'id' and a 'qty'
 * @param checkoutId an id string of a previously checkout to be continued
 * @returns an array with checkout data [0], a checkout callback fn [1], and an isSending boolean [2]
 */
export function useCheckout(
  credentials: ICredentials,
  lineItems: IVariant[],
  checkoutId?: string
) {
  const [checkoutData, setCheckoutData] = useState<AxiosResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);
  useEffect(
    // Set isMounted to false when the component is unmounted
    () => () => {
      isMounted.current = false;
    },
    []
  );
  const cartItems = lineItems.map((item, idx) => ({
    variantId: item.variant.id,
    cartItemId: `${idx}::${item.variant.id}`,
    quantity: item.variant.qty
  }));
  const checkoutCallback = useCallback(async () => {
    if (isSending) return; // while sending, don't send again
    setIsSending(true);
    const query = `
      mutation sendCheckout($input: ICheckoutInput) {
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
      const checkoutResult = await getHailFrequencyData(
        credentials,
        query,
        variables
      );
      setCheckoutData(checkoutResult);
      if (isMounted.current) {
        setIsSending(false); // only update if still mounted
      }
      return checkoutResult;
    } catch (error) {
      throw new Error(error);
    }
  }, [cartItems, checkoutId, credentials, isSending]);
  return [checkoutData, checkoutCallback, isSending];
}
