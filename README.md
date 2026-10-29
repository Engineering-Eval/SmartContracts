# 15min - Timed skill test for smart contract engineer

## Task

Buyers ask for a number of shares in a listed property. Finish `quote` in `contracts/contracts/skill/Quote.sol`.

`buyShares` sells at a flat `sharePrice * shares`. This quote does not. Do not change `RealEstateMarketplace.sol`. Stay inside `Quote.sol`. Match the curve below. `GET /api/properties/1/quote` uses the same curve.

`quote(sharePrice, shares, remaining)` numbers the shares in the order `k = 1 .. shares`. Share `k` costs `(remaining + k) * sharePrice` wei.

- `cost` — the exact sum of those prices, in wei. Return this cost even when the order cannot be filled.
- `canFill` — `true` only when `shares` is at least 1 and `remaining` is at least `shares`. An order that takes the last shares still fills. If `shares` is greater than `remaining`, return the cost and set `canFill` to `false`.

The sum is the arithmetic series `sharePrice * shares * (2 * remaining + shares + 1) / 2`. Implement that in closed form. A loop over `shares` will not pass.

`shares` and `2 * remaining + shares + 1` have opposite parity, so their product is always even. Halve the even factor first, then multiply by `sharePrice`. Dividing an odd intermediate truncates the quote. Multiplying by `sharePrice` before the `/ 2` can overflow `uint256` on a result that still fits.

Checks:

- `quote(100, 4, 10)` → cost `5000`, `canFill = true` (1100 + 1200 + 1300 + 1400)
- `quote(100, 4, 3)` → cost `2200`, `canFill = false`
- `quote(3, 3, 1)` → cost `27`, `canFill = false`

## Branch

Create your branch from the project root before you change any code. Name it with your name and birthday:

```bash
git checkout -b John-david-1998-03-01
```

## Backend API and contract check

Run the API from the project root and leave that terminal open:

```bash
cd backend
npm install
npm run dev
```

The API listens on http://localhost:4000.

The quote route also reads the deployed vault, so the local chain has to be up before that URL will answer.

Read the API result in another terminal, from the project root:

```bash
curl.exe "http://localhost:4000/api/properties/1/quote?shares=4"
```

Run the contract check from the project root:

```bash
cd contracts
npx hardhat test test/Quote.test.js
```

Pass if `npx hardhat test test/Quote.test.js` passes. That run calls http://localhost:4000/api/properties/1/quote?shares=4 and checks `cost` and `canFill` against it.
