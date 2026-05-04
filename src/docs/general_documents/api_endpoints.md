## **API Design (Endpoints & Logic)**

### **1\. Authentication Endpoints**

Since the MVP includes only a single admin role:

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| POST | /api/auth/login | Validates admin credentials and returns a JWT token |

### **2\. Customer Endpoints (Public)**

These endpoints power the product catalog, search, and filtering.

| Method | Endpoint | Description | Query Parameters |
| ----- | ----- | ----- | ----- |
| GET | /api/categories | Returns category tree (with sub-categories) | None |
| GET | /api/products | Returns paginated list of products | search, category, tags, sort, limit, page |
| GET | /api/products/featured | Returns featured products | limit |
| GET | /api/products/:slug | Returns full product details | None |

#### **Search & Filter Logic Example**

GET /api/products?search=brake\&category=12\&brand=BMW\&chassisCode=E60

This request tells the backend to:

* Search for products containing the keyword **"brake"**  
* Filter by **category ID \= 12**  
* Match compatibility tags like **BMW** and **2014**

### **3\. Admin Endpoints (Protected)**

All admin routes require a valid **JWT Bearer Token**.

#### **Product Management**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| POST | /api/admin/products | Create a new product |
| PUT | /api/admin/products/:id | Update product details (price, stock, etc.) |
| DELETE | /api/admin/products/:id | Delete a product |
| PATCH | /api/admin/products/:id/toggle | Toggle isActive or isFeatured |

#### **Category Management**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| POST | /api/admin/categories | Create a category (main or sub-category) |
| PUT | /api/admin/categories/:id | Update name or parent category |
| DELETE | /api/admin/categories/:id | Delete a category |

#### **Media (Image Upload)**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| POST | /api/admin/upload | Upload image and return URL (S3 or local storage) |

### **4\. WhatsApp Checkout Logic**

Although checkout happens externally via WhatsApp, an optional helper endpoint can be implemented:

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| POST | /api/orders/log | (Optional) Logs cart snapshot before redirecting to WhatsApp |

**Purpose:**

* Track user purchase intent  
* Analyze popular products  
* Improve inventory decisions

## **Technical Design Notes**

### **Language Handling**

* API returns both:  
  * name\_en  
  * name\_ar  
* Frontend decides which language to display based on user selection

### **Image Handling Flow**

1. Admin uploads image via /api/admin/upload  
2. Backend stores file (S3 or local)  
3. Backend returns image URL  
4. Admin includes URL when creating/updating product

### **Security**

* All /api/admin/\* routes require:  
  * Authorization: Bearer \<token\>  
* Invalid or missing token → return **401 Unauthorized**

### **Error Handling**

* If no products match a search:  
  * Return: \[ \] (empty array)  
* This allows frontend to show:  
  * “No parts found” message

