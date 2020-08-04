import axios from 'axios'

import { getHailFrequencyData } from './index'

jest.mock('axios')

describe('getHailFrequencyData()', () => {
  const credentials = {
    nacelle_space_id: 'my-space-id',
    nacelle_graphql_token: 'abc123 '
  }

  it('should return an async result from graphql', async () => {
    const mockResult = { bacon: 'eggs' }

    axios.post = jest.fn().mockImplementation(() => Promise.resolve(mockResult))

    const result = await getHailFrequencyData(
      credentials,
      'a very fake graphql query',
      {}
    )
    expect(result).toEqual(mockResult)
  })

  it('should throw an error if the query failes', async () => {
    axios.post = jest.fn().mockImplementation(() => Promise.reject('oops!'))

    try {
      const result = await getHailFrequencyData(
        credentials,
        'a very fake graphql query',
        {}
      )
      expect(result).toEqual(undefined)
    } catch (err) {
      expect(err.message).toEqual('oops!')
    }
  })
})
