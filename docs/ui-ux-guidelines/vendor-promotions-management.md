# PetPro Vendor Promotions & Marketing Management Wireframes

## Mobile App Promotions Management

### 1. Promotions Overview Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Promotions & Marketing     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Search Promotions 🔍]       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │ Active  │ │Scheduled│ │ Expired ││
│  └─────────┘ └─────────┘ └─────────┘│
│                                     │
│  ACTIVE PROMOTIONS (3)              │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🏷️ Summer Sale - 20% OFF      │  │
│  │ Code: SUMMER20                │  │
│  │ All products                  │  │
│  │ Aug 1 - Aug 31, 2025          │  │
│  │ Used: 145 times               │  │
│  │ [Edit] [Pause] [View Details] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎁 Buy 1 Get 1 Free           │  │
│  │ Dog Toys Category             │  │
│  │ Aug 5 - Aug 15, 2025          │  │
│  │ Used: 58 times                │  │
│  │ [Edit] [Pause] [View Details] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 💲 Free Shipping              │  │
│  │ Orders over $50               │  │
│  │ Aug 1 - Aug 31, 2025          │  │
│  │ Used: 72 times                │  │
│  │ [Edit] [Pause] [View Details] │  │
│  └───────────────────────────────┘  │
│                                     │
│  SCHEDULED PROMOTIONS (2)           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📅 Back to School - 15% OFF   │  │
│  │ Code: SCHOOL15                │  │
│  │ All products                  │  │
│  │ Sep 1 - Sep 15, 2025          │  │
│  │ [Edit] [Cancel] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📅 Premium Food Discount      │  │
│  │ Code: PREMIUM10               │  │
│  │ Dog & Cat Food category       │  │
│  │ Sep 5 - Sep 20, 2025          │  │
│  │ [Edit] [Cancel] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     + CREATE PROMOTION        │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
 [Dashboard] [Products] [Promos] [More]
```

### 2. Create/Edit Promotion Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Create Promotion           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  PROMOTION DETAILS                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Promotion Name:               │  │
│  │ [Fall Season Sale           ] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Promo Code:                   │  │
│  │ [FALL25                     ] │  │
│  │ [Generate Random Code]        │  │
│  └───────────────────────────────┘  │
│                                     │
│  PROMOTION TYPE                     │
│                                     │
│  ○ Percentage Discount             │
│  ● Fixed Amount Discount           │
│  ○ Free Shipping                   │
│  ○ Buy X Get Y                     │
│  ○ Bundle Discount                 │
│                                     │
│  DISCOUNT AMOUNT                    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Amount: $ [10.00            ] │  │
│  └───────────────────────────────┘  │
│                                     │
│  APPLIES TO                         │
│                                     │
│  ○ All Products                     │
│  ● Specific Categories             │
│  ○ Specific Products               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Select Categories:             │  │
│  │ ✓ Dog Food                    │  │
│  │ ✓ Cat Food                    │  │
│  │ □ Dog Toys                    │  │
│  │ □ Cat Toys                    │  │
│  │ □ Grooming Supplies           │  │
│  │ □ Medications                 │  │
│  │ □ Pet Beds                    │  │
│  │ [Select Products]             │  │
│  └───────────────────────────────┘  │
│                                     │
│  USAGE LIMITS                       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Minimum Order Amount:         │  │
│  │ $ [30.00                    ] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Max Uses Per Customer:        │  │
│  │ [2                          ] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Total Allowed Uses:           │  │
│  │ [500                        ] │  │
│  │ □ Unlimited                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  PROMOTION PERIOD                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Start Date:                   │  │
│  │ [Oct 1, 2025               ▼] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ End Date:                     │  │
│  │ [Oct 31, 2025              ▼] │  │
│  └───────────────────────────────┘  │
│                                     │
│  PROMOTION DESCRIPTION              │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Get $10 off your pet food    │  │
│  │ purchase when you spend $30   │  │
│  │ or more! Valid on dog and cat │  │
│  │ food items.]                  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     SAVE PROMOTION            │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Desktop Web Promotions Management

### 1. Promotions Dashboard

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Promotions & Marketing                [+ New Promotion] [Export]│
│        │                                                                   │
│ □ Dash │  ┌──────────────────┐  ┌───────────────────────────────────────┐  │
│ □ Prod │  │                  │  │ PROMOTION PERFORMANCE                 │  │
│ □ Order│  │ PROMOTION        │  │                                       │  │
│ □ Appts│  │ SUMMARY          │  │ [Line chart showing promotion usage   │  │
│ □ Cust │  │                  │  │  and sales over time]                 │  │
│ □ Invnt│  │ Active: 3        │  │                                       │  │
│ ■ Promn│  │ Scheduled: 2     │  │ Total Revenue from Promotions:        │  │
│ □ Rvws │  │ Expired: 12      │  │ $8,425.30 (Last 30 Days)              │  │
│ □ Anlys│  │                  │  │                                       │  │
│ □ Setti│  │ Total Revenue    │  │ Most Popular Promotion:               │  │
│        │  │ Generated:       │  │ Summer Sale - 20% OFF                 │  │
│        │  │ $12,350.75       │  │ 145 uses, $4,890.25 revenue           │  │
│        │  │                  │  │                                       │  │
│        │  │ Promotion ROI:   │  │                                       │  │
│        │  │ 325%             │  │                                       │  │
│        │  │                  │  │                                       │  │
│        │  └──────────────────┘  └───────────────────────────────────────┘  │
│        │                                                                   │
│        │  PROMOTIONS                                                       │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │ [Search...]   STATUS: [All ▼]  TYPE: [All ▼]  SORT: [Recent ▼]││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  ┌─────────┬────────────┬──────────┬────────┬─────────┬─────────┐ │
│        │  │NAME     │CODE        │DISCOUNT  │PERIOD  │USED     │ACTIONS  │ │
│        │  ├─────────┼────────────┼──────────┼────────┼─────────┼─────────┤ │
│        │  │Summer   │SUMMER20    │20% off   │Aug 1-31│145/500  │[Edit]   │ │
│        │  │Sale     │            │All items │2025    │$4,890.25│[Pause]  │ │
│        │  │         │            │          │        │         │[Details]│ │
│        │  ├─────────┼────────────┼──────────┼────────┼─────────┼─────────┤ │
│        │  │Buy 1    │BOGO-TOYS   │Buy 1     │Aug 5-15│58/200   │[Edit]   │ │
│        │  │Get 1    │            │Get 1 Free│2025    │$2,134.50│[Pause]  │ │
│        │  │Free     │            │Dog Toys  │        │         │[Details]│ │
│        │  ├─────────┼────────────┼──────────┼────────┼─────────┼─────────┤ │
│        │  │Free     │SHIP50      │Free      │Aug 1-31│72/300   │[Edit]   │ │
│        │  │Shipping │            │Shipping  │2025    │$1,400.55│[Pause]  │ │
│        │  │         │            │Over $50  │        │         │[Details]│ │
│        │  ├─────────┼────────────┼──────────┼────────┼─────────┼─────────┤ │
│        │  │Back to  │SCHOOL15    │15% off   │Sep 1-15│0/300    │[Edit]   │ │
│        │  │School   │            │All items │2025    │$0.00    │[Cancel] │ │
│        │  │Sale     │            │          │        │         │[Details]│ │
│        │  ├─────────┼────────────┼──────────┼────────┼─────────┼─────────┤ │
│        │  │Premium  │PREMIUM10   │10% off   │Sep 5-20│0/250    │[Edit]   │ │
│        │  │Food     │            │Pet Food  │2025    │$0.00    │[Cancel] │ │
│        │  │Discount │            │          │        │         │[Details]│ │
│        │  └─────────┴────────────┴──────────┴────────┴─────────┴─────────┘ │
│        │                                                                   │
│        │  MARKETING TOOLS                                                  │
│        │                                                                   │
│        │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│        │  │ EMAIL      │ │ SOCIAL     │ │ BANNER     │ │ CUSTOMER   │     │
│        │  │ CAMPAIGNS  │ │ MEDIA      │ │ CREATOR    │ │ LOYALTY    │     │
│        │  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```

### 2. Create/Edit Promotion Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Promotions > Create Promotion                                    │
│        │                                                                   │
│ □ Dash │  PROMOTION BASICS                                                 │
│ □ Prod │                                                                   │
│ □ Order│  ┌─────────────────────────┐ ┌─────────────────────────────────┐  │
│ □ Appts│  │                         │ │                                 │  │
│ □ Cust │  │  PROMOTION DETAILS      │ │  PROMOTION TYPE                 │  │
│ □ Invnt│  │                         │ │                                 │  │
│ ■ Promn│  │  Promotion Name:        │ │  ○ Percentage Discount          │  │
│ □ Rvws │  │  [Fall Season Sale    ] │ │  ● Fixed Amount Discount        │  │
│ □ Anlys│  │                         │ │  ○ Free Shipping                │  │
│ □ Setti│  │  Promotion Code:        │ │  ○ Buy X Get Y                  │  │
│        │  │  [FALL25              ] │ │  ○ Bundle Discount              │  │
│        │  │  [Generate Random Code] │ │  ○ Gift With Purchase           │  │
│        │  │                         │ │                                 │  │
│        │  │  Status:                │ │  Fixed Amount:                  │  │
│        │  │  ○ Active              │ │  $ [10.00                     ] │  │
│        │  │  ● Scheduled           │ │                                 │  │
│        │  │  ○ Draft               │ │                                 │  │
│        │  │                         │ │                                 │  │
│        │  └─────────────────────────┘ └─────────────────────────────────┘  │
│        │                                                                   │
│        │  PROMOTION RULES                                                  │
│        │                                                                   │
│        │  ┌─────────────────────────┐ ┌─────────────────────────────────┐  │
│        │  │                         │ │                                 │  │
│        │  │  APPLIES TO             │ │  ELIGIBILITY & LIMITS           │  │
│        │  │                         │ │                                 │  │
│        │  │  ○ All Products        │ │  Minimum Order Amount:          │  │
│        │  │  ● Specific Categories  │ │  $ [30.00                     ] │  │
│        │  │  ○ Specific Products    │ │                                 │  │
│        │  │                         │ │  Customer Groups:               │  │
│        │  │  ✓ Dog Food            │ │  [All Customers         ▼]      │  │
│        │  │  ✓ Cat Food            │ │                                 │  │
│        │  │  □ Dog Toys            │ │  Max Uses Per Customer:         │  │
│        │  │  □ Cat Toys            │ │  [2                           ] │  │
│        │  │  □ Grooming Supplies    │ │                                 │  │
│        │  │  □ Medications         │ │  Total Allowed Uses:            │  │
│        │  │  □ Pet Beds            │ │  [500                         ] │  │
│        │  │                         │ │  □ Unlimited                    │  │
│        │  │  [Advanced Product      │ │                                 │  │
│        │  │   Selection]            │ │  Can be combined with other     │  │
│        │  │                         │ │  promotions:                    │  │
│        │  │                         │ │  ○ Yes  ● No                   │  │
│        │  └─────────────────────────┘ └─────────────────────────────────┘  │
│        │                                                                   │
│        │  PROMOTION SCHEDULE                                               │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │                                                               ││
│        │  │  Start Date: [10/01/2025 ▼]   Time: [00:00 ▼] [AM ▼]         ││
│        │  │                                                               ││
│        │  │  End Date:   [10/31/2025 ▼]   Time: [23:59 ▼] [PM ▼]         ││
│        │  │                                                               ││
│        │  │  Time Zone:  [UTC-07:00 Pacific Time ▼]                       ││
│        │  │                                                               ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  PROMOTION CONTENT                                                │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │                                                               ││
│        │  │  Description:                                                 ││
│        │  │  [Get $10 off your pet food purchase when you spend $30 or   ││
│        │  │   more! Valid on dog and cat food items.]                     ││
│        │  │                                                               ││
│        │  │  Short Description (for cart display):                        ││
│        │  │  [FALL25: $10 off pet food items]                             ││
│        │  │                                                               ││
│        │  │  ┌─────────────────────┐   ┌─────────────────────┐           ││
│        │  │  │ Upload Banner Image │   │ Add Promotion Terms │           ││
│        │  │  └─────────────────────┘   └─────────────────────┘           ││
│        │  │                                                               ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  PROMOTION TRACKING                                               │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │                                                               ││
│        │  │  Campaign Tracking Code: [fall_food_promo_2025]                ││
│        │  │                                                               ││
│        │  │  Analytics Tags:         [food, discount, fall_season]         ││
│        │  │                                                               ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│        │  │  SAVE PROMOTION │  │  SAVE AS DRAFT  │  │     CANCEL      │    │
│        │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```
