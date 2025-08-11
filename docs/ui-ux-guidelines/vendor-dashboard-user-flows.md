# PetPro Vendor Dashboard User Flow Diagrams

This document outlines the user flows for the PetPro vendor dashboard, showing connections between different screens and the typical user journeys through the application.

## Login & Navigation Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│  Login Page  │────►│ Verification │────►│   Vendor     │
│              │     │    (2FA)     │     │  Dashboard   │
└──────────────┘     └──────────────┘     └───────┬──────┘
                                                  │
                      ┌─────────────────────────┐ │
                      │                         │ │
                      │  ┌─────────────────────────────────────────┐
                      │  │                      │ │                │
                      │  ▼                      ▼ ▼                ▼
              ┌───────────────┐     ┌──────────────┐     ┌────────────────┐
              │               │     │              │     │                │
              │ Order         │     │ Appointment  │     │ Inventory      │
              │ Management    │     │ Management   │     │ Management     │
              │               │     │              │     │                │
              └───────┬───────┘     └──────┬───────┘     └────────┬───────┘
                      │                    │                      │
                      ▼                    ▼                      ▼
              ┌───────────────┐     ┌──────────────┐     ┌────────────────┐
              │               │     │              │     │                │
              │ Order Detail  │     │ Appointment  │     │ Product        │
              │ View & Update │     │ Detail View  │     │ Detail View    │
              │               │     │              │     │                │
              └───────────────┘     └──────────────┘     └────────────────┘

                      ┌─────────────────────────┐
                      │                         │
                      ▼                         ▼
              ┌───────────────┐     ┌──────────────┐     ┌────────────────┐
              │               │     │              │     │                │
              │ Reviews       │     │ Promotions   │     │ Analytics      │
              │ Management    │     │ Management   │     │ Dashboard      │
              │               │     │              │     │                │
              └───────┬───────┘     └──────┬───────┘     └────────┬───────┘
                      │                    │                      │
                      ▼                    ▼                      ▼
              ┌───────────────┐     ┌──────────────┐     ┌────────────────┐
              │               │     │              │     │                │
              │ Review Detail │     │ Promotion    │     │ Detailed       │
              │ & Response    │     │ Create/Edit  │     │ Reports        │
              │               │     │              │     │                │
              └───────────────┘     └──────────────┘     └────────────────┘

                                   ┌──────────────┐
                                   │              │
                                   │  Settings    │
                                   │              │
                                   └──────┬───────┘
                                          │
                    ┌───────────┬─────────┼─────────┬───────────┐
                    │           │         │         │           │
                    ▼           ▼         ▼         ▼           ▼
            ┌───────────┐ ┌──────────┐ ┌───────┐ ┌───────┐ ┌──────────┐
            │ Profile   │ │ Business │ │Payment│ │Shipping│ │Store     │
            │ Settings  │ │ Info     │ │Methods│ │Settings│ │Settings  │
            └───────────┘ └──────────┘ └───────┘ └───────┘ └──────────┘
```

## Order Management Flow

```
┌──────────────┐     ┌───────────────┐     ┌─────────────────┐
│              │     │               │     │                 │
│ Dashboard    │────►│ Order         │────►│ Filter & Search │
│ (Orders      │     │ Management    │     │ Orders          │
│  Summary)    │     │               │     │                 │
└──────────────┘     └───────┬───────┘     └────────┬────────┘
                             │                      │
                             ▼                      │
                     ┌───────────────┐              │
                     │               │              │
                     │ Order List    │◄─────────────┘
                     │               │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │               │
                     │ Order Detail  │
                     │ View          │
                     │               │
                     └───────┬───────┘
                             │
         ┌─────────────┬─────┴─────┬─────────────┐
         │             │           │             │
         ▼             ▼           ▼             ▼
 ┌───────────────┐┌────────────┐┌─────────┐┌────────────┐
 │               ││            ││         ││            │
 │ Update Status ││ View       ││ Process ││ Print      │
 │               ││ Customer   ││ Refund  ││ Invoice/   │
 │               ││ Info       ││         ││ Packing    │
 └───────┬───────┘└────────────┘└─────────┘└────────────┘
         │
         ▼
 ┌───────────────┐    ┌────────────┐
 │               │    │            │
 │ Send          │───►│ Shipping   │
 │ Notification  │    │ Label      │
 │               │    │ Generation │
 └───────────────┘    └────────────┘
```

## Appointment Management Flow

```
┌──────────────┐     ┌───────────────┐     ┌─────────────────┐
│              │     │               │     │                 │
│ Dashboard    │────►│ Appointment   │────►│ Filter & Search │
│ (Upcoming    │     │ Management    │     │ Appointments    │
│  Appointments)│     │               │     │                 │
└──────────────┘     └───────┬───────┘     └────────┬────────┘
                             │                      │
                             ▼                      │
                     ┌───────────────┐              │
                     │               │              │
                     │ Appointment   │◄─────────────┘
                     │ List          │
                     │               │
                     └───────┬───────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
   │               │ │               │ │               │
   │ Day View      │ │ Week View     │ │ Month View    │
   │               │ │               │ │               │
   └───────┬───────┘ └───────────────┘ └───────────────┘
           │
           ▼
   ┌───────────────┐
   │               │
   │ Appointment   │
   │ Detail View   │
   │               │
   └───────┬───────┘
           │
 ┌─────────┴─────────┬─────────────┬─────────────┐
 │                   │             │             │
 ▼                   ▼             ▼             ▼
┌────────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────┐
│            │ │           │ │          │ │             │
│Update      │ │Add Notes/ │ │Reschedule│ │Cancel       │
│Status      │ │Records    │ │          │ │Appointment  │
│            │ │           │ │          │ │             │
└────────────┘ └───────────┘ └──────────┘ └─────────────┘
```

## Inventory Management Flow

```
┌──────────────┐     ┌───────────────┐     ┌─────────────────┐
│              │     │               │     │                 │
│ Dashboard    │────►│ Inventory     │────►│ Filter & Search │
│ (Inventory   │     │ Management    │     │ Products        │
│  Alerts)     │     │               │     │                 │
└──────────────┘     └───────┬───────┘     └────────┬────────┘
                             │                      │
                             ▼                      │
                     ┌───────────────┐              │
                     │               │              │
                     │ Product List  │◄─────────────┘
                     │               │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │               │
                     │ Product       │
                     │ Detail View   │
                     │               │
                     └───────┬───────┘
                             │
         ┌─────────────┬─────┴─────┬─────────────┬────────────┐
         │             │           │             │            │
         ▼             ▼           ▼             ▼            ▼
 ┌───────────────┐┌────────────┐┌─────────┐┌────────────┐┌────────────┐
 │               ││            ││         ││            ││            │
 │ Update        ││ Edit       ││ Stock   ││ Product    ││ Set        │
 │ Stock         ││ Product    ││ History ││ Analytics  ││ Alerts     │
 │ Quantity      ││ Details    ││         ││            ││            │
 └───────────────┘└────────────┘└─────────┘└────────────┘└────────────┘
```

## Reviews Management Flow

```
┌──────────────┐     ┌───────────────┐     ┌─────────────────┐
│              │     │               │     │                 │
│ Dashboard    │────►│ Reviews       │────►│ Filter & Search │
│ (Recent      │     │ Management    │     │ Reviews         │
│  Reviews)    │     │               │     │                 │
└──────────────┘     └───────┬───────┘     └────────┬────────┘
                             │                      │
                             ▼                      │
                     ┌───────────────┐              │
                     │               │              │
                     │ Reviews List  │◄─────────────┘
                     │               │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │               │
                     │ Review        │
                     │ Detail View   │
                     │               │
                     └───────┬───────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
         ┌───────────────┐       ┌───────────────┐
         │               │       │               │
         │ Reply to      │       │ Report        │
         │ Review        │       │ Review        │
         │               │       │               │
         └───────────────┘       └───────────────┘
```

## Promotions Management Flow

```
┌──────────────┐     ┌───────────────┐     ┌─────────────────┐
│              │     │               │     │                 │
│ Dashboard    │────►│ Promotions    │────►│ Filter & Search │
│ (Active      │     │ Management    │     │ Promotions      │
│  Promotions) │     │               │     │                 │
└──────────────┘     └───────┬───────┘     └────────┬────────┘
                             │                      │
                             ▼                      │
                     ┌───────────────┐              │
                     │               │              │
                     │ Promotions    │◄─────────────┘
                     │ List          │
                     │               │
                     └───────┬───────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
   │               │ │               │ │               │
   │ Create New    │ │ Edit Existing │ │ View          │
   │ Promotion     │ │ Promotion     │ │ Performance   │
   │               │ │               │ │               │
   └───────┬───────┘ └───────┬───────┘ └───────────────┘
           │                 │
           └────────┬────────┘
                    │
                    ▼
            ┌───────────────┐
            │               │
            │ Promotion     │
            │ Configuration │
            │               │
            └───────┬───────┘
                    │
       ┌────────────┴────────────┐
       │                         │
       ▼                         ▼
┌───────────────┐         ┌───────────────┐
│               │         │               │
│ Product       │         │ Promotion     │
│ Selection     │         │ Terms         │
│               │         │               │
└───────────────┘         └───────────────┘
```

## Analytics Dashboard Flow

```
┌──────────────┐     ┌───────────────┐
│              │     │               │
│ Dashboard    │────►│ Analytics     │
│ (Summary     │     │ Dashboard     │
│  Metrics)    │     │               │
└──────────────┘     └───────┬───────┘
                             │
        ┌──────────┬─────────┼─────────┬──────────┐
        │          │         │         │          │
        ▼          ▼         ▼         ▼          ▼
┌───────────┐┌──────────┐┌─────────┐┌─────────┐┌─────────┐
│           ││          ││         ││         ││         │
│Sales      ││Inventory ││Customer ││Marketing││Financial│
│Reports    ││Reports   ││Insights ││Reports  ││Reports  │
│           ││          ││         ││         ││         │
└─────┬─────┘└──────────┘└─────────┘└─────────┘└─────────┘
      │
      ▼
┌───────────┐
│           │
│Export/    │
│Schedule   │
│Reports    │
│           │
└───────────┘
```

## Settings Management Flow

```
┌──────────────┐     ┌───────────────┐
│              │     │               │
│ Dashboard    │────►│ Settings      │
│              │     │               │
└──────────────┘     └───────┬───────┘
                             │
        ┌──────────┬─────────┼─────────┬──────────┬──────────┐
        │          │         │         │          │          │
        ▼          ▼         ▼         ▼          ▼          ▼
┌───────────┐┌──────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
│           ││          ││         ││         ││         ││         │
│Account    ││Business  ││Payment  ││Shipping ││Store    ││App      │
│Profile    ││Info      ││Settings ││Settings ││Settings ││Settings │
│           ││          ││         ││         ││         ││         │
└───────────┘└──────────┘└─────────┘└─────────┘└─────────┘└─────────┘
                                                           │
                                                           ▼
                                                    ┌─────────────────┐
                                                    │                 │
                                                    │ Notifications   │
                                                    │ Language        │
                                                    │ Integrations    │
                                                    │ Security        │
                                                    │                 │
                                                    └─────────────────┘
```

## API Interaction Flow

This diagram illustrates how the UI components interact with backend API endpoints:

```
┌─────────────────────┐                        ┌───────────────────┐
│                     │                        │                   │
│                     │◄───── GET /auth ───────┤                   │
│                     │                        │                   │
│                     │───── POST /auth ─────► │                   │
│                     │                        │                   │
│                     │                        │                   │
│                     │◄─── GET /products ─────┤                   │
│                     │                        │                   │
│     Backend API     │──── POST /products ───►│     Vendor        │
│     Endpoints       │                        │     Dashboard     │
│                     │◄─── GET /orders ───────┤     UI           │
│                     │                        │                   │
│                     │─── PATCH /orders ─────►│                   │
│                     │                        │                   │
│                     │◄── GET /appointments ──┤                   │
│                     │                        │                   │
│                     │── PATCH /appointments ►│                   │
│                     │                        │                   │
└─────────────────────┘                        └───────────────────┘
```

Each screen in the vendor dashboard interfaces with specific API endpoints, as detailed in the API documentation.
