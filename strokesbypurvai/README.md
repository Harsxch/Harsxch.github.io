# Strokes by Purvai — painting shop

Static site (no build, no backend). Works on GitHub Pages at `/strokesbypurvai/`.

## Edit
- `config.js`: shop name, WhatsApp number, UPI id, and the paintings list.
- Real photos: put files in `img/`, set `image: "img/name.jpg"` on a painting. Mark `sold: true` when sold.

## Checkout
No payment gateway. Cart builds an order message → WhatsApp or Instagram DM. Artist confirms, collects UPI/bank payment, ships.
For card checkout later: add Razorpay Payment Links or Stripe Payment Links per painting.

## Preview
`python3 -m http.server -d strokesbypurvai 8000`
