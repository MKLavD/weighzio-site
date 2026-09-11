# weighzIO module detail content

For the sixteen module popups. Companion to `weighzio-copy-deck-v3.md` section 3.

Every bullet below traces to a line in the functional spec, with the section noted. Nothing here is invented. Where the spec is thin, that is stated rather than padded.

**Format per popup:** module name as the heading, one-sentence summary, four to six bullets written as outcomes, then an `Enquire about this module` button passing the module name to the form.

**Source coverage:**

| Coverage | Modules |
|---|---|
| Strong, spec supports six bullets | Weighbridge, Skip Hire & RoRo, Materials & Aggregates, Scheduling & Dispatch, Driver App, Fleet & Telematics, Customers & Pricing, Finance & Sage, Reporting & Dashboards, Multi-Company |
| Moderate, three to four bullets | Hazardous Waste, Customer Portal |
| Thin, needs input | Ready-Mix Concrete, Marketing Data Feed |
| **No source material at all** | **Trade Waste** |

---

## 1. Weighbridge

*Live weight capture straight off your indicator, onto the ticket.*

- Reads standard RS232 weighbridge indicators through a locally hosted connection on site, so weights arrive on the ticket as they are taken.
- Captures gross, tare and net together, with the container tare handled separately where a skip is involved.
- Records where each weight came from, and flags the variance between what the customer requested and what was actually recorded.
- Manual override is available and logged, for the days the hardware misbehaves.
- Removes the re-typing step between the scale display and the ticket, which is where billing errors start.

*Works alongside: Skip Hire & RoRo, Materials & Aggregates, Finance & Sage.*

Spec: S9 (RS232 hardware integration, edge API, weighbridge-to-ticket plumbing), S6 (ticket weights, provenance, variance).

---

## 2. Skip Hire & RoRo

*Skips, exchanges, hire terms, container tracking and digital waste tracking.*

- Handles the full order range: delivery, exchange, collection, weigh and load, and reposition, each priced on its own terms.
- Hire periods with allowance days, expiry dates, rental day allowances and automatic over-tonnage charges.
- Every skip and RoRo tracked as a physical unit by serial number, across yards and customer sites, so you know where each container actually is.
- Load composition recorded on the bridge as a percentage split by waste type, with bulky items listed separately and contamination photos attached to the ticket.
- European Waste Catalogue codes assigned from a register behind the product list, so records stay consistent whoever is on the weighbridge.
- Tip outlet licences and material-to-outlet rules checked before the tip, so a driver cannot be sent somewhere unlicensed to take the material.

*Digital waste tracking functionality lives in this module.*

Spec: S5 (hire terms, pricing model), S3 (container register, consignment tracking, EWC register, tip outlets, restricted outlets, WTN), S6 (load breakdown, contamination evidence), S7 (container tracking, containers-near-me).

---

## 3. Materials & Aggregates

*Material orders, haulage, disposal routes and automatic load splitting.*

- Large orders split into legal delivery tickets automatically, so a 200 tonne order becomes ten tickets rather than ten phone calls.
- Haulage handled as a buy and sell line, with disposal routes, waiting time charges and site permits held against the order.
- Product records carry activity, product group, VAT code, tax code and nominal codes, so material margins survive contact with the accounts system.
- Levies configured as a third tax tier alongside VAT and customer tax, calculated per material and disposal route.
- Quantities spread across multiple delivery dates, with recurring orders supported.

*Works alongside: Weighbridge, Scheduling & Dispatch, Fleet & Telematics.*

Spec: S5 (material order handling, ticket auto-split, recurring orders), S4 (vehicle/product matching, capacity validation), S3 (product extensions, levies).

---

## 4. Scheduling & Dispatch

*Drag-and-drop planning boards that hold thousands of live tickets.*

- Five distinct planning views covering skips, tippers, concrete, artics and bulk, each filtered to how that side of the operation actually runs.
- An unscheduled jobs dock, so dispatchers drag work onto a vehicle-by-day grid rather than rebuilding the day in their head.
- Job cards load lazily, so the board does not freeze when the ticket volume is heavy.
- Vehicles can be reassigned across group companies where one entity has capacity another needs.
- Scheduling for hire-based products, with jobs and products linked in both directions.

*Works alongside: Driver App, Fleet & Telematics, Skip Hire & RoRo.*

Spec: S7 (all six line items).

---

## 5. Driver App

*Job cards, weights, load breakdowns and signatures from the cab.*

- Skip and material tickets completed on the phone: weights, load breakdown and variances, without a paper docket.
- Delivery sites geofenced, so arrival, waiting time and departure are recorded rather than estimated.
- Digital duty of care notes produced on site with the customer signing on glass.
- Over-quantity variances calculated in the cab, with the surcharge worked out before the driver leaves.
- Payment links generated on site by SMS or WhatsApp for balances owing before discharge.
- Drivers can switch company, so one person can complete jobs for any division in the group. Job status protected by biometric or PIN.

*Works alongside: Scheduling & Dispatch, Skip Hire & RoRo, Weighbridge.*

Spec: S10 (all five line items), S6 (signatures, timestamps, demurrage).

---

## 6. Fleet & Telematics

*Live vehicle tracking and weight limits enforced before dispatch.*

- Live GPS positions from Teletrac shown on the dispatch map, so you can see where drivers actually are.
- Vehicle records hold type, default load size, and maximum and tare weight limits.
- Product types validated against vehicle axle ratings before a ticket leaves dispatch, which is what keeps you out of DVSA overloading trouble.
- Part load tolerances, demurrage and waiting time thresholds, skip type suitability and driver sign-off all held per vehicle.
- Real-time capacity checked at the point the ticket is created rather than after the fact.
- Mobile device management across the fleet's handsets.

*Works alongside: Scheduling & Dispatch, Driver App.*

Spec: S4 (all three line items), S9 (Teletrac integration, MDM).

---

## 7. Customers & Pricing

*Accounts, sites, bespoke rates and credit control.*

- One customer account with many sites, each with its own contacts and geo-addressed location.
- Bespoke pricing per customer, applied automatically on every order and ticket, so nobody looks a rate up by hand and nobody issues a credit note to fix it.
- Live credit position checked during order entry, with the warning arriving while the customer is still on the phone.
- Waste carrier registration numbers and waste site licence expiry dates tracked against the account, with a warning before the job is booked.
- Customer lookups for SIC code, zone, business type, postal area, priority and site access times.
- Cash and invoice payment terms held separately, with a workflow to convert a cash customer to an account customer.

*Works alongside: Finance & Sage, Skip Hire & RoRo.*

Spec: S2 (all seven line items).

---

## 8. Finance & Sage

*Invoicing, VAT, recurring billing and background posting to Sage.*

- Invoices and tickets post to Sage in the background, across every company you run, without anyone triggering a sync out of hours.
- Nominal codes mapped per product, per tip outlet and per company, so the general ledger posting is right first time.
- T21 domestic reverse charge VAT calculated automatically rather than corrected by hand.
- Recurring monthly billing generated and emailed as PDFs on a schedule.
- Credit notes run through a multi-tier approval workflow before they go anywhere.
- Annual contract price uplifts scheduled and applied across active accounts.

*Works alongside: Customers & Pricing, Multi-Company, Reporting & Dashboards.*

Spec: S8 (all six line items).

---

## 9. Reporting & Dashboards

*Operational, financial and compliance reporting.*

- Consolidated monthly and annual reporting across orders, waste streams and invoices.
- Reports generated as PDFs and dispatched by email on a schedule, so the recurring ones stop being a job.
- A management dashboard showing daily vehicle revenue, ticket margins and tonnage.
- Hazardous waste consignment reports exportable in Environment Agency formats.

*Works alongside: Multi-Company, Finance & Sage, Customer Portal.*

Spec: S11 (reporting engine, PDF dispatch, executive dashboard, hazardous consignment reports).

---

## 10. Multi-Company

*Separate entities with their own VAT, ledgers and branding under one login.*

- One login across every company in the group, with instant switching rather than logging in and out.
- A default organisation per user, so people land where they work.
- Company-specific VAT settings, legal registration numbers and financial rules held independently.
- Invoice templates, logos, remittance addresses and custom headers per company, so each entity invoices as itself.
- One master customer record shared across all entities, which removes the duplicate data entry and the inter-company notes.

*Works alongside: Finance & Sage, Scheduling & Dispatch.*

Spec: S1 (all seven line items).

---

## 11. Hazardous Waste

*Consignment tracking and Environment Agency reporting.*

- Hazardous waste consignment reports exportable in Environment Agency standard formats.
- Consignments tracked per physical unit through the European Waste Catalogue register.
- Restricted outlets and material-to-outlet validation, so hazardous material cannot be routed somewhere unlicensed.
- Duty of care records produced digitally as part of the same movement.

*Moderate spec coverage. Four bullets is honest; do not stretch it to six.*

Spec: S11 (hazardous consignment reports), S3 (EWC register, restricted outlets, WTN).

---

## 12. Customer Portal

*Self-serve ordering, ticket history and site reports for your customers.*

- Scheduled weekly and monthly reports emailed to customers automatically, which takes the recurring report requests off your phone lines.
- Site recycling reports delivered to key accounts without office involvement.
- Self-billing invoice workflows for contracted commercial partners.

*Moderate spec coverage. The spec covers automated client reporting and self-billing. Self-serve ordering is in the module card line but is not described in the spec: confirm before the copy claims it.*

Spec: S11 (customer portal, self-billing).

---

## 13. Ready-Mix Concrete

*Concrete orders, batching schedules and delivery.*

**Thin. The spec mentions concrete twice: daily delivery tickets auto-generated for multi-load concrete orders, and concrete as one of the five dispatch planning views. That is not enough for a popup.**

Either keep it to two honest bullets, or get the detail from the product manager. Do not invent batching plant integration, mix designs or slump records, none of which appear anywhere in the spec.

Spec: S5 (auto-generated daily delivery tickets for multi-load concrete orders), S7 (concrete dispatch view).

---

## 14. Marketing Data Feed

*Job and enquiry data fed back into your Google and Meta campaigns.*

**Thin in the spec, but well understood commercially.** The spec has one line: a Google Ads value feedback loop. The proposition itself is clear and it is the thing no competitor can offer.

Suggested content, which needs sign-off because it goes beyond the spec:

- Completed job and enquiry data fed back into Google and Meta, so advertising is measured against work that was booked and paid for rather than clicks and form fills.
- Budget follows the campaigns producing real jobs.

**Before this goes live** it needs a lawful basis, a data processing agreement between you and the operator, and disclosure in both privacy policies, because it involves processing the operator's customer data for advertising.

Spec: S9 (Google Ads value feedback loop).

---

## 15. Trade Waste

*Route-based commercial collections.*

**No source material. Trade Waste does not appear anywhere in the twelve-section functional spec.**

It was in the original module list and I flagged in the deck that it needs confirming as in-range. Either the product manager supplies the detail, or the module comes off the grid. Writing a popup from nothing would be inventing product capability, which is not a risk worth taking on a compliance software site.

---

## 16. Custom Modules

*Something your operation needs that nobody has built yet.*

- The fifteen standard modules cover how most waste and skip businesses run. They will not cover all of yours, because no two operations are the same.
- If you have a process that matters and no software handles it properly, we scope it, price it and build it as a module of your own.
- It sits alongside the standard modules, uses the same data, and it is yours.
- Custom modules are part of the offering, not a favour.

*No spec source needed. This is a proposition rather than a feature list, and the copy already exists in deck section 2.5.*

---

## Notes for the build

**Popups rather than pages is the right call**, and not only for effort. Modal content still sits in the DOM, so all sixteen descriptions count as content on the Modules page. That gives the hub far more topical depth than sixteen thin pages would, without splitting ranking signals across pages that have no search demand behind them.

**Requirements:** the modal must be keyboard accessible, closeable on Escape, focus-trapped while open, and readable if JavaScript fails. Deep-link each one with a hash such as `#skip-hire` so a module link can be shared and opens the right panel.

**Two things still needed from the product manager**, both of which are content gaps rather than design problems:

1. Trade Waste detail, or confirmation it comes off the grid.
2. Ready-Mix Concrete detail beyond the two lines in the spec.

And one to confirm: whether the Customer Portal really does self-serve ordering, since the module card claims it and the spec does not mention it.
