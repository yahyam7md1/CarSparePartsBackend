## **Internationalization (i18n) Strategy – English & Arabic**

To support both **English (LTR)** and **Arabic (RTL)** professionally in the MVP, the system must handle:

* **Static UI Text** (buttons, labels, placeholders)  
* **Dynamic Data** (product names, descriptions from the database)  
* **Layout Direction** (LTR ↔ RTL switching)

This is achieved using a **3-pillar strategy**.

1. ## **1 Pillar 1: Static UI Translation (Labels & Interface Text)**

For UI elements such as:

* “Add to Cart”  
* “Search”  
* “Login”

we use **JSON-based translation files**.

### **Storage**

Located in:

src/shared/i18n/

### **Example Files**

**en.json**

{  
 "cart": "Shopping Cart",  
 "search\_placeholder": "Search part number..."  
}

**ar.json**

{  
 "cart": "سلة التسوق",  
 "search\_placeholder": "البحث عن رقم القطعة..."  
}

### **Implementation**

Use a library such as:

* next-intl  
* react-i18next

### **The Key Rule**

Never hardcode text in components.

**Incorrect:**

\<button\>Add to Cart\</button\>

**Correct:**

\<button\>{t('add\_to\_cart')}\</button\>

The system automatically renders the correct language based on the user’s selection.

## **1.2 Pillar 2: Dynamic Data Translation (Products & Content)**

Dynamic content (e.g., product names, descriptions) is handled directly from the database.

Since the schema already includes:

* `name_en`  
* `name_ar`

the solution is simple and efficient.

---

### **Backend Response Example**

{  
 "name\_en": "Brake Pad",  
 "name\_ar": "فحمات فرامل",  
 "price": 50  
}

### **Frontend Helper Function**

Create a utility in:

src/shared/utils/lang.ts  
export const getLocalizedContent \= (  
 item: any,  
 field: string,  
 lang: 'en' | 'ar'  
) \=\> {  
 return item\[\`${field}\_${lang}\`\] || item\[\`${field}\_en\`\]; // fallback to English  
};

### **Usage Example**

getLocalizedContent(product, 'name', currentLang)

### **Benefits**

* No duplication of API endpoints  
* Fast and simple logic  
* Built-in fallback to English

## **1.3 Pillar 3: Layout Direction & RTL Support**

Arabic requires a fully mirrored (RTL) interface.

### **The dir Attribute**

The application dynamically applies:

* dir="ltr" → English  
* dir="rtl" → Arabic

This is typically set on the \<html\> element by Next.js.

### **Layout Behavior**

| Language | Layout Behavior |
| ----- | ----- |
| English | Left-to-right (LTR), sidebar on left |
| Arabic | Right-to-left (RTL), sidebar on right |

### **Tailwind Logical Properties**

Instead of fixed directions (ml, mr), use logical properties:

| Class | Meaning |
| ----- | ----- |
| `ms-4` | margin-start (left in LTR, right in RTL) |
| `pe-2` | padding-end (right in LTR, left in RTL) |

### **Example**

className="ms-4 pe-2"

**Result:**

* Automatically adapts to both English and Arabic  
* No need to rewrite styles

## **1.4 Silo Advantage (Admin vs Shop)**

Because of the **modular silo structure**:

* **Customer Shop:** Fully bilingual (EN \+ AR)  
* **Admin Panel (MVP):** Can remain English-only

### **Benefit**

* Faster development  
* Reduced complexity  
* Most admins are comfortable using English

## **14.5 Language Switching Strategy (URL-Based)**

### **Recommended Approach**

Use language-based URLs:

* /en/products  
* /ar/products

### **Why This Approach**

**SEO Optimization**

* Search engines index English and Arabic pages separately

**User Experience**

* Shared links preserve language  
* Example: WhatsApp links open in the same language

**Next.js Support**

* Built-in **Internationalized Routing (i18n routing)**  
* Easy to configure and scale

