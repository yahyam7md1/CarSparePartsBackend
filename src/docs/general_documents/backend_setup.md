## **1.1 Backend Architecture (Node.js \+ Express \+ TypeScript)**

The backend follows the **Controller–Service–Repository pattern**, which enforces separation of concerns and makes the system easier to scale and maintain.

### **Key Principles**

* **Separation of Concerns:** Each layer has a single responsibility  
* **Testability:** Business logic is isolated from database logic  
* **Scalability:** Easy to swap database, add features, or refactor logic

### **Folder Structure**

backend/  
├── src/  
│   ├── controllers/    \# Handle HTTP requests & responses (req, res)  
│   ├── services/       \# Business logic (core application logic)  
│   ├── repositories/   \# Database layer (Prisma queries)  
│   ├── middleware/     \# Auth (JWT), error handling, validation  
│   ├── routes/         \# API route definitions  
│   ├── types/          \# TypeScript interfaces and types  
│   ├── utils/          \# Helper functions (e.g., WhatsApp link generator, slug creator)  
│   └── index.ts        \# Application entry point  
├── prisma/             \# Database schema and migrations  
├── .env                \# Environment variables (secrets)  
└── Dockerfile          \# Container configuration

### **Layer Responsibilities**

#### **Controllers**

* Handle incoming HTTP requests (req) and outgoing responses (res)  
* Perform basic validation and call the appropriate service  
* Do **not** contain business logic

#### **Services**

* Core business logic layer (the “brain” of the application)  
* Examples:  
  * Filtering products by Vehicle fitment (Matching brand/series/Chassis)  
  * Hierarchical Category lookups (Parent/Sub-category)  
  * Processing search queries (Name vs. OEM Number)  
  * Generating WhatsApp order messages  
* Independent from HTTP and database layers

#### **Repositories**

* Responsible for all database interactions  
* Uses Prisma to query PostgreSQL  
* No business logic included

#### **Middleware**

* Handles cross-cutting concerns such as:  
  * Authentication (JWT verification)  
  * Error handling  
  * Request validation

#### **Utilities (Utils)**

* Reusable helper functions  
* Examples:  
  * WhatsApp message generator  
  * Slug generation  
  * Formatting helpers

### **Why This Architecture Works**

* **Maintainability:** Changes in one layer don’t affect others  
* **Scalability:** Easy to extend features (e.g., add payments later)  
* **Flexibility:** You can switch database or APIs with minimal changes  
* **Clean Code:** Each file has a clear and single responsibility

**2\. Image Optimization Strategy**

Car parts images are typically high-resolution (often **5MB+** per photo), especially when uploaded directly from mobile devices. Displaying multiple large images on a single page can significantly slow down the website, particularly for users on **4G connections**.

### **Problem**

* Admins upload large, high-quality images  
* Product listing pages may display 10–20 items at once  
* Large images increase:  
  * Page load time  
  * Data usage  
  * Bounce rate on mobile devices

### **Solution: Image Resizing & Optimization**

When an admin uploads an image, the backend should automatically process it and generate multiple optimized versions.

### **Implementation Strategy**

Use a Node.js image processing library such as sharp.

**On Upload:**

1. Receive original image  
2. Generate:  
   * **Thumbnail version** (small size for listings)  
   * **Large version** (optimized for product detail page)  
3. Store both versions (S3 or local storage)  
4. Save URLs in the database

### **Example Output**

| Version | Usage | Size Recommendation |
| ----- | ----- | ----- |
| Thumbnail | Product grid/list | \~300px width |
| Large | Product detail page | \~800–1200px width |

### **Frontend Usage**

* Product listing pages → load **thumbnail images**  
* Product detail pages → load **large images**  
* Optional: Lazy loading for better performance

### **Benefits**

* Faster page load times  
* Better mobile performance  
* Reduced bandwidth usage  
* Improved user experience

### **Future Enhancements (Optional)**

* WebP/AVIF format conversion for smaller file sizes  
* CDN integration (e.g., CloudFront)  
* On-demand image resizing

