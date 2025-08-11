# PetPro Vendor Appointment Management Wireframes

## Mobile App Appointment Management

### 1. Appointments List Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Appointments               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Search Appointments 🔍]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │ Upcoming│ │ Today   │ │ Past    ││
│  └─────────┘ └─────────┘ └─────────┘│
│  ┌─────────┐ ┌─────────┐            │
│  │Canceled │ │ All     │            │
│  └─────────┘ └─────────┘            │
│                                     │
│  DATE: [Aug 11, 2025 ▼]             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ TODAY                         │  │
│  │ 3:00 PM - 4:00 PM             │  │
│  │                               │  │
│  │ Pet: Max (Golden Retriever)   │  │
│  │ Owner: Emily Davis            │  │
│  │ Service: Grooming - Full      │  │
│  │ Staff: Dr. Jessica Wong       │  │
│  │ Room: #3                      │  │
│  │ Status: CONFIRMED             │  │
│  │                               │  │
│  │ [Edit] [Cancel] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ TODAY                         │  │
│  │ 5:30 PM - 6:15 PM             │  │
│  │                               │  │
│  │ Pet: Bella (Siamese Cat)      │  │
│  │ Owner: Thomas Wilson          │  │
│  │ Service: Vaccination          │  │
│  │ Staff: Dr. Alex Johnson       │  │
│  │ Room: #1                      │  │
│  │ Status: CONFIRMED             │  │
│  │                               │  │
│  │ [Edit] [Cancel] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ TOMORROW                      │  │
│  │ 10:00 AM - 11:00 AM           │  │
│  │                               │  │
│  │ Pet: Cooper (Beagle)          │  │
│  │ Owner: Sarah Thompson         │  │
│  │ Service: Check-up             │  │
│  │ Staff: Dr. Michael Brown      │  │
│  │ Room: #2                      │  │
│  │ Status: CONFIRMED             │  │
│  │                               │  │
│  │ [Edit] [Cancel] [View Details]│  │
│  └───────────────────────────────┘  │
│                                     │
│  SHOWING 3 OF 12 APPOINTMENTS       │
│  [Load More]                        │
│                                     │
└─────────────────────────────────────┘
 [Dashboard] [Orders] [Appts] [More]
```

### 2. Appointment Details Screen

```
┌─────────────────────────────────────┐
│                                     │
│  [Back]  Appointment Details        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Aug 11, 2025                  │  │
│  │ 3:00 PM - 4:00 PM             │  │
│  │                               │  │
│  │ STATUS: CONFIRMED             │  │
│  │ UPDATE: [Status ▼] [Update]   │  │
│  └───────────────────────────────┘  │
│                                     │
│  PET INFORMATION                    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Pet Photo]                   │  │
│  │ Name: Max                     │  │
│  │ Breed: Golden Retriever       │  │
│  │ Age: 3 years                  │  │
│  │ Gender: Male                  │  │
│  │ Weight: 65 lbs                │  │
│  │ [View Pet History]            │  │
│  └───────────────────────────────┘  │
│                                     │
│  OWNER INFORMATION                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Name: Emily Davis            │  │
│  │ Phone: (312) 555-8765        │  │
│  │ Email: emily.d@email.com     │  │
│  │ [Contact Owner]              │  │
│  └───────────────────────────────┘  │
│                                     │
│  SERVICE DETAILS                    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Service: Grooming - Full      │  │
│  │ Duration: 60 minutes          │  │
│  │ Price: $75.00                 │  │
│  │                               │  │
│  │ Assigned Staff:               │  │
│  │ Dr. Jessica Wong              │  │
│  │                               │  │
│  │ Room: #3                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  NOTES                              │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ • Previously sensitive to     │  │
│  │   certain shampoos            │  │
│  │ • Owner requested nail trim   │  │
│  │   included                    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Add note...                   │  │
│  └───────────────────────────────┘  │
│  [Add Note]                         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │     SEND REMINDER             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     RESCHEDULE                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     CANCEL APPOINTMENT        │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Desktop Web Appointment Management

### 1. Appointments Calendar View

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Appointments                  [+ New Appointment]  [Export ▼]    │
│        │                                                                   │
│ □ Dash │  ┌──────────────────┐  ┌───────────────────────────────────────┐  │
│ □ Prod │  │                  │  │ August 2025             [Today] [<] [>]  │
│ □ Order│  │ CALENDAR         │  ├────┬────┬────┬────┬────┬────┬────┐     │
│ ■ Appts│  │                  │  │Sun │Mon │Tue │Wed │Thu │Fri │Sat │     │
│ □ Cust │  │ VIEW:            │  ├────┼────┼────┼────┼────┼────┼────┤     │
│ □ Invnt│  │ ○ Day            │  │    │    │    │    │ 1  │ 2  │ 3  │     │
│ □ Promn│  │ ● Week           │  ├────┼────┼────┼────┼────┼────┼────┤     │
│ □ Rvws │  │ ○ Month          │  │ 4  │ 5  │ 6  │ 7  │ 8  │ 9  │ 10 │     │
│ □ Anlys│  │                  │  ├────┼────┼────┼────┼────┼────┼────┤     │
│ □ Setti│  │ FILTER:          │  │ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │     │
│        │  │                  │  ├────┼────┼────┼────┼────┼────┼────┤     │
│        │  │ □ Grooming       │  │ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │ 24 │     │
│        │  │ □ Check-ups      │  ├────┼────┼────┼────┼────┼────┼────┤     │
│        │  │ □ Vaccinations   │  │ 25 │ 26 │ 27 │ 28 │ 29 │ 30 │ 31 │     │
│        │  │ □ Surgeries      │  └────┴────┴────┴────┴────┴────┴────┘     │
│        │  │ □ Consultations  │                                           │
│        │  │                  │  Week of August 11 - August 17, 2025      │
│        │  │ STAFF:           │                                           │
│        │  │ [All Staff ▼]    │  Time │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │
│        │  │                  │       │ 8/11 │ 8/12 │ 8/13 │ 8/14 │ 8/15 │
│        │  └──────────────────┘  ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 9AM  │     │Cooper│     │     │     │     │
│        │                      │      │     │Check-│     │     │     │     │
│        │                      │      │     │up   │     │     │     │     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 10AM │     │Cooper│Lucy │     │Rusty│     │
│        │                      │      │     │Check-│Vacc.│     │Groom│     │
│        │                      │      │     │up   │     │     │     │     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 11AM │     │     │     │Daisy│     │     │
│        │                      │      │     │     │     │Check│     │     │
│        │                      │      │     │     │     │-up  │     │     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 12PM │LUNCH│LUNCH│LUNCH│LUNCH│LUNCH│     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 1PM  │     │Molly│     │     │     │     │
│        │                      │      │     │Surg.│     │     │     │     │
│        │                      │      │     │     │     │     │     │     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 2PM  │     │Molly│Buddy│     │     │     │
│        │                      │      │     │Surg.│Vacc.│     │     │     │
│        │                      │      │     │     │     │     │     │     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 3PM  │Max  │     │     │     │Oscar│     │
│        │                      │      │Groom│     │     │     │Check│     │
│        │                      │      │     │     │     │     │-up  │     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 4PM  │     │     │Rex  │     │     │     │
│        │                      │      │     │     │Groom│     │     │     │
│        │                      │      │     │     │     │     │     │     │
│        │                      │ ─────┼─────┼─────┼─────┼─────┼─────┤     │
│        │                      │ 5PM  │Bella│     │     │Piper│     │     │
│        │                      │      │Vacc.│     │     │Cons.│     │     │
│        │                      │      │     │     │     │     │     │     │
│        │                      └─────────────────────────────────────────┘ │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```

### 2. Appointment Details Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PetPro Vendor       [Search...]        Notifications (5) | Help | Log Out  │
├────────┬───────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│ MENU   │  Appointments > Appointment Details     [Print]  [Export]         │
│        │                                                                   │
│ □ Dash │  ┌───────────────────────────────────────────────────────────────┐│
│ □ Prod │  │ APPOINTMENT STATUS: CONFIRMED                                ││
│ □ Order│  │ UPDATE STATUS TO: [Status ▼]  [Update Status]                ││
│ ■ Appts│  └───────────────────────────────────────────────────────────────┘│
│ □ Cust │                                                                   │
│ □ Invnt│  ┌─────────────────────────┐ ┌─────────────────────────────────┐  │
│ □ Promn│  │                         │ │                                 │  │
│ □ Rvws │  │  APPOINTMENT INFO       │ │  PET INFORMATION                │  │
│ □ Anlys│  │                         │ │                                 │  │
│ □ Setti│  │  Date: August 11, 2025  │ │  [Pet Photo]                    │  │
│        │  │  Time: 3:00 - 4:00 PM   │ │  Name: Max                      │  │
│        │  │  Duration: 60 minutes   │ │  Breed: Golden Retriever        │  │
│        │  │                         │ │  Age: 3 years                    │  │
│        │  │  Service:               │ │  Gender: Male                    │  │
│        │  │  Grooming - Full        │ │  Weight: 65 lbs                  │  │
│        │  │  Price: $75.00          │ │                                  │  │
│        │  │                         │ │  Health Status:                  │  │
│        │  │  Staff:                 │ │  Vaccinations up to date         │  │
│        │  │  Dr. Jessica Wong       │ │  No known allergies              │  │
│        │  │                         │ │                                  │  │
│        │  │  Room: #3               │ │  [View Complete Medical History] │  │
│        │  │                         │ │                                  │  │
│        │  └─────────────────────────┘ └─────────────────────────────────┘  │
│        │                                                                   │
│        │  ┌─────────────────────────┐ ┌─────────────────────────────────┐  │
│        │  │                         │ │                                 │  │
│        │  │  OWNER INFORMATION      │ │  PREVIOUS VISITS                │  │
│        │  │                         │ │                                 │  │
│        │  │  Name: Emily Davis      │ │  ┌─────────────────────────┐    │  │
│        │  │  Phone: (312) 555-8765  │ │  │ Jul 15, 2025 - Checkup  │    │  │
│        │  │  Email: emily.d@email.com│ │ │ Dr. Michael Brown       │    │  │
│        │  │                         │ │  │                         │    │  │
│        │  │  Address:               │ │  │ Jun 03, 2025 - Grooming │    │  │
│        │  │  456 Park Avenue        │ │  │ Dr. Jessica Wong        │    │  │
│        │  │  Chicago, IL 60601      │ │  │                         │    │  │
│        │  │                         │ │  │ Apr 22, 2025 - Vaccines │    │  │
│        │  │  Customer Since:        │ │  │ Dr. Alex Johnson        │    │  │
│        │  │  January 2024           │ │  │                         │    │  │
│        │  │                         │ │  └─────────────────────────┘    │  │
│        │  │  [View Customer Profile] │ │  [View All Visit History]      │  │
│        │  │  [Contact Customer]      │ │                                 │  │
│        │  └─────────────────────────┘ └─────────────────────────────────┘  │
│        │                                                                   │
│        │  APPOINTMENT NOTES                                                │
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │ • Previously sensitive to certain shampoos                    ││
│        │  │ • Owner requested nail trim included                          ││
│        │  │ • Third visit for grooming service                            ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │                                                                   │
│        │  ┌───────────────────────────────────────────────────────────────┐│
│        │  │ Add appointment note...                                       ││
│        │  └───────────────────────────────────────────────────────────────┘│
│        │  [Add Note]                                                       │
│        │                                                                   │
│        │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│        │  │ SEND REMINDER│  │  RESCHEDULE  │  │    CANCEL    │            │
│        │  └──────────────┘  └──────────────┘  └──────────────┘            │
│        │                                                                   │
└────────┴───────────────────────────────────────────────────────────────────┘
```
