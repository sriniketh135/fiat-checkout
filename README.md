# Fiat Checkout

A secure payment checkout UI built with React + TypeScript + Vite.

## Architecture

- **Frontend**: React with TypeScript, plain CSS-in-JS (no UI libraries)
- **Payment API**: Mock endpoint via [Beeceptor](https://beeceptor.com) (`https://securepay.free.beeceptor.com/pay`)
- **Build tool**: Vite

## Features

- Pixel-perfect implementation of the Figma design
- Form validation with inline error messages
- Card number auto-formatting (groups of 4)
- Expiry date auto-formatting (MM/YY)
- Loading state + disabled button during API call
- Success screen on payment confirmation
- Error banner on payment failure

## How to Run Locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## How to Build

```bash
npm run build
```

Output goes to the `dist/` folder.

## Deployment

Deployed on Vercel: https://fiat-checkout-new1.vercel.app/

