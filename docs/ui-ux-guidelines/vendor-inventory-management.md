# PetPro Vendor Inventory Management Wireframes

## Mobile App Inventory Management

### 1. Inventory Overview Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Inventory                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Search Inventory 🔍]        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │Products │ │Low Stock│ │Out Stock││
│  └─────────┘ └─────────┘ └─────────┘│
│                                     │
│  FILTER: [Category ▼]               │
│  SORT: [Recently Updated ▼]         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  INVENTORY ALERTS (5)               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔴 Premium Dog Food           │  │
│  │    Out of stock               │  │
│  │    Last sold: 2 hours ago     │  │
│  │    [Order More] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🟠 Dog Flea Treatment         │  │
│  │    Low stock (2 remaining)    │  │
│  │    Est. days left: 3          │  │
│  │    [Order More] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🟠 Cat Food - Indoor          │  │
│  │    Low stock (3 remaining)    │  │
│  │    Est. days left: 5          │  │
│  │    [Order More] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  PRODUCT INVENTORY                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Image] Premium Dog Food      │  │
│  │ SKU: RC-3458-DF               │  │
│  │ Stock: 0 units                │  │
│  │ Status: Out of Stock          │  │
│  │ [Update Stock] [View Details] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Image] Dog Flea Treatment    │  │
│  │ SKU: DF-5992-FT               │  │
│  │ Stock: 2 units                │  │
│  │ Status: Low Stock             │  │
│  │ [Update Stock] [View Details] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Image] Cat Food - Indoor     │  │
│  │ SKU: CF-6723-IN               │  │
│  │ Stock: 3 units                │  │
│  │ Status: Low Stock             │  │
│  │ [Update Stock] [View Details] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Image] Dog Toy - Chew Bone   │  │
│  │ SKU: DT-8821                  │  │
│  │ Stock: 23 units               │  │
│  │ Status: In Stock              │  │
│  │ [Update Stock] [View Details] │  │
│  └───────────────────────────────┘  │
│                                     │
│  SHOWING 4 OF 28 PRODUCTS           │
│  [Load More]                        │
│                                     │
└─────────────────────────────────────┘
 [Dashboard] [Products] [Inventory] [More]
```

### 2. Product Inventory Detail Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Product Inventory          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Image]                       │  │
│  │ Premium Dog Food - 3kg        │  │
│  │ SKU: RC-3458-DF               │  │
│  └───────────────────────────────┘  │
│                                     │
│  INVENTORY STATUS                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Current Stock: 0 units        │  │
│  │ Status: OUT OF STOCK          │  │
│  │ Reorder Point: 5 units        │  │
│  │ Ideal Stock: 25 units         │  │
│  └───────────────────────────────┘  │
│                                     │
│  UPDATE INVENTORY                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [+] Add Stock                 │  │
│  │ Quantity to add: [    ]       │  │
│  │ [Update Stock]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Set Reorder Point: [    ]     │  │
│  │ [Update]                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  STOCK MOVEMENT HISTORY             │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Aug 11, 2025 - 2 hours ago    │  │
│  │ -3 units (Order #PET-58291)   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Aug 10, 2025 - 1 day ago      │  │
│  │ -5 units (Order #PET-58274)   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Aug 8, 2025 - 3 days ago      │  │
│  │ +20 units (Stock addition)    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Aug 5, 2025 - 6 days ago      │  │
│  │ -8 units (Order #PET-58203)   │  │
│  └───────────────────────────────┘  │
│                                     │
│  [View Full History]                │
│                                     │
│  INVENTORY INSIGHTS                 │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Average Daily Sales: 2.3 units│  │
│  │ Monthly Turnover Rate: 10.5   │  │
│  │ Days Out of Stock: 1          │  │
│  │ Days Low Stock: 5             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     ORDER MORE STOCK          │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Desktop Web Inventory Management

### 1. Inventory Dashboard

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Inventory Management                  [+ Add Stock] [Export ▼]   │
│        │                                                                   │
│ □ Dash │  ┌─────────────────────────────────────────────────────────────┐  │
│ □ Prod │  │ [Search Inventory...]  CATEGORY: [All ▼]  STATUS: [All ▼]   │  │
│ □ Order│  └─────────────────────────────────────────────────────────────┘  │
│ □ Appts│                                                                   │
│ □ Cust │  INVENTORY ALERTS                                                 │
│ ■ Invnt│                                                                   │
│ □ Promn│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│ □ Rvws │  │            │ │            │ │            │ │            │     │
│ □ Anlys│  │ OUT OF     │ │ LOW        │ │ EXPIRING   │ │ SLOW       │     │
│ □ Setti│  │ STOCK      │ │ STOCK      │ │ SOON       │ │ MOVING     │     │
│        │  │   1        │ │   4        │ │   2        │ │   5        │     │
│        │  │            │ │            │ │            │ │            │     │
│        │  │ [View All] │ │ [View All] │ │ [View All] │ │ [View All] │     │
│        │  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
│        │                                                                   │
│        │  PRODUCT INVENTORY                                                │
│        │                                                                   │
│        │  ┌───────┬────────────────────┬─────────┬────────┬─────────────┐ │
│        │  │PRODUCT│NAME                │SKU      │STOCK   │STATUS       │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Premium Dog Food    │RC-3458  │0       │OUT OF STOCK │ │
│        │  │       │3kg                 │-DF      │        │             │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Dog Flea Treatment  │DF-5992  │2       │LOW STOCK    │ │
│        │  │       │60ml                │-FT      │        │[Reorder]    │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Cat Food - Indoor   │CF-6723  │3       │LOW STOCK    │ │
│        │  │       │2kg                 │-IN      │        │[Reorder]    │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Dog Toy - Chew Bone │DT-8821  │23      │IN STOCK     │ │
│        │  │       │Medium              │         │        │             │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Cat Scratching Post │CP-3320  │8       │IN STOCK     │ │
│        │  │       │Standard            │         │        │             │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Dog Vitamins        │DV-9921  │4       │LOW STOCK    │ │
│        │  │       │60 tablets          │         │        │[Reorder]    │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Pet Shampoo         │PS-1122  │5       │LOW STOCK    │ │
│        │  │       │250ml               │         │        │[Reorder]    │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Cat Litter - Clump  │CL-4429  │12      │IN STOCK     │ │
│        │  │       │10kg                │         │        │             │ │
│        │  ├───────┼────────────────────┼─────────┼────────┼─────────────┤ │
│        │  │[Img]  │Pet Dental Treats   │DT-7788  │0       │OUT OF STOCK │ │
│        │  │       │200g                │         │        │[Backorder]  │ │
│        │  └───────┴────────────────────┴─────────┴────────┴─────────────┘ │
│        │                                                                   │
│        │  SHOWING 10 OF 28 PRODUCTS            [1] [2] [3] Next >         │
│        │                                                                   │
│        │  INVENTORY MANAGEMENT TOOLS                                       │
│        │                                                                   │
│        │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│        │  │ BULK       │ │ INVENTORY  │ │ BARCODE    │ │ REORDER    │     │
│        │  │ UPDATE     │ │ REPORTS    │ │ GENERATOR  │ │ CALCULATOR │     │
│        │  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```

### 2. Product Inventory Detail Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Inventory > Premium Dog Food                   [Print] [Export]  │
│        │                                                                   │
│ □ Dash │  ┌─────────────────────────┐ ┌─────────────────────────────────┐  │
│ □ Prod │  │                         │ │                                 │  │
│ □ Order│  │  PRODUCT INFORMATION    │ │  INVENTORY STATUS               │  │
│ □ Appts│  │                         │ │                                 │  │
│ □ Cust │  │  [Product Image]        │ │  Current Stock: 0 units         │  │
│ ■ Invnt│  │                         │ │  Status: OUT OF STOCK           │  │
│ □ Promn│  │  Name: Premium Dog Food │ │                                 │  │
│ □ Rvws │  │  SKU: RC-3458-DF        │ │  Reorder Point: 5 units         │  │
│ □ Anlys│  │  Category: Pet Food     │ │  Ideal Stock Level: 25 units    │  │
│ □ Setti│  │  Brand: Royal Canine    │ │  Safety Stock: 10 units         │  │
│        │  │  Weight: 3kg            │ │                                 │  │
│        │  │  Dimensions:            │ │  Min Order Quantity: 10 units   │  │
│        │  │  30cm × 15cm × 45cm     │ │  Lead Time: 3-5 days            │  │
│        │  │                         │ │                                 │  │
│        │  │  [View Product Details] │ │  Last Restock Date:             │  │
│        │  │                         │ │  August 8, 2025                 │  │
│        │  └─────────────────────────┘ └─────────────────────────────────┘  │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │ UPDATE INVENTORY                                              ││
│        │  │                                                               ││
│        │  │  ┌─────────────────────────┐  ┌─────────────────────────────┐ ││
│        │  │  │                         │  │                             │ ││
│        │  │  │  ADD STOCK              │  │  ADJUST PARAMETERS          │ ││
│        │  │  │                         │  │                             │ ││
│        │  │  │  Quantity to add:       │  │  Reorder Point:             │ ││
│        │  │  │  [______]               │  │  [______]                   │ ││
│        │  │  │                         │  │                             │ ││
│        │  │  │  Purchase Price:        │  │  Ideal Stock Level:         │ ││
│        │  │  │  [______]               │  │  [______]                   │ ││
│        │  │  │                         │  │                             │ ││
│        │  │  │  Supplier:              │  │  Safety Stock:              │ ││
│        │  │  │  [_____________▼]       │  │  [______]                   │ ││
│        │  │  │                         │  │                             │ ││
│        │  │  │  Batch/Lot Number:      │  │  Min Order Quantity:        │ ││
│        │  │  │  [______]               │  │  [______]                   │ ││
│        │  │  │                         │  │                             │ ││
│        │  │  │  Expiration Date:       │  │  Lead Time (days):          │ ││
│        │  │  │  [______]               │  │  [______]                   │ ││
│        │  │  │                         │  │                             │ ││
│        │  │  │  [Update Inventory]     │  │  [Save Changes]             │ ││
│        │  │  │                         │  │                             │ ││
│        │  │  └─────────────────────────┘  └─────────────────────────────┘ ││
│        │  │                                                               ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  INVENTORY MOVEMENT HISTORY                                       │
│        │                                                                   │
│        │  ┌────────┬───────────┬──────────┬──────────┬────────┬──────────┐ │
│        │  │DATE    │TRANSACTION│QUANTITY  │BALANCE   │USER    │REFERENCE │ │
│        │  ├────────┼───────────┼──────────┼──────────┼────────┼──────────┤ │
│        │  │Aug 11  │Order      │-3 units  │0 units   │System  │Order     │ │
│        │  │2025    │Fulfillment│          │          │        │#PET-58291│ │
│        │  ├────────┼───────────┼──────────┼──────────┼────────┼──────────┤ │
│        │  │Aug 10  │Order      │-5 units  │3 units   │System  │Order     │ │
│        │  │2025    │Fulfillment│          │          │        │#PET-58274│ │
│        │  ├────────┼───────────┼──────────┼──────────┼────────┼──────────┤ │
│        │  │Aug 8   │Stock      │+20 units │8 units   │John    │Purchase  │ │
│        │  │2025    │Addition   │          │          │Davis   │#INV-4482 │ │
│        │  ├────────┼───────────┼──────────┼──────────┼────────┼──────────┤ │
│        │  │Aug 5   │Order      │-8 units  │-12 units │System  │Order     │ │
│        │  │2025    │Fulfillment│          │          │        │#PET-58203│ │
│        │  └────────┴───────────┴──────────┴──────────┴────────┴──────────┘ │
│        │                                                                   │
│        │  [View Complete Movement History]                                 │
│        │                                                                   │
│        │  INVENTORY ANALYTICS                                              │
│        │                                                                   │
│        │  ┌─────────────────────────┐ ┌─────────────────────────────────┐  │
│        │  │                         │ │                                 │  │
│        │  │  USAGE STATISTICS       │ │  RECOMMENDATIONS                │  │
│        │  │                         │ │                                 │  │
│        │  │  Avg Daily Usage:       │ │  Reorder Now:                   │  │
│        │  │  2.3 units              │ │  Stock levels below threshold   │  │
│        │  │                         │ │                                 │  │
│        │  │  Monthly Usage:         │ │  Suggested Order:               │  │
│        │  │  69 units               │ │  25 units                       │  │
│        │  │                         │ │                                 │  │
│        │  │  Turnover Rate:         │ │  Estimated Cost:                │  │
│        │  │  10.5                   │ │  $375.00                        │  │
│        │  │                         │ │                                 │  │
│        │  │  Days Out of Stock:     │ │  Est. Next Reorder:             │  │
│        │  │  1 day                  │ │  September 14, 2025             │  │
│        │  │                         │ │                                 │  │
│        │  │  Days Low Stock:        │ │  [Place Order Now]              │  │
│        │  │  5 days                 │ │                                 │  │
│        │  └─────────────────────────┘ └─────────────────────────────────┘  │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```
