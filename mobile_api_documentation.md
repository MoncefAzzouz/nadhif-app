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
