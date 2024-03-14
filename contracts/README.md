# Acala Lottery
It contains two contracts:
- `Acala Point`: token used to draw lottery, usually each draw consumes 10 `AP` token, and the reward amount is 10 - 500 `ACA` token
- `Lottery`: lottery contract that burn `AP` token and reward `ACA` token

## Test
- start acala stack: `docker compose up`
- install deps: `yarn`
- build contracts: `yarn build`
- run test: `yarn test`
