# **Requirements Documentation: German Car Parts MVP**

## **Date:** 5/4/2026

## **1\. Project Overview**

A web-based platform to showcase German car spare parts. The site allows users to browse products in Arabic and English and finalize their orders by sending their **Shopping Cart** directly to an agent via WhatsApp.

## **2\. User Roles**

**Customer**

* Browses parts  
* Filters by category/car  
* Manages cart  
* Initiates WhatsApp order

**Admin**

* Logs into a secure panel  
* Manages inventory (CRUD)  
* Manages categories and prices

## **3\. Functional Requirements**

### **3.1 Customer Frontend (The Website)**

#### **Bilingual Support (i18n)**

* Toggle between English (LTR) and Arabic (RTL)  
* All content (names, descriptions, labels) must be available in both languages

#### **Product Catalog**

### **Product Grid Display**

The system will display a structured grid of car parts with the following information:

* **Picture**  
  * Main product image (thumbnail)  
* **Name (Bilingual)**  
  * Displayed based on selected language (English / Arabic)  
* **Price & Brand Name**  
  * Example: Bosch, Brembo, Genuine Parts  
* **Exact Fitment Information**  
  * Derived from the Vehicles/Compatibility data  
  * Example: BMW E60 (2003–2010), Mercedes W204

  ### **Advanced Search**

The platform will support flexible and precise search capabilities:

* Search by:  
  * **Product Name**  
  * **Internal SKU (Part Number)**  
  * **OEM Factory Part Number**

  ### **Multi-Level Filtering System**

To improve user experience and accuracy, advanced filters will be implemented:

#### **Category-Based Filtering**

* Filter by:  
  * Main category (e.g., Engine)  
  * Sub-category (e.g., Filters)

  #### **Vehicle-Based Filtering**

* Step-by-step selection:  
  * **Brand** (e.g., BMW, Mercedes)  
  * **Series** (e.g., 3-Series, C-Class)  
  * **Chassis Code** (e.g., E90, W204)

#### **Product Details Page**

* Image gallery (multiple photos per part)  
* Detailed description (Arabic/English)  
* Stock status (In Stock / Out of Stock)

#### **Cart System**

* Add/remove items  
* Update quantities  
* Persistent cart (using LocalStorage so items remain after refresh)

#### **WhatsApp Checkout**

* “Confirm Order via WhatsApp” button in the cart  
* Logic:  
  * Gather all items in the cart  
  * Calculate total price  
  * Open WhatsApp with a pre-written message

**Example Message:**  
 "Hello, I want to order:  
 1x Brake Pad (SKU: 102\) \- 50$,  
 2x Oil Filter (SKU: 505\) \- 20$.  
 Total: 70$.  
 Please confirm availability."

### **3.2 Admin Panel (Backend Management)**

#### **Secure Login**

* Simple username/password authentication

#### **Dashboard**

* Overview of total products  
* View out-of-stock items

#### **Vehicle Management**

* Add new vehicles  
* edit and delete existing vehicles  
* Connect & disconnect vehicles to products  
* View all vehicles and the products under them

#### **Product Management**

* Add new parts:  
  * Upload images  
  * Set prices  
  * Set quantities  
  * Add Arabic/English descriptions  
* Edit/delete existing parts  
* Toggle “Featured” status (for homepage display)

#### **Category Management**

* Create categories  
* Rename categories  
* Delete categories  
   (e.g., Mercedes-Benz, Audi, Filters)

#### **Price/Stock Control**

* Quickly update prices  
* Adjust quantities to reflect real inventory

## **4\. Technical Requirements (The Stack)**

**Frontend:**

* React (Next.js recommended for SEO and routing)

**Styling:**

* Tailwind CSS (for RTL/LTR support)

**Backend:**

* Node.js with Express.js

**Database:**

* PostgreSQL

**ORM:**

* Prisma (Type-safe database interaction)

**Language:**

* TypeScript (frontend \+ backend)

**Deployment:**

* Docker (containerized app and database)

**Storage:**

* AWS S3 or local Docker volume (for product images)

  ## **5\. Database Schema (Advanced – Products & Fitment System)**

This schema is designed to support **precise vehicle compatibility**, enabling users to find parts that exactly match their car (Brand → Series → Chassis Code).

### **1\. Product Model**

Represents each car part in the system.

model Product {

 id            String         @id @default(uuid())

 sku           String         @unique

 oemNumber     String?        @index

 brandName     String?

 nameEn        String

 nameAr        String

 descEn        String?

 descAr        String?

 price         Decimal

 stockQuantity Int            @default(0)

 isFeatured    Boolean        @default(false)

 isActive      Boolean        @default(true)

 categoryId    Int

 category      Category       @relation(fields: \[categoryId\], references: \[id\])

 images        ProductImage\[\]

 fitments      Fitment\[\]

 createdAt     DateTime       @default(now())

 updatedAt     DateTime       @updatedAt

}

#### **Key Features**

* **SKU (Unique):** Internal part identifier  
* **OEM Number (Indexed):** Enables fast lookup by factory part number  
* **Bilingual Fields:** nameEn, nameAr, descEn, descAr  
* **Stock Control:** stockQuantity  
* **Visibility:** isActive, isFeatured  
* **Relations:**  
  * Linked to **Category**  
  * Linked to **Images**  
  * Linked to **Fitments** (vehicle compatibility)

  ### **2\. Category Model (Hierarchical)**

Supports nested categories (e.g., Engine → Filters).

model Category {

 id        Int        @id @default(autoincrement())

 parentId  Int?

 nameEn    String

 nameAr    String

 slug      String     @unique

 products  Product\[\]

 parent    Category?  @relation("SubCategories", fields: \[parentId\], references: \[id\])

 children  Category\[\] @relation("SubCategories")

}

#### **Key Features**

* **Self-referencing structure**  
* Enables:  
  * Main categories  
  * Sub-categories  
* Example:  
  * Engine → Filters → Oil Filters

  ### **3\. Vehicle Model**

Represents car metadata used for compatibility filtering.

model Vehicle {

 id          Int       @id @default(autoincrement())

 brand       String

 series      String

 chassisCode String

 fitments    Fitment\[\]

}

#### **Key Features**

* Structured vehicle hierarchy:  
  * Brand (BMW, Mercedes)  
  * Series (3-Series, C-Class)  
  * Chassis Code (E90, W204)

  ### **4\. Fitment Model (Core of Compatibility System)**

Acts as a **junction table** between Products and Vehicles.

model Fitment {

 id        Int     @id @default(autoincrement())

 productId String

 vehicleId Int

 product   Product @relation(fields: \[productId\], references: \[id\])

 vehicle   Vehicle @relation(fields: \[vehicleId\], references: \[id\])

}

#### **Key Features**

* **Many-to-Many Relationship**  
  * One product → fits many vehicles  
  * One vehicle → has many compatible parts

  ### **How It Works (Example)**

* Product: Brake Pad  
* Fitments:  
  * BMW E60  
  * BMW E90  
  * Mercedes W204

Instead of storing text like:

"Fits BMW E60, E90, W204"

We store structured relationships via the **Fitment table**.

## **6\. Non-Functional Requirements**

**Performance**

* Must load quickly on 4G mobile connections

**Mobile-First Design**

* UI optimized for mobile users (WhatsApp-heavy usage)

**Scalability**

* Architecture should allow easy integration of payment gateways (Stripe, PayPal, Tap) later

**7\. Cost Estimation**

This section outlines the estimated costs for building and maintaining the MVP.

### **Development Cost**

* **Estimated Time:** \~50 hours  
* **Rate:** $10/hour  
* **Total Development Cost:** **$500 (one-time)**

Covers full MVP development, including frontend, backend, admin panel, and deployment setup.

### **Hosting Cost**

* **$30/month**  
   For running the application server, database, and storage (e.g., VPS or cloud hosting).

### **Domain Cost**

* **$12/year**  
   For purchasing and maintaining the website domain name.

### **AI Services (If needed)**

* **Up to $40/month**  
   Usage of AI services. 

### **Estimated Total**

* **Cost:** $500  
* **Monthly Cost:** \~$30 – $70 (depending on AI usage)  
* **Yearly Fixed Cost:** $12 (domain)