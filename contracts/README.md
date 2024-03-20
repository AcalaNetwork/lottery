# Acala Lottery
It contains two contracts:
- `Ambassador Point`: token used to draw lottery. Owner and allowed minters can batch mint to community members.
- `Lottery`: lottery contract that burn `AP` token and reward `ACA` token. Usually each lottery draw burns 10 `AP` token, and the reward amount is a randomly selected 10 - 500 `ACA` token.

## Test
- start acala stack: `docker compose up`
- install deps: `yarn`
- build contracts: `yarn build`
- run test: `yarn test`
