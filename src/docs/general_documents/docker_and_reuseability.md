## **3\. Docker Setup (The “Glue”)**

To ensure consistency across development and production environments, the project uses **Docker** with **docker-compose**.

This guarantees that:

* Your local machine  
* The developer’s machine  
* The production server

all run the exact same environment.

### **docker-compose.yml Structure**

services:  
 db:  
   image: postgres:15  
   environment:  
     POSTGRES\_DB: carparts\_db  
   ports:  
     \- "5432:5432"

 backend:  
   build: ./backend  
   ports:  
     \- "4000:4000"  
   depends\_on:  
     \- db

 frontend:  
   build: ./frontend  
   ports:  
     \- "3000:3000"

### **Service Breakdown**

**Database (PostgreSQL)**

* Runs on port **5432**  
* Stores all product, category, and admin data

**Backend (Node.js / Express)**

* Runs on port **4000**  
* Handles API logic, authentication, and database interaction

**Frontend (Next.js)**

* Runs on port **3000**  
* Provides the user interface (shop \+ admin panel)

### **Why Docker Matters**

* **Consistency:** Eliminates “it works on my machine” issues  
* **Portability:** Easy deployment to any VPS or cloud provider  
* **Scalability:** Services can be extended (e.g., Redis, Nginx) later

## **13\. Key Strategies for Reusability**

### **A. Shared Types**

A shared `types.ts` file will be used across both frontend and backend.

**Benefit:**

* Ensures type consistency  
* Reduces integration errors  
* If the backend changes (e.g., Product model), the frontend immediately reflects it via TypeScript errors

### **B. Centralized API Client**

Instead of calling APIs directly throughout the frontend, a centralized API layer will be used.

**Example:**

// frontend/src/lib/api.ts

export const getProducts \= (params) \=\>  
 api.get('/products', { params });

export const updateProduct \= (id, data) \=\>  
 api.put(\`/admin/products/${id}\`, data);

**Benefit:**

* Cleaner codebase  
* Easier maintenance  
* Centralized control over API logic (headers, tokens, error handling)

### **C. Theme Consistency**

The project will use a centralized **Tailwind CSS configuration**.

**Benefit:**

* Ensures consistent design across:  
  * Customer frontend  
  * Admin panel  
* Example:  
  * “Mercedes Blue” or “German Red” remains identical everywhere

### **Why These Strategies Matter**

* **Reduced Bugs:** Strong typing \+ centralized logic  
* **Faster Development:** Reuse instead of rewriting components  
* **Scalability:** Easy to extend features without breaking existing code

