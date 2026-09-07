# Nadhif Mobile Client — API Documentation

This file documents all the backend API endpoints for the mobile application.

## ── General Configuration ──

*   **Production API URL**: `https://your-api-domain.com`
*   **Staging / Local API URL**: `http://localhost:5001`
*   **Authentication**: Standard Bearer token authentication. For authenticated routes, you must attach the token in the headers:
    ```http
    Authorization: Bearer <JWT_TOKEN>
    Content-Type: application/json
    ```

---

## ── 1. Authentication & Profile APIs ──

### 1.1 Send OTP Code (Phone Login Step 1)
*   **Method**: `POST`
*   **Path**: `/api/auth/send-otp`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "phone": "0555123456"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "OTP code sent"
    }
    ```

### 1.2 Verify OTP Code (Phone Login Step 2)
*   **Method**: `POST`
*   **Path**: `/api/auth/verify-otp`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "phone": "0555123456",
      "code": "1234"
    }
    ```
*   **Response (200 OK) — Existing User**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
        "email": "0555123456@nadhif.com",
        "phone": "0555123456",
        "fullName": "Moncef Azzouz",
        "role": "CUSTOMER"
      }
    }
    ```
*   **Response (200 OK) — New User (Must call `register-phone` next)**:
    ```json
    {
      "success": true,
      "isNewUser": true
    }
    ```

### 1.3 Register Profile via Phone
*   **Method**: `POST`
*   **Path**: `/api/auth/register-phone`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "phone": "0555123456",
      "fullName": "Moncef Azzouz"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
        "email": "0555123456@nadhif.com",
        "phone": "0555123456",
        "fullName": "Moncef Azzouz",
        "role": "CUSTOMER"
      }
    }
    ```

### 1.4 Register Account with Email & Password
*   **Method**: `POST`
*   **Path**: `/api/auth/register`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "moncef@nadif.com",
      "phone": "0555123456",
      "fullName": "Moncef Azzouz",
      "password": "my_secure_password"
    }
    ```
*   **Response (210 Created)**:
    ```json
    {
      "id": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
      "email": "moncef@nadif.com",
      "phone": "0555123456",
      "fullName": "Moncef Azzouz",
      "role": "CUSTOMER"
    }
    ```

### 1.5 Login with Email & Password
*   **Method**: `POST`
*   **Path**: `/api/auth/login`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "moncef@nadif.com",
      "password": "my_secure_password"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
        "email": "moncef@nadif.com",
        "phone": "0555123456",
        "fullName": "Moncef Azzouz",
        "role": "CUSTOMER"
      }
    }
    ```

### 1.6 Fetch Current User Info
*   **Method**: `GET`
*   **Path**: `/api/auth/me`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    {
      "id": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
      "email": "moncef@nadif.com",
      "phone": "0555123456",
      "fullName": "Moncef Azzouz",
      "role": "CUSTOMER"
    }
    ```

### 1.7 Delete Self Account
*   **Method**: `DELETE`
*   **Path**: `/api/auth/delete-account`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Account deleted successfully"
    }
    ```

---

## ── 2. Content & Slides APIs ──

### 2.1 Get Active Carousel Banners
*   **Method**: `GET`
*   **Path**: `/api/slides`
*   **Auth Required**: No
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "5300be19-9cf8-410a-ba3f-be4511a2f641",
        "title": "Clean Home, Happy Life",
        "description": "Book a house cleaning package today!",
        "imageUrl": "data:image/png;base64,iVBORw0KGgo...",
        "actionRoute": "/categories",
        "order": 1,
        "isActive": true,
        "createdAt": "2026-06-12T10:00:00.000Z"
      }
    ]
    ```

---

## ── 3. Services & Categories Catalog ──

### 3.1 Get All Active Categories & Base Rates
*   **Method**: `GET`
*   **Path**: `/api/categories`
*   **Auth Required**: No
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "category-uuid-1111",
        "name": "Carpet Cleaning",
        "nameAr": "تنظيف السجاد",
        "nameFr": "Nettoyage de Tapis",
        "description": "Professional deep steam cleaning for carpets.",
        "descriptionAr": "تنظيف عميق بالبخار للسجاد.",
        "descriptionFr": "Nettoyage à la vapeur professionnel pour tapis.",
        "picture": "data:image/png;base64,iVB...",
        "materialPrice": 500,
        "materialsMandatory": false,
        "localProductPrice": 200,
        "importedProductPrice": 400,
        "productsMandatory": false,
        "isActive": true,
        "createdAt": "2026-06-11T12:00:00.000Z",
        "categoryServices": [
          {
            "id": "subservice-uuid-2222",
            "categoryId": "category-uuid-1111",
            "name": "Standard Carpet",
            "nameAr": "سجاد عادي",
            "nameFr": "Tapis Standard",
            "workers": 1,
            "basePrice": 1500,
            "rapidBasePrice": 2200,
            "durationHours": 2
          }
        ]
      }
    ]
    ```

---

## ── 4. Bespoke Booking / Orders APIs ──

### 4.1 Create New Order / Command
*   **Method**: `POST`
*   **Path**: `/api/orders`
*   **Auth Required**: Yes
*   **Request Body**:
    ```json
    {
      "serviceId": null,
      "houseConfigId": null,
      "categoryId": "category-uuid-1111",
      "categoryServiceId": "subservice-uuid-2222",
      "promoCode": "WELCOME10",
      "extraWorkers": 1,
      "useMaterials": true,
      "productOrigin": "LOCAL",
      "scheduledDate": "2026-06-15T09:00:00.000Z",
      "address": "123 Rue de la Liberté, Alger",
      "latitude": 36.7538,
      "longitude": 3.0588,
      "sizeM2": 120,
      "clientNote": "Attention aux objets fragiles.",
      "housePictures": ["/uploads/img1.jpg", "/uploads/img2.jpg"],
      "isRapid": false
    }
    ```
    *(Note: For Category-based orders, `categoryId` and `categoryServiceId` are mandatory. For Service-based orders, `serviceId` and `houseConfigId` are mandatory.)*
*   **Response (201 Created)**:
    ```json
    {
      "id": "order-uuid-9999",
      "userId": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
      "status": "PENDING",
      "totalPrice": 2200,
      "scheduledDate": "2026-06-15T09:00:00.000Z",
      "address": "123 Rue de la Liberté, Alger",
      "latitude": 36.7538,
      "longitude": 3.0588,
      "isRapid": false,
      "createdAt": "2026-06-12T12:00:00.000Z"
    }
    ```

### 4.2 Get User Orders History
*   **Method**: `GET`
*   **Path**: `/api/orders`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "order-uuid-9999",
        "userId": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
        "status": "PENDING",
        "totalPrice": 2200,
        "scheduledDate": "2026-06-15T09:00:00.000Z",
        "address": "123 Rue de la Liberté, Alger",
        "isRapid": false,
        "createdAt": "2026-06-12T12:00:00.000Z"
      }
    ]
    ```

### 4.3 Get Single Order Details
*   **Method**: `GET`
*   **Path**: `/api/orders/:id`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    {
      "id": "order-uuid-9999",
      "userId": "e305d21b-cc8f-4cb1-807e-db3c44883f3e",
      "status": "PENDING",
      "totalPrice": 2200,
      "scheduledDate": "2026-06-15T09:00:00.000Z",
      "address": "123 Rue de la Liberté, Alger",
      "latitude": 36.7538,
      "longitude": 3.0588,
      "extraWorkers": 1,
      "useMaterials": true,
      "productOrigin": "LOCAL",
      "sizeM2": 120,
      "clientNote": "Attention aux objets fragiles.",
      "housePictures": ["/uploads/img1.jpg", "/uploads/img2.jpg"],
      "isRapid": false,
      "createdAt": "2026-06-12T12:00:00.000Z"
    }
    ```

### 4.4 Cancel / Delete Order
*   **Method**: `DELETE`
*   **Path**: `/api/orders/:id`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    {
      "success": true
    }
    ```

---

## ── 5. Subscription Booking APIs ──

### 5.1 Get Housing Configurator Types
*   **Method**: `GET`
*   **Path**: `/api/subscriptions/property-types`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "prop-uuid-3333",
        "name": "Appartement",
        "nameAr": "شقة",
        "nameFr": "Appartement",
        "picture": "data:image/png;base64,iVB...",
        "isActive": true,
        "createdAt": "2026-06-12T10:00:00.000Z"
      }
    ]
    ```

### 5.2 Get Available Subscription Service Tiers
*   **Method**: `GET`
*   **Path**: `/api/subscriptions/service-tiers`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "tier-uuid-4444",
        "name": "Grand Nettoyage",
        "nameAr": "تنظيف كلي",
        "nameFr": "Grand Nettoyage",
        "description": "Deep cleaning package for premium subscribers",
        "durationHours": 4,
        "workers": 2,
        "isActive": true
      }
    ]
    ```

### 5.3 Submit a New Subscription Booking Request
*   **Method**: `POST`
*   **Path**: `/api/subscriptions`
*   **Auth Required**: Yes
*   **Request Body**:
    ```json
    {
      "propertyTypeId": "prop-uuid-3333",
      "surfaceM2": 150,
      "roomsToClean": 4,
      "pictures": ["/uploads/sub-room1.jpg"],
      "serviceTierId": "tier-uuid-4444",
      "daysPerWeek": 2,
      "fullName": "Moncef Azzouz",
      "phone": "0555123456",
      "address": "456 Avenue Didouche Mourad, Alger",
      "latitude": 36.7628,
      "longitude": 3.0560
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": "sub-uuid-5555",
      "status": "PENDING",
      "fullName": "Moncef Azzouz",
      "phone": "0555123456",
      "propertyTypeId": "prop-uuid-3333",
      "surfaceM2": 150,
      "roomsToClean": 4,
      "serviceTierId": "tier-uuid-4444",
      "daysPerWeek": 2,
      "createdAt": "2026-06-12T13:00:00.000Z"
    }
    ```

### 5.4 Get User Subscriptions List
*   **Method**: `GET`
*   **Path**: `/api/subscriptions`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "sub-uuid-5555",
        "status": "DAYS_PROPOSED",
        "monthlyPrice": 12000,
        "amountPaid": 6000,
        "daysPerWeek": 2,
        "createdAt": "2026-06-12T13:00:00.000Z"
      }
    ]
    ```

### 5.5 Get Subscription Detail
*   **Method**: `GET`
*   **Path**: `/api/subscriptions/:id`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    {
      "id": "sub-uuid-5555",
      "status": "DAYS_PROPOSED",
      "fullName": "Moncef Azzouz",
      "phone": "0555123456",
      "propertyTypeId": "prop-uuid-3333",
      "surfaceM2": 150,
      "roomsToClean": 4,
      "serviceTierId": "tier-uuid-4444",
      "daysPerWeek": 2,
      "monthlyPrice": 12000,
      "amountPaid": 6000,
      "createdAt": "2026-06-12T13:00:00.000Z",
      "sessions": [
        {
          "id": "sess-uuid-6666",
          "scheduledDate": "2026-06-16T10:00:00.000Z",
          "status": "SCHEDULED",
          "durationHours": 4
        }
      ]
    }
    ```

### 5.6 Get Available Scheduling Days for Subscription
*   **Method**: `GET`
*   **Path**: `/api/subscriptions/:id/available-days`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    [
      {
        "week": 1,
        "days": [
          {
            "date": "2026-06-15",
            "dayName": "Monday",
            "availableCleanerCount": 3,
            "isAvailable": true,
            "isLocked": false
          },
          {
            "date": "2026-06-16",
            "dayName": "Tuesday",
            "availableCleanerCount": 0,
            "isAvailable": false,
            "isLocked": true
          }
        ]
      }
    ]
    ```

### 5.7 Submit Selected Slot Sessions for Booking Confirmation
*   **Method**: `POST`
*   **Path**: `/api/subscriptions/:id/sessions`
*   **Auth Required**: Yes
*   **Request Body**:
    ```json
    {
      "sessions": [
        { "scheduledDate": "2026-06-15T09:00:00.000Z", "durationHours": 4 },
        { "scheduledDate": "2026-06-18T09:00:00.000Z", "durationHours": 4 }
      ]
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "count": 2
    }
    ```

---

## ── 6. Push Notifications Setup ──

### 6.1 Register or Refresh Firebase FCM Token
*   **Method**: `POST`
*   **Path**: `/api/notifications/token`
*   **Auth Required**: Yes
*   **Request Body**:
    ```json
    {
      "token": "fcm_token_string_from_firebase_sdk_...",
      "platform": "android" 
    }
    ```
    *(Note: platform value must be either "android" or "ios")*
*   **Response (200 OK)**:
    ```json
    {
      "id": "device-token-record-uuid"
    }
    ```

### 6.2 Deregister FCM Token (Call on Logout)
*   **Method**: `DELETE`
*   **Path**: `/api/notifications/token`
*   **Auth Required**: Yes
*   **Request Body**:
    ```json
    {
      "token": "fcm_token_string_from_firebase_sdk_..."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true
    }
    ```

---

## ── 7. Information & FAQs Pages ──

### 7.1 Fetch FAQ Listing
*   **Method**: `GET`
*   **Path**: `/api/pages/faqs`
*   **Auth Required**: No
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "faq-uuid-111",
        "question": "What happens if I cancel?",
        "answer": "You can cancel up to 24 hours prior to service.",
        "order": 1
      }
    ]
    ```

### 7.2 Fetch Privacy Policy
*   **Method**: `GET`
*   **Path**: `/api/pages/privacy`
*   **Auth Required**: No
*   **Response (200 OK)**:
    ```json
    {
      "privacyPolicy": "Our Privacy Policy content resides here..."
    }
    ```

### 7.3 Fetch About Us Parameters
*   **Method**: `GET`
*   **Path**: `/api/pages/about`
*   **Auth Required**: No
*   **Response (200 OK)**:
    ```json
    {
      "aboutUs": "We are Nadhif, leading professional cleaning agency...",
      "phone": "0555123456",
      "email": "contact@nadhif.com"
    }
    ```

### 7.4 Fetch Locked/Blackout Days
*   **Method**: `GET`
*   **Path**: `/api/pages/locked-days`
*   **Auth Required**: No
*   **Response (200 OK)**:
    ```json
    [
      "2026-06-25",
      "2026-06-26",
      "2026-07-05"
    ]
    ```

---

## ── 8. Image Upload Asset API ──

### 8.1 Upload Image File (JPEG, PNG, WebP)
*   **Method**: `POST`
*   **Path**: `/api/upload`
*   **Auth Required**: Yes
*   **Content-Type**: `multipart/form-data`
*   **Request Body (Multipart Form)**:
    - Field name: `file` (Binary File data, maximum size 8MB)
*   **Response (201 Created)**:
    ```json
    {
      "url": "/uploads/cb9c40fd-1647-4f4d-adfe-fb64c8612140.png"
    }
    ```

---

## ── 9. Loyalty Points & Point Store ──

Every client account carries a `points` balance. Points are granted by an admin
when an order is marked **COMPLETED**, and are spent in the point store.

**The point store is the normal catalog priced in points.** The admin switches a
service or a category into the store and gives every priced step a cost in
points; the client then goes through the exact same booking steps as a paid
order, except each step costs points instead of dinars. Buying produces a normal
order (status `PENDING`) with `totalPrice: 0` and the cost carried by
`pointsSpent` — so the app must display points, not dinars, for those orders.

Order objects returned anywhere in the API now include these extra fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `paidWithPoints` | bool | `true` when the order was bought with points — show "X points" instead of the price |
| `pointsSpent` | int | Points debited for this order |
| `pointsAwarded` | int | Points the admin granted when completing it (`0` = none yet) |
| `pointsRefunded` | bool | `true` when a cancelled point order was refunded |

### 9.1 Get My Balance & History
*   **Method**: `GET`
*   **Path**: `/api/points/me`
*   **Auth Required**: Yes
*   **Response (200 OK)**: (`transactions` newest first, max 100)
    ```json
    {
      "points": 550,
      "transactions": [
        {
          "id": "tx-uuid-1",
          "amount": -300,
          "balanceAfter": 250,
          "type": "SPENT",
          "reason": "Grand Service — F3",
          "orderId": "order-uuid-9999",
          "createdAt": "2026-08-08T10:04:00.000Z",
          "order": { "id": "order-uuid-9999", "scheduledDate": "2026-09-15T09:00:00.000Z", "status": "PENDING" }
        },
        {
          "id": "tx-uuid-2",
          "amount": 50,
          "balanceAfter": 550,
          "type": "EARNED",
          "reason": "Order completed",
          "orderId": "order-uuid-8888",
          "createdAt": "2026-08-07T16:20:00.000Z"
        }
      ]
    }
    ```
    `type` is one of `EARNED` (order completed), `SPENT` (bought with points),
    `REFUNDED` (point order cancelled), `ADJUSTED` (manual admin correction).
    `amount` is signed; `balanceAfter` is the balance right after that movement.

### 9.2 Get the Point Store (catalog priced in points)
*   **Method**: `GET`
*   **Path**: `/api/points/store`
*   **Auth Required**: Yes
*   **Notes**: Returns the same services and categories as `/api/services` and
    `/api/categories`, but only those the admin published for points, and with
    `pointCost` fields replacing the prices. Steps costing `0` points are removed,
    and a service/category with no purchasable step is not returned at all. Render
    it with the normal booking flow — only the currency label changes.
*   **Response (200 OK)**:
    ```json
    {
      "services": [
        {
          "id": "service-uuid-1",
          "name": "Grand Service",
          "nameAr": "الخدمة الكبرى",
          "nameFr": "Grand Service",
          "description": "...",
          "picture": "/uploads/s1.jpg",
          "durationHours": 4,
          "details": null,
          "extraWorkerPointCost": 40,
          "rapidExtraWorkerPointCost": 60,
          "materialPointCost": 30,
          "materialsMandatory": false,
          "localProductPointCost": 20,
          "importedProductPointCost": 50,
          "productsMandatory": false,
          "houseConfigs": [
            {
              "id": "config-uuid-1",
              "type": "F3",
              "typeAr": "",
              "typeFr": "",
              "workers": 2,
              "durationHours": 4,
              "pointCost": 300,
              "rapidPointCost": 400
            }
          ]
        }
      ],
      "categories": [
        {
          "id": "category-uuid-1",
          "name": "Carpet Cleaning",
          "picture": "/uploads/c1.jpg",
          "materialPointCost": 0,
          "materialsMandatory": false,
          "localProductPointCost": 0,
          "importedProductPointCost": 0,
          "productsMandatory": false,
          "categoryServices": [
            {
              "id": "option-uuid-1",
              "name": "Living room carpet",
              "workers": 1,
              "durationHours": 2,
              "pointCost": 150,
              "rapidPointCost": 220
            }
          ]
        }
      ]
    }
    ```

### 9.3 Quote a Booking in Points (optional, before confirming)
*   **Method**: `POST`
*   **Path**: `/api/points/quote`
*   **Auth Required**: Yes
*   **Request Body**: the booking selection (same fields as the redeem call below,
    without the date/address).
    ```json
    {
      "serviceId": "service-uuid-1",
      "houseConfigId": "config-uuid-1",
      "extraWorkers": 1,
      "useMaterials": true,
      "productOrigin": "LOCAL",
      "isRapid": false
    }
    ```
*   **Response (200 OK)**:
    ```json
    { "pointCost": 390, "points": 550, "affordable": true, "label": "Grand Service — F3" }
    ```
    Use it to show the running total and to disable the confirm button when
    `affordable` is `false`.

### 9.4 Buy with Points
*   **Method**: `POST`
*   **Path**: `/api/points/redeem`
*   **Auth Required**: Yes
*   **Request Body**: identical to `POST /api/orders` except there is no
    `promoCode` — the same service/category selection, options and scheduling.
    ```json
    {
      "serviceId": "service-uuid-1",
      "houseConfigId": "config-uuid-1",
      "categoryId": null,
      "categoryServiceId": null,
      "extraWorkers": 1,
      "useMaterials": true,
      "productOrigin": "LOCAL",
      "isRapid": false,
      "scheduledDate": "2026-09-15T09:00:00",
      "address": "123 Rue de la Liberté, Alger",
      "latitude": 36.7538,
      "longitude": 3.0588,
      "sizeM2": 120,
      "clientNote": "Sonner deux fois",
      "housePictures": ["/uploads/img1.jpg"]
    }
    ```
    The total is computed server-side exactly like the DZD total: base house
    type/option + extra workers + materials + products, using the point costs.
    Blackout days (`/api/pages/locked-days`) apply as usual.
*   **Response (201 Created)**: the created order plus the customer's new balance.
    ```json
    {
      "order": {
        "id": "order-uuid-9999",
        "status": "PENDING",
        "totalPrice": 0,
        "paidWithPoints": true,
        "pointsSpent": 390,
        "scheduledDate": "2026-09-15T09:00:00.000Z",
        "address": "123 Rue de la Liberté, Alger"
      },
      "points": 160
    }
    ```
*   **Errors**:
    - `400 { "error": "Insufficient points" }` — balance too low (no order is created).
    - `400 { "error": "This service cannot be bought with points" }` — not published for points.
    - `400 { "error": "This option cannot be bought with points" }` — that step costs 0 points.
    - `400 { "error": "Product origin selection is mandatory for this service" }`
    - `400 { "error": "Cette date est verrouillée..." }` — blackout day.

### 9.5 Behaviour the app should implement
*   Show the balance from `/api/points/me` on the profile/store screen; refresh it
    after every purchase (the redeem response already returns the new balance).
*   In the point store, reuse the normal booking screens and replace every price
    label with its `pointCost` (use `rapidPointCost` when the client picks the
    express option).
*   Cancelling a point-paid order (`PATCH /api/orders/:id/status` with
    `CANCELLED`, allowed while `PENDING` or `CALLED_NOT_PAID`) automatically
    gives the points back — refresh the balance afterwards.
*   In the orders list and details, when `paidWithPoints` is `true`, render
    `pointsSpent` + "points" where the price normally goes.
*   A push notification of type `points_adjusted` is sent when an admin changes a
    balance by hand; `data.amount` carries the signed movement.

---

## ── 10. Guest Mode (browse without an account) ──

The app can open a **guest session**: the user sees the whole catalogue — services,
categories, slides, subscription formulas, the point store, availability — but is
stopped at the moment of committing: no order, no subscription, no redemption.

Nothing is written to the database for a guest: the token is signed but has no
user row behind it, so there is no account to clean up and no guest data to
delete. `userId` inside the token is the literal string `guest`.

### 10.1 Start a Guest Session
*   **Method**: `POST`
*   **Path**: `/api/auth/guest`
*   **Auth Required**: No
*   **Request Body**: none
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "guest",
        "email": "",
        "phone": "",
        "fullName": "Guest",
        "role": "GUEST",
        "isGuest": true
      }
    }
    ```
    Store the token exactly like a normal login token and send it as
    `Authorization: Bearer <token>` on every call. It is valid for 30 days.
    Use `user.isGuest` (or `role === "GUEST"`) to decide whether to show
    "Sign up to book" instead of the confirm button.

### 10.2 What a Guest May Call
| Endpoint | Behaviour for a guest |
| --- | --- |
| `GET /api/services`, `/api/categories`, `/api/slides`, `/api/pages/*` | Public — unchanged |
| `GET /api/subscriptions/property-types` | Full list |
| `GET /api/subscriptions/service-tiers` | Full list |
| `GET /api/points/store` | Full point store |
| `POST /api/points/quote` | Returns `pointCost`, with `points: 0` and `affordable: false` |
| `GET /api/orders/availability` | Works, so the date picker is usable |
| `GET /api/auth/me` | `{ "id": "guest", "fullName": "Guest", "role": "GUEST", "isGuest": true }` |
| `GET /api/points/me` | `{ "points": 0, "transactions": [], "isGuest": true }` |
| `GET /api/orders` | `[]` |
| `GET /api/subscriptions` | `[]` |
| `GET /api/promos/:code` | Works (discount preview) |

The list endpoints answer with an empty array rather than an error, so "My
orders" and "My points" screens render their normal empty state.

### 10.3 What a Guest May NOT Call
These return **403** with a machine-readable code:

```json
{ "error": "Create an account or sign in to continue", "code": "GUEST_ACCOUNT_REQUIRED" }
```

| Endpoint | |
| --- | --- |
| `POST /api/orders` | placing an order — the last step |
| `PATCH /api/orders/:id/status`, `PUT /api/orders/:id`, `DELETE /api/orders/:id` | |
| `POST /api/subscriptions` | requesting a subscription |
| `POST /api/points/redeem` | buying with points |
| `PUT /api/auth/me`, `DELETE /api/auth/delete-account` | |
| `POST /api/notifications/token`, `DELETE /api/notifications/token` | |
| `POST /api/upload` | |
| every `/api/admin/*` route | (403 as for any non-admin) |

**Recommended handling**: let the guest walk the entire booking flow and only
intercept the final confirm button — either check `isGuest` locally, or send the
request and catch `code === "GUEST_ACCOUNT_REQUIRED"`, then push the sign-up
screen. After a real signup/login (`/api/auth/register-phone`, `/verify-otp`,
`/login`) replace the stored token and re-send the same booking payload; nothing
else in the flow changes.
