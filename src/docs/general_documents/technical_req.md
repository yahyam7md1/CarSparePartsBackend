   # **Technical Requirements Documentation: German Car Parts MVP**

**Date:** May 4, 2026  
 **Project Goal:** A high-speed, bilingual e-commerce platform for German car parts using WhatsApp as the primary checkout channel.

## **1\. Project Overview**

A web-based platform to showcase German car spare parts. The site allows users to browse products in Arabic and English and finalize their orders by sending their **Shopping Cart** directly to an agent via WhatsApp.

## **2\. User Roles**

### **Customer**

* Browses parts and filters by category/car  
* Manages a persistent shopping cart  
* Initiates orders via a pre-filled WhatsApp message

### **Admin**

* Securely logs into a dashboard  
* Manages bilingual inventory (CRUD), categories, and stock levels  
* Toggles product visibility and **"Featured"** status

## **3\. Detailed Admin Panel Features**

The admin panel is built as a separate **Silo** for security and performance.

### **3.1 Inventory Management**

**Bulk Stock Control**

* Quick-edit interface to update stock\_quantity and price without opening each product

**Media Center**

* Multi-image uploader (drag & drop)  
* Images stored in S3 or local storage  
* Returns URL for database storage

**Bilingual Editor**

* Side-by-side English and Arabic inputs  
* Ensures translation consistency

**Tagging System**

* Link parts to specific entries in the Vehicles Library.  
* Select specific Car Brand, Series, and Chassis codes (e.g., Mercedes \> C-Class \> W204).  
* Ensures customers only see parts that 100% fit their specific vehicle.

### **3.2 Category & Hierarchy Management**

**Tree Structure**

* Supports main categories (e.g., Engine)  
* Supports sub-categories (e.g., Filters)

**Slug Auto-generation**

* Automatically generates SEO-friendly URLs  
* Example: mercedes-brakes

### **3.3 Dashboard Overview**

**Stock Alerts**

* Highlights products where stock\_quantity \< 5

**Active vs Inactive Toggle**

* Control visibility for out-of-stock or hidden products

## **4\. WhatsApp Checkout Logic**

Since no payment gateway is used, checkout acts as a **data aggregator and redirect system**.

### **4.1 Message Generation Strategy**

When the user clicks **"Confirm Order via WhatsApp"**, the system:

1. **Data Compilation**  
   * Collects SKU, Name, Quantity, and Price  
2. **Formatting**  
   * Builds a readable order summary  
3. **URL Encoding**  
   * Converts message using encodeURIComponent  
4. **Redirect**  
   * Opens:

https://wa.me/\[PhoneNumber\]?text=\[EncodedMessage\]

### **4.2 Example Templates**

**English Message**

Hello \[Brand Name\], I would like to order:  
1x Brake Pad (SKU: MB-102) \- $50  
2x Oil Filter (SKU: AUD-505) \- $20  
Total: $90  
\[Optional: Item Condition / VIN Number\]

**Arabic Message**

مرحباً \[اسم الشركة\]، أود طلب المنتجات التالية:  
1x فحمات فرامل (SKU: MB-102) \- 50$  
2x فلتر زيت (SKU: AUD-505) \- 20$  
المجموع: 90$

## **5\. Technical Stack & Architecture**

### **5.1 Backend (Node.js \+ Express \+ TypeScript)**

**Layered Architecture**

* **Controllers:** Handle HTTP requests/responses  
* **Services:** Business logic (WhatsApp formatting, filtering)  
* **Repositories:** Database queries (Prisma \+ PostgreSQL)  
* **Middleware:** JWT authentication, validation, error handling

### **5.2 Frontend (Next.js \+ Tailwind \+ TypeScript)**

**Modular Silo Structure**

* src/shop → Customer-facing UI  
* src/admin → Admin dashboard  
* src/shared → Shared components, API client, types

### **5.3 Bilingual Strategy (i18n)**

**Static Text**

* JSON files (en.json, ar.json)

Dynamic Data

* Database fields: name\_en, name\_ar

**Layout**

* Automatic direction switching using:  
  * dir="rtl" / dir="ltr"  
  * Tailwind logical classes (ms-4, pe-2)

## **6\. Docker Configuration**

Ensures consistent environments across development and production.

**Containers:**

* PostgreSQL 15  
* Node.js (Express backend)  
* Next.js (frontend)

**Volumes:**

* Local storage for images (if S3 is not used)

## **7\. Success Criteria for MVP**

* Admin can add a product with images and see it live instantly  
* Users can search by SKU or name (Arabic or English)  
* Cart correctly calculates total and generates a valid WhatsApp link  
* UI correctly mirrors between LTR and RTL

