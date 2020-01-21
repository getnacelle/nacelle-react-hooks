import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";

interface Credentials {
  nacelle_space_id: string;
  nacelle_graphql_token: string;
}

interface CartItem {
  cartItemId: string;
  variantId: string;
  quantity: number;
  metafields?: any[];
}

interface CheckoutInput {
  cartItems: CartItem[];
  checkoutId: string;
  discountCodes?: string[];
  source?: string;
}

interface VariableInput {
  [name: string]: CheckoutInput | AnyObject;
}

interface VariantInput {
  [name: string]: {
    id: string;
    qty: number;
  };
}

interface AnyObject {
  [name: string]: any;
}

export async function getHailFrequencyData(
  credentials: Credentials,
  query: string,
  variables: VariableInput
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
        "X-Nacelle-Space-ID": nacelle_space_id,
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

export function useNacelle(
  credentials: Credentials,
  query: string,
  variables: VariableInput
) {
  //
  // Fetch data from the Hail Frequency API with any valid query.
  //
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

export function useCheckout(
  credentials: Credentials,
  lineItems: VariantInput[],
  checkoutId: string
) {
  //
  // Fetch checkout data (url, id, etc.) from the Hail Frequency API
  //
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
  return [checkoutData, checkoutCallback];
}
