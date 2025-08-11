# PetPro Vendor Reviews Management Wireframes

## Mobile App Reviews Management

### 1. Reviews Overview Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Reviews & Ratings          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  OVERALL RATING                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ★★★★☆                        │  │
│  │ 4.3 / 5.0                     │  │
│  │ Based on 128 reviews          │  │
│  └───────────────────────────────┘  │
│                                     │
│  RATING BREAKDOWN                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 5★ ███████████████ (82) 64%   │  │
│  │ 4★ ██████ (23) 18%            │  │
│  │ 3★ ███ (12) 9%                │  │
│  │ 2★ █ (6) 5%                   │  │
│  │ 1★ █ (5) 4%                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  FILTER REVIEWS                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Search Reviews 🔍]          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │  All    │ │ Products│ │Services ││
│  └─────────┘ └─────────┘ └─────────┘│
│  ┌─────────┐ ┌─────────┐            │
│  │With Imgs│ │Answered │            │
│  └─────────┘ └─────────┘            │
│                                     │
│  SORT BY: [Most Recent ▼]           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  RECENT REVIEWS                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ★★★★★                        │  │
│  │ Max's Grooming Experience     │  │
│  │ Emily D. • Aug 10, 2025       │  │
│  │                               │  │
│  │ "The groomer was patient      │  │
│  │ with my dog Max who usually   │  │
│  │ doesn't like grooming. He     │  │
│  │ looks amazing now! Will       │  │
│  │ definitely be back."          │  │
│  │                               │  │
│  │ [🖼️ Photo] [🖼️ Photo]         │  │
│  │                               │  │
│  │ Service: Dog Grooming - Full  │  │
│  │                               │  │
│  │ [Reply] [1 Reply ▼]          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ★★☆☆☆                        │  │
│  │ Delivery Issue                │  │
│  │ Robert K. • Aug 9, 2025       │  │
│  │                               │  │
│  │ "Product quality was good,    │  │
│  │ but the delivery took much    │  │
│  │ longer than expected. Almost  │  │
│  │ a week for something          │  │
│  │ advertised as 2-day shipping."│  │
│  │                               │  │
│  │ Product: Premium Dog Food     │  │
│  │                               │  │
│  │ [Reply] [Not Yet Replied]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ★★★★★                        │  │
│  │ Great Product!                │  │
│  │ Sarah J. • Aug 8, 2025        │  │
│  │                               │  │
│  │ "My cat loves this scratching │  │
│  │ post! Sturdy build quality    │  │
│  │ and nice design that fits     │  │
│  │ with my living room decor."   │  │
│  │                               │  │
│  │ [🖼️ Photo]                    │  │
│  │                               │  │
│  │ Product: Cat Scratching Post  │  │
│  │                               │  │
│  │ [Reply] [Not Yet Replied]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  SHOWING 3 OF 128 REVIEWS           │
│  [Load More]                        │
│                                     │
└─────────────────────────────────────┘
 [Dashboard] [Products] [Reviews] [More]
```

### 2. Review Reply Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Reply to Review            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CUSTOMER REVIEW                    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ★★☆☆☆                        │  │
│  │ Delivery Issue                │  │
│  │ Robert K. • Aug 9, 2025       │  │
│  │                               │  │
│  │ "Product quality was good,    │  │
│  │ but the delivery took much    │  │
│  │ longer than expected. Almost  │  │
│  │ a week for something          │  │
│  │ advertised as 2-day shipping."│  │
│  │                               │  │
│  │ Product: Premium Dog Food     │  │
│  │ Order: #PET-58254             │  │
│  └───────────────────────────────┘  │
│                                     │
│  YOUR REPLY                         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │ Dear Robert,                  │  │
│  │                               │  │
│  │ Thank you for your feedback.  │  │
│  │ We apologize for the shipping │  │
│  │ delay with your recent order. │  │
│  │ This doesn't meet our standard│  │
│  │ of service, and we're looking │  │
│  │ into what went wrong.         │  │
│  │                               │  │
│  │ As a token of our apology,    │  │
│  │ we'd like to offer you a 15%  │  │
│  │ discount on your next order.  │  │
│  │ Please contact our customer   │  │
│  │ service team so we can make   │  │
│  │ this right.                   │  │
│  │                               │  │
│  │ Sincerely,                    │  │
│  │ PetPro Vendor Team            │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  SUGGESTED REPLIES                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ • Thank you for your feedback.│  │
│  │   We apologize for the delay. │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ • We're sorry for your        │  │
│  │   experience. We'll make it   │  │
│  │   right with a discount.      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     SUBMIT REPLY              │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Desktop Web Reviews Management

### 1. Reviews Dashboard

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Reviews & Ratings                       [Settings] [Export ▼]    │
│        │                                                                   │
│ □ Dash │  RATING OVERVIEW                                                  │
│ □ Prod │                                                                   │
│ □ Order│  ┌─────────────────────┐ ┌─────────────────────────────────────┐  │
│ □ Appts│  │                     │ │                                     │  │
│ □ Cust │  │  OVERALL RATING     │ │  RATING BREAKDOWN                   │  │
│ □ Invnt│  │                     │ │                                     │  │
│ □ Promn│  │  ★★★★☆             │ │  5★ ███████████████ (82) 64%        │  │
│ ■ Rvws │  │  4.3 / 5.0          │ │  4★ ██████ (23) 18%                 │  │
│ □ Anlys│  │                     │ │  3★ ███ (12) 9%                     │  │
│ □ Setti│  │  Based on 128       │ │  2★ █ (6) 5%                        │  │
│        │  │  reviews            │ │  1★ █ (5) 4%                        │  │
│        │  │                     │ │                                     │  │
│        │  │  Products: 4.2      │ │  RATING TRENDS                      │  │
│        │  │  Services: 4.5      │ │                                     │  │
│        │  │                     │ │  [Line chart showing rating trends  │  │
│        │  │                     │ │   over the past 6 months]           │  │
│        │  │                     │ │                                     │  │
│        │  └─────────────────────┘ └─────────────────────────────────────┘  │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │ [Search Reviews...]   TYPE: [All ▼]  RATING: [All ▼] SORT BY: │ │
│        │  │                                                  [Recent ▼]   ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  REVIEWS                                                          │
│        │                                                                   │
│        │  ┌───────┬────────┬────────────┬────────────────┬────────┬───────┐│
│        │  │RATING │REVIEWER│DATE        │CONTENT         │TYPE    │ACTIONS││
│        │  ├───────┼────────┼────────────┼────────────────┼────────┼───────┤│
│        │  │★★★★★ │Emily D.│Aug 10, 2025│"The groomer was│Service │[Reply]││
│        │  │       │        │            │patient with my │Grooming│       ││
│        │  │       │        │            │dog Max who     │        │       ││
│        │  │       │        │            │usually doesn't │        │       ││
│        │  │       │        │            │like grooming..."│        │       ││
│        │  ├───────┼────────┼────────────┼────────────────┼────────┼───────┤│
│        │  │★★☆☆☆ │Robert K│Aug 9, 2025 │"Product quality│Product │[Reply]││
│        │  │       │        │            │was good, but   │Dog Food│       ││
│        │  │       │        │            │the delivery    │        │       ││
│        │  │       │        │            │took much longer│        │       ││
│        │  │       │        │            │than expected..."│        │       ││
│        │  ├───────┼────────┼────────────┼────────────────┼────────┼───────┤│
│        │  │★★★★★ │Sarah J.│Aug 8, 2025 │"My cat loves   │Product │[Reply]││
│        │  │       │        │            │this scratching │Cat Post│       ││
│        │  │       │        │            │post! Sturdy    │        │       ││
│        │  │       │        │            │build quality..."│        │       ││
│        │  ├───────┼────────┼────────────┼────────────────┼────────┼───────┤│
│        │  │★★★☆☆ │Thomas W│Aug 7, 2025 │"Vaccination    │Service │[Reply]││
│        │  │       │        │            │appointment was │Vaccine │       ││
│        │  │       │        │            │quick but the   │        │       ││
│        │  │       │        │            │wait time was..."│        │       ││
│        │  ├───────┼────────┼────────────┼────────────────┼────────┼───────┤│
│        │  │★★★★★ │Michael │Aug 5, 2025 │"Great checkup  │Service │[Reply]││
│        │  │       │B.      │            │for my dog.     │Checkup │       ││
│        │  │       │        │            │The vet was very│        │       ││
│        │  │       │        │            │thorough and..."│        │       ││
│        │  ├───────┼────────┼────────────┼────────────────┼────────┼───────┤│
│        │  │★★★★☆ │Amanda W│Aug 4, 2025 │"Dental treats  │Product │[Reply]││
│        │  │       │        │            │worked great for│Pet     │       ││
│        │  │       │        │            │my dog's breath.│Treats  │       ││
│        │  │       │        │            │Would buy again"│        │       ││
│        │  └───────┴────────┴────────────┴────────────────┴────────┴───────┘│
│        │                                                                   │
│        │  SHOWING 6 OF 128 REVIEWS               [1] [2] [3] ... [22] >   │
│        │                                                                   │
│        │  REVIEW INSIGHTS                                                  │
│        │                                                                   │
│        │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐        │
│        │  │                │ │                │ │                │        │
│        │  │ NEEDS RESPONSE │ │ TOP PRODUCTS   │ │ TOP SERVICES   │        │
│        │  │     12         │ │                │ │                │        │
│        │  │                │ │ Cat Post: 4.9★ │ │ Grooming: 4.7★ │        │
│        │  │ NEGATIVE       │ │ Dog Food: 4.2★ │ │ Checkup: 4.5★  │        │
│        │  │ REVIEWS        │ │ Pet Treats: 4.4│ │ Vaccine: 3.8★  │        │
│        │  │     11         │ │                │ │                │        │
│        │  └────────────────┘ └────────────────┘ └────────────────┘        │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```

### 2. Review Reply Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Reviews > Reply to Review                                        │
│        │                                                                   │
│ □ Dash │  CUSTOMER REVIEW                                                  │
│ □ Prod │                                                                   │
│ □ Order│  ┌───────────────────────────────────────────────────────────────┐│
│ □ Appts│  │                                                               ││
│ □ Cust │  │ ★★☆☆☆                                                       ││
│ □ Invnt│  │ Delivery Issue                                                ││
│ □ Promn│  │ Robert K. • Aug 9, 2025                                       ││
│ ■ Rvws │  │                                                               ││
│ □ Anlys│  │ "Product quality was good, but the delivery took much longer  ││
│ □ Setti│  │  than expected. Almost a week for something advertised as     ││
│        │  │  2-day shipping."                                             ││
│        │  │                                                               ││
│        │  │ Product: Premium Dog Food                                     ││
│        │  │ Order: #PET-58254                                             ││
│        │  │                                                               ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  CUSTOMER INFO                        ORDER INFO                  │
│        │  Name: Robert Kennedy                 Order Date: Aug 3, 2025     │
│        │  Email: r.kennedy@email.com           Shipped Date: Aug 5, 2025   │
│        │  Phone: (415) 555-7721                Delivered: Aug 8, 2025      │
│        │  Orders: 4 total                      Shipping Method: Express    │
│        │  Avg Rating: 3.2 stars                                            │
│        │  [View Customer Profile]              [View Order Details]        │
│        │                                                                   │
│        │  YOUR REPLY                                                       │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │                                                               ││
│        │  │ Dear Robert,                                                  ││
│        │  │                                                               ││
│        │  │ Thank you for your feedback. We apologize for the shipping    ││
│        │  │ delay with your recent order. This doesn't meet our standard  ││
│        │  │ of service, and we're looking into what went wrong with our   ││
│        │  │ delivery partner.                                             ││
│        │  │                                                               ││
│        │  │ As a token of our apology, we'd like to offer you a 15%       ││
│        │  │ discount on your next order. Please contact our customer      ││
│        │  │ service team at support@petpro.com or call us at              ││
│        │  │ (800) 555-PETS so we can make this right for you.             ││
│        │  │                                                               ││
│        │  │ We value your business and appreciate your understanding.     ││
│        │  │                                                               ││
│        │  │ Sincerely,                                                    ││
│        │  │ PetPro Vendor Team                                            ││
│        │  │                                                               ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  REPLY TEMPLATES                                                  │
│        │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │
│        │  │ Apology       ▼│ │ Thank You    ▼│ │ Follow-Up    ▼│           │
│        │  └───────────────┘ └───────────────┘ └───────────────┘           │
│        │                                                                   │
│        │  SUGGESTED ACTIONS                                                │
│        │  [✓] Send Private Message   [✓] Create Discount Code              │
│        │  [ ] Flag for Manager Review [ ] Mark as Inappropriate            │
│        │                                                                   │
│        │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│        │  │  SUBMIT REPLY   │  │  SAVE DRAFT     │  │  CANCEL         │    │
│        │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```
