# @nacelle/nacelle-react-hooks

> Custom hooks for fetching data from Nacelle&#x27;s Hail Frequency API

[![NPM](https://img.shields.io/npm/v/@nacelle/nacelle-react-hooks.svg)](https://www.npmjs.com/package/@nacelle/nacelle-react-hooks) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @nacelle/nacelle-react-hooks
```

## Usage

```tsx
import * as React from 'react'

import { useMyHook } from '@nacelle/nacelle-react-hooks'

const Example = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
```

## License

ISC © [getnacelle](https://github.com/getnacelle)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
