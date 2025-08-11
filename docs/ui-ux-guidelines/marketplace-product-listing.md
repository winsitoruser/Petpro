# PetPro Marketplace Product Listing Wireframes

## Mobile App Product Listing Pages

### 1. Product Category Overview

```
┌─────────────────────────────────────┐
│                                     │
│  [Back] Shop Products    [Search 🔍] │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CATEGORIES                         │
│                                     │
│  ┌───────────┐ ┌───────────┐        │
│  │  [Icon]   │ │  [Icon]   │        │
│  │   Food    │ │ Medicines │        │
│  └───────────┘ └───────────┘        │
│                                     │
│  ┌───────────┐ ┌───────────┐        │
│  │  [Icon]   │ │  [Icon]   │        │
│  │ Supplies  │ │  Toys     │        │
│  └───────────┘ └───────────┘        │
│                                     │
│  ┌───────────┐ ┌───────────┐        │
│  │  [Icon]   │ │  [Icon]   │        │
│  │ Grooming  │ │ Accessories│       │
│  └───────────┘ └───────────┘        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  FEATURED PRODUCTS                  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │[Product]│ │[Product]│ │[Product]││
│  │Premium  │ │Healthy  │ │Pet Bed  ││
│  │Dog Food │ │Cat Food │ │Comfort  ││
│  │$25.99   │ │$22.50   │ │$45.99   ││
│  └─────────┘ └─────────┘ └─────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  DEALS & DISCOUNTS                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Banner Image]               │  │
│  │  20% OFF ALL PET TOYS         │  │
│  │  Use Code: PLAYTIME20         │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
   [Home]   [Appts]  [Shop]  [Profile]
```

### 2. Product Listing By Category

```
┌─────────────────────────────────────┐
│                                     │
│  [Back] Pet Food        [Filter ≡]  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────┐            │
│  │  [Search Products 🔍]│            │
│  └─────────────────────┘            │
│                                     │
├─────────────────────────────────────┤
│  SUBCATEGORIES                      │
│                                     │
│  [Dog Food] [Cat Food] [Bird Food]  │
│  [Fish Food] [Small Animal Food]    │
│                                     │
├─────────────────────────────────────┤
│  SORT BY: [Popularity ▼]            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Premium Dog Food             │  │
│  │  Brand: Royal Canin           │  │
│  │  ★★★★★ 4.8 (235 reviews)      │  │
│  │  $25.99                       │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Organic Puppy Food           │  │
│  │  Brand: Pedigree              │  │
│  │  ★★★★☆ 4.2 (186 reviews)      │  │
│  │  $19.99   $24.99              │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Senior Dog Food              │  │
│  │  Brand: Hills Science         │  │
│  │  ★★★★☆ 4.5 (128 reviews)      │  │
│  │  $28.50                       │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Grain-Free Dog Food          │  │
│  │  Brand: Blue Buffalo          │  │
│  │  ★★★★☆ 4.3 (96 reviews)       │  │
│  │  $32.99                       │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Load More Products]               │
│                                     │
└─────────────────────────────────────┘
   [Home]   [Appts]  [Shop]  [Profile]
```

### 3. Product Filter Modal

```
┌─────────────────────────────────────┐
│                                     │
│  Filters                   [Close X]│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  PRICE RANGE                        │
│                                     │
│  $0 ─────O──────────────O───── $100 │
│  Min: $15        Max: $75           │
│                                     │
├─────────────────────────────────────┤
│  BRAND                              │
│                                     │
│  [✓] Royal Canin                    │
│  [✓] Pedigree                       │
│  [ ] Blue Buffalo                   │
│  [ ] Hills Science                  │
│  [ ] Purina                         │
│  [ ] Whiskas                        │
│  [ ] Friskies                       │
│  [ ] IAMS                           │
│  [ ] Eukanuba                       │
│  [Show More]                        │
│                                     │
├─────────────────────────────────────┤
│  RATING                             │
│                                     │
│  [ ] ★★★★★ & up                     │
│  [✓] ★★★★☆ & up                     │
│  [ ] ★★★☆☆ & up                     │
│  [ ] ★★☆☆☆ & up                     │
│  [ ] All ratings                    │
│                                     │
├─────────────────────────────────────┤
│  DIETARY NEEDS                      │
│                                     │
│  [ ] Grain-Free                     │
│  [ ] Organic                        │
│  [ ] Hypoallergenic                 │
│  [✓] Weight Control                 │
│  [ ] Sensitive Digestion            │
│                                     │
├─────────────────────────────────────┤
│  PET SIZE                           │
│                                     │
│  [ ] Small Breeds                   │
│  [✓] Medium Breeds                  │
│  [ ] Large Breeds                   │
│  [ ] All Sizes                      │
│                                     │
├─────────────────────────────────────┤
│  PET AGE                            │
│                                     │
│  [ ] Puppy/Kitten                   │
│  [✓] Adult                          │
│  [ ] Senior                         │
│  [ ] All Ages                       │
│                                     │
├─────────────────────────────────────┤
│  AVAILABILITY                       │
│                                     │
│  [✓] In Stock                       │
│  [ ] Available for Preorder         │
│  [ ] Include Out of Stock           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [Clear All Filters]  [Apply (12)]  │
│                                     │
└─────────────────────────────────────┘
```

### 4. Product Search Results

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Search Results   [Filter ≡]│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  dog food 🔍                  │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  45 Results  •  SORT BY: [Relevance▼]│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Premium Dog Food             │  │
│  │  Brand: Royal Canin           │  │
│  │  ★★★★★ 4.8 (235 reviews)      │  │
│  │  $25.99                       │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Organic Puppy Food           │  │
│  │  Brand: Pedigree              │  │
│  │  ★★★★☆ 4.2 (186 reviews)      │  │
│  │  $19.99   $24.99              │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Senior Dog Food              │  │
│  │  Brand: Hills Science         │  │
│  │  ★★★★☆ 4.5 (128 reviews)      │  │
│  │  $28.50                       │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Product Image]              │  │
│  │  Grain-Free Dog Food          │  │
│  │  Brand: Blue Buffalo          │  │
│  │  ★★★★☆ 4.3 (96 reviews)       │  │
│  │  $32.99                       │  │
│  │  [Add to Cart]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Load More Results]                │
│                                     │
└─────────────────────────────────────┘
   [Home]   [Appts]  [Shop]  [Profile]
```

## Desktop Web Product Listing Pages

### 1. Product Category Landing Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Logo  [Search Products]                 Cart (3) | Sign In | Help   │
├────────────────────────────────────────────────────────────────────────────┤
│ Home > Shop                                                                │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ SHOP   │  SHOP BY CATEGORY                                                 │
│ BY     │                                                                   │
│        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐   │
│ Pet    │  │  [Image]    │  │  [Image]    │  │  [Image]    │  │ [Image] │   │
│ ▼ Dog  │  │             │  │             │  │             │  │         │   │
│   Cat  │  │  Dog Food   │  │  Cat Food   │  │  Medicines  │  │  Toys   │   │
│   Bird │  │             │  │             │  │             │  │         │   │
│   Fish │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘   │
│   Other│                                                                   │
│        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐   │
│ Type   │  │  [Image]    │  │  [Image]    │  │  [Image]    │  │ [Image] │   │
│   Food │  │             │  │             │  │             │  │         │   │
│   Meds │  │  Grooming   │  │ Accessories │  │  Training   │  │ Bedding │   │
│   Supp │  │             │  │             │  │             │  │         │   │
│   Toys │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘   │
│        │                                                                   │
│ Brand  │  FEATURED BRANDS                                                  │
│   Royal│                                                                   │
│   Ped  │  [Brand Logo] [Brand Logo] [Brand Logo] [Brand Logo] [More >]    │
│   Hill │                                                                   │
│   Blue │  CURRENT DEALS                                                    │
│   More │                                                                   │
│        │  ┌─────────────────────────────────────────────────────────────┐  │
│ Price  │  │  [Banner Image]                                             │  │
│   $0-25│  │  SUMMER SALE - 20% OFF ALL DOG & CAT TOYS                   │  │
│   $25+ │  │  Use Code: SUMMER20                                         │  │
│        │  └─────────────────────────────────────────────────────────────┘  │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```

### 2. Product Listing Page (Category View)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Logo  [Search Products]                 Cart (3) | Sign In | Help   │
├────────────────────────────────────────────────────────────────────────────┤
│ Home > Shop > Dog Food                                                     │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ REFINE │  DOG FOOD (45 Products)                                           │
│        │  ┌──────────────────────────────────────┬──────────────────────┐  │
│ Price  │  │ Browse By: Dry Food | Wet Food | All │ Sort By: [Popular ▼] │  │
│ ▼$0-100│  └──────────────────────────────────────┴──────────────────────┘  │
│        │                                                                   │
│ Brand  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐   │
│ ▼Royal │  │  [Image]    │  │  [Image]    │  │  [Image]    │  │ [Image] │   │
│  Hill  │  │             │  │             │  │             │  │         │   │
│  Ped   │  │  Premium    │  │  Organic    │  │  Senior     │  │ Grain-  │   │
│  Blue  │  │  Dog Food   │  │  Puppy Food │  │  Dog Food   │  │ Free    │   │
│  More  │  │             │  │             │  │             │  │         │   │
│        │  │  Royal Canin│  │  Pedigree   │  │  Hills      │  │ Blue    │   │
│ Age    │  │  ★★★★★ 4.8  │  │  ★★★★☆ 4.2  │  │  ★★★★☆ 4.5  │  │ ★★★★☆ 4.3│   │
│ ▼Puppy │  │             │  │             │  │             │  │         │   │
│  Adult │  │  $25.99     │  │  $19.99     │  │  $28.50     │  │ $32.99  │   │
│  Senior│  │  [Add Cart] │  │  [Add Cart] │  │  [Add Cart] │  │[Add Cart]│   │
│        │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘   │
│ Size   │                                                                   │
│ ▼Small │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐   │
│  Medium│  │  [Image]    │  │  [Image]    │  │  [Image]    │  │ [Image] │   │
│  Large │  │             │  │             │  │             │  │         │   │
│        │  │  Weight     │  │  Sensitive  │  │  Limited    │  │ Large   │   │
│ Special│  │  Control    │  │  Digestion  │  │  Ingredient │  │ Breed   │   │
│ ▼Diet  │  │             │  │             │  │             │  │         │   │
│  Allrg │  │  IAMS       │  │  Purina     │  │  Nutro      │  │ Eukanuba│   │
│  Wght  │  │  ★★★★☆ 4.1  │  │  ★★★★☆ 4.4  │  │  ★★★★☆ 4.2  │  │ ★★★★★ 4.7│   │
│  Sensi │  │             │  │             │  │             │  │         │   │
│        │  │  $24.99     │  │  $30.50     │  │  $36.99     │  │ $38.50  │   │
│        │  │  [Add Cart] │  │  [Add Cart] │  │  [Add Cart] │  │[Add Cart]│   │
│ Rating │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘   │
│ ▼★★★★★ │                                                                   │
│  ★★★★☆ │  [1] [2] [3] [4] [5] ... [Next >]                                │
│  ★★★☆☆ │                                                                   │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```
