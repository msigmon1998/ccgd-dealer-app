# Cleveland County Garage Doors dealer quotes

**Live site:** https://msigmon1998.github.io/ccgd-dealer-app/

The site files are on the `main` branch. GitHub still has to serve that branch. If the link says 404, open the repo **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, set the branch to **main** and the folder to **/ (root)**, then Save. Give it a minute and reload the link above.

This page runs on its own in the browser. It is not inside an iframe, so quotes can use local storage. They are stored on the phone under the key `ccgd-dealer-quotes-v2` and stay there after Safari is closed. They do not sync to another phone.

## Add to Home Screen (iPhone)

1. Open the live link in **Safari**. Do not open it from inside Facebook, Gmail, or another in-app browser. Those can block storage.
2. Tap the **Share** button (the square with the arrow).
3. Scroll the share sheet and tap **Add to Home Screen**.
4. Tap **Add**.

Open the new icon like an app. Quotes you write there stay on that phone. If a banner says storage failed, you are not in normal Safari. Open the GitHub Pages link directly and try again.

## Using it

Tabs: **Quote**, **Price book**, **Estimate**, **Schedule**, **Send**.

- New quotes get a number like `CCGD-YYYYMMDD-0001`.
- Customer name, phone, and email are on the Quote tab. Search the saved list by quote number, name, or phone.
- Add as many doors as the job needs. Each door has its own series, model, size, color, wind load, track, glass, and opener.
- The price updates as you edit. **Save quote** at the bottom writes immediately. The app also saves on its own about half a second after each change.
- Sell price = (your cost ÷ (1 − margin)) × (1 − discount). Margin starts at 42%.
- A complete installed job includes installation, haul-away, and a 1-year workmanship warranty. Labor and haul-away start at $285 and $75 per door. Those are your rates, not the door sheet. **Remember these rates** keeps them for the next quote.
- Schedule colors: red until ordered, orange while you wait on the customer, green when the warehouse confirms. Customer names show on the board and the calendar.
- **Send** opens Gmail with the customer in To, a subject, and the full quote. The message includes Confirm, Decline, and a line to call **704-472-9367** to make a deposit. The sign-off is the Cleveland County Garage Doors team.
- **Share** opens the phone share sheet with the quote text and a PDF when the phone allows a file. If share is not available, use **Text message** or **Copy quote text**.
- **Print / Save PDF** is the customer quote, with the logo, line items, Confirm and Decline, and the deposit line. On iPhone, open the print preview, tap Share, then Save to Files.

## Prices in the app

- Residential door nets are the Platinum / Southern Ideal sheet dated **9/19/2026** for series 400, 401, 500, 501, and 3000 (standard, black, and wood columns; no windload and 90 mph).
- Glass is priced per lite by model. Special window placement is $35 a section. Locks are $28.
- Track: low headroom 7' is $95, low headroom 8' is $125, 20" or 32" radius is $185, and hi-lift 24" through 72" follows the sheet. Taller doors use the tall-door track table. A roof pitch from 4/12 through 12/12 adds $50.
- Extension springs deduct $8 from the torsion price.
- 3000 series adds a $15 operator bracket when a motor is selected. Strut the top section or the warranty is void.
- LiftMaster opener nets are dated **9/16/2026**, with rail columns. Head only deducts $15.

The customer email, text, and PDF show the sell price. Your cost stays on the Quote tab.

This repository is public, so the wholesale nets in the page are visible to anyone with the link.
