# BookNest

BookNest is a responsive Angular frontend for a reading and writing academy with a small online bookshop. It is a Milestone 1 prototype: all accounts, orders, fees, payroll, inventory and reports use local sample data. There is no server or database.

## Run it

```bash
npm install
npm start
```

Open the local address printed by Angular CLI. Build the production files with `npm run build`.

## Demo paths

- **Student:** create an account or sign in, browse workshops, enroll, view fee records, save books, add items to the bag, check out, and review order history.
- **Accountant:** sign in to update department budget figures, edit staff payroll, manage student invoices and payment status, and export finance and payroll JSON reports.
- **Admin:** sign in to view department budgets, payroll, and People & access records, and manage the product catalog and stock. Budget and payroll data are read-only for admins.
- **Reading helper:** open the floating helper for course-aware book suggestions. It calls Azure AI Foundry when configured and falls back to local sample suggestions when it is not configured or the request fails.

The demo sign-in form uses a username and password. Use `reader`, `accountant`, or `admin` with password `booknest-demo`, or create a student account on the sign-up page. The app does not contact an authentication service. A created account's demo password is kept in this browser's local storage so the sign-in flow can be demonstrated; this is not secure authentication. Use only a made-up password and never enter real payment details. The card field is fixed to a fake all-zero number stored for the coursework demo; only its last four digits appear in the profile.

## Browser storage choices

- **Cookies:** a small first-visit marker (`booknest-seen`) to demonstrate cookie storage without putting account or payment data in a cookie.
- **Session storage:** the demo role session and current shopping bag. These are cleared when the browser session ends.
- **Local storage:** demo account data, reading profile preferences, wishlist, workshop enrollment, order history, course fees, department figures, payroll values and statuses, new products, and stock counts. These remain across visits on the same device and are not secure for real private or financial data.

This front-end storage is for coursework demonstration only. Real authentication, authorization, payment, and payroll must be handled by a backend in a later milestone.

## Optional Azure AI Foundry chat

To enable the live model for a laptop demo, copy `public/foundry-config.example.json` to `public/foundry-config.local.json`, then set your Foundry chat-completions endpoint, deployed model name, and API key. Restart `npm start` after creating the local file. The app sends the student's enrollments and the BookNest catalog with the question so the model can make course-aware suggestions. If the request fails, the chat shows local sample suggestions instead.

The local config file is ignored by Git, but it is served to the browser and the key is visible to anyone who can access this local app. Use it only for your private laptop demo; never include `foundry-config.local.json` in your deliverables. Direct browser calls may also be blocked by your Foundry resource's CORS or network settings.

## Course requirements represented

- Angular standalone components with lazy-loaded routes.
- Responsive navigation and page layouts.
- Reactive signup and sign-in forms with username, name, email, profile picture, demo password, fixed mock card, and reading preference fields.
- Separate student, accountant, and admin navigation with route guards.
- Admin People & access page for student accounts, payroll staff, and role permissions.
- Bookshop filters, wishlist, session bag, mock checkout, order history, and a short confirmation melody.
- Course enrollment and unenrollment, plus student fee records with payment status and JSON history export.
- Responsive Chart.js department income/expense chart and JSON report export.
- Accountant-editable staff compensation and payment status; admins have read-only payroll access. Monthly JSON payroll export.
- Admin inventory tools to add and remove catalog products and adjust stock.
- Jasmine/Karma configuration and unit specs in `src/app/*.spec.ts`.

## Test runner

The project is configured for Jasmine/Karma with Chrome Headless. Run `npm test` on a machine with Google Chrome available.
