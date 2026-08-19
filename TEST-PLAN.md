# Lighthouse Admin Panel — Test Plan

## Test Data

### Brands

| # | Name | Slug (auto) | Website |
|---|------|-------------|---------|
| B1 | Philips Lighting | `philips-lighting` | `https://www.philips.com` |
| B2 | Flos | `flos` | `https://www.flos.com` |

### Attributes (6)

| # | Name | Type | Options (if select/color) | isActive |
|---|------|------|--------------------------|----------|
| A1 | Color | color | `#FF0000` (Red), `#0000FF` (Blue), `#000000` (Black), `#FFFFFF` (White) | true |
| A2 | Wattage | number | — | true |
| A3 | Finish | select | Matte Black, Brushed Brass, Chrome, White | true |
| A4 | Dimmable | boolean | — | true |
| A5 | Beam Angle | text | — | true |
| A6 | IP Rating | select | IP20, IP44, IP65 | true |

### Categories (5)

```
Lighting (level 0, root)           ← C1
├── Indoor (level 1)               ← C2
│   ├── Pendant Lights (level 2)   ← C3
│   └── Table Lamps (level 2)      ← C4
Outdoor (level 0, root)            ← C5
```

| # | Name | Parent | Level | Assigned Attributes | isVariant |
|---|------|--------|-------|---------------------|-----------|
| C1 | Lighting | None | 0 | Color (A1), Finish (A3) | Color → true, Finish → false |
| C2 | Indoor | C1 | 0→1 | Wattage (A2), Dimmable (A4) | Wattage → true, Dimmable → false |
| C3 | Pendant Lights | C2 | 1→2 | Beam Angle (A5) | Beam Angle → true |
| C4 | Table Lamps | C2 | 1→2 | IP Rating (A6) | IP Rating → true |
| C5 | Outdoor | None | 0 | IP Rating (A6), Color (A1) | IP Rating → true, Color → true |

### Products (4)

| # | Name | Brand | Category | Variant Options | Specs | Images |
|---|------|-------|----------|-----------------|-------|--------|
| P1 | Orb Pendant | Philips Lighting (B1) | Pendant Lights (C3) | Color: Red, Blue | Wattage: "60W", Beam Angle: "120°" | 1 image |
| P2 | Taccia Table Lamp | Flos (B2) | Table Lamps (C4) | Color: White, Black | Wattage: "40W", Dimmable: "Yes" | 1 image |
| P3 | Arc Floor Lamp | Philips Lighting (B1) | Indoor (C2) | Finish: Matte Black, Chrome, Brushed Brass | Wattage: "75W" | 1 image |
| P4 | Garden Spot Light | Flos (B2) | Outdoor (C5) | Color: Black, White | IP Rating: "IP65", Wattage: "30W" | 1 image |

---

## Phase 1: Creation Tests

### T1 — Create Brand B1 (Philips Lighting)

**Steps:** Admin → Brands → Add → Enter name "Philips Lighting" → Enter website → Save

**Verify:**
- Slug auto-generates as `philips-lighting`
- Brand appears in the brands list with Active status

**Caveats:**
- Slug uniqueness: If you create another brand named "Philips Lighting Co" and then delete the first, creating a brand with the same name again should generate `philips-lighting-2` (slug is unique, old slug may be cached in DB)

### T2 — Create Brand B2 (Flos)

**Steps:** Same as T1 with "Flos"

**Verify:**
- Slug auto-generates as `flos`
- Both brands visible in list

### T3 — Create Attribute A1 (Color — type: color)

**Steps:** Admin → Attributes → Add → Name: "Color", Type: Color → Add options: `#FF0000`, `#0000FF`, `#000000`, `#FFFFFF` → Save

**Verify:**
- Color picker renders in the options section
- Attribute appears in list with type badge "Color"
- Toggle shows "On" (active)

**Caveats:**
- The color options are stored as hex strings. If you enter `red` instead of `#FF0000`, it will be stored as-is — the product form's ColorPicker expects hex values. Test with an invalid value to see what happens.
- Duplicate option check is **case-insensitive** — entering `#ffffff` and `#FFFFFF` should be rejected as duplicates.

### T4 — Create Attribute A3 (Finish — type: select)

**Steps:** Name: "Finish", Type: Select → Add options: "Matte Black", "Brushed Brass", "Chrome", "White" → Save

**Verify:**
- All four options appear as removable tags
- "Add option" input is functional

**Caveats:**
- Select type **requires at least one option** — saving with zero options will fail Zod validation (`options` must have at least 1 entry for select/color types)
- Max 50 options per attribute — test adding 51 to see the error

### T5 — Create Attribute A2, A4, A5, A6

Create all remaining attributes. For type:
- Wattage: **number** — no options needed
- Dimmable: **boolean** — no options needed
- Beam Angle: **text** — no options needed
- IP Rating: **select** with options: "IP20", "IP44", "IP65"

### T6 — Create Category C1 (Lighting — root)

**Steps:** Admin → Categories → Add → Name: "Lighting" → Parent: None (top-level) → Attributes: add Color (A1), add Finish (A3)

**For each attribute in the category form:**
- Toggle **Variant** ON for Color → This means Color will appear as a variant option when editing products in this category
- Leave **Variant** OFF for Finish → This means Finish will appear as a suggestion in the Specifications section

**Verify:**
- Category appears in the categories tree at root level
- `level` is 0
- `ancestors` array is empty
- `ancestorSlugs` array is empty

### T7 — Create Category C2 (Indoor — child of C1)

**Steps:** Name: "Indoor" → Parent: Lighting → Attributes: add Wattage (A2), add Dimmable (A4)

**Toggle:**
- Wattage → Variant: ON
- Dimmable → Variant: OFF

**Verify:**
- Category appears nested under "Lighting" in the tree
- `level` is 1
- `ancestors` contains C1's ObjectId
- `ancestorSlugs` is `["lighting"]`

**Caveat:** The parent dropdown shows indentation with `└` prefix. Verify the visual nesting is correct.

### T8 — Create Category C3 (Pendant Lights — child of C2)

**Steps:** Name: "Pendant Lights" → Parent: Indoor → Attributes: add Beam Angle (A5), Variant: ON

**Verify:**
- `level` is 2
- `ancestors` has 2 entries: [C1, C2]
- `ancestorSlugs` is `["lighting", "indoor"]`

### T9 — Create Category C4 (Table Lamps — child of C2)

**Steps:** Name: "Table Lamps" → Parent: Indoor → Attributes: add IP Rating (A6), Variant: ON

### T10 — Create Category C5 (Outdoor — root)

**Steps:** Name: "Outdoor" → Parent: None → Attributes: add IP Rating (A6), add Color (A1)

**Toggle:**
- IP Rating → Variant: ON
- Color → Variant: ON

**Verify:** `level` is 0, empty ancestors

### T11 — Create Product P1 (Orb Pendant)

**Steps:**
1. Admin → Products → Add
2. Name: "Orb Pendant"
3. Brand: Philips Lighting
4. Category: Pendant Lights (C3)
5. **Suggestion badges should appear** — since C3 has Beam Angle as a variant attribute, and C2 (parent) has Wattage (variant), and C1 (grandparent) has Color (variant) and Finish
6. Click the suggested "Beam Angle" badge → it becomes an active option
7. Add values to Beam Angle: "120°"
8. Click "+ Add option" → add "Color" manually (or from library) → values: "Red", "Blue"
9. Add at least one image
10. Add specs: Wattage = "60W", Beam Angle = "120°"
11. Set a price on the generated variant
12. Save

**Verify:**
- Product appears in the products list
- Brand is "Philips Lighting"
- Category path would resolve to `/products/lighting/indoor/pendant-lights/orb-pendant`
- `category.ancestorSlugs` on the stored product is `["lighting", "indoor"]`
- `variantAttributes` contains `["Color", "Beam Angle"]` (names only, no IDs)

**Caveats:**
- The `attributeId` is **not** stored on the product — only the attribute **name**. If you later rename "Color" to "Primary Color", all existing products still say "Color" in their data. The product link is by name, not ID.
- Duplicate SKU check: if you generate variants with the same SKU, the form should block save.
- Price of `0` is valid (min 0 in Zod). Sale price must be ≥ 0. Cost price must be ≥ 0.

### T12 — Create Product P2 (Taccia Table Lamp)

**Steps:** Brand: Flos, Category: Table Lamps (C4)
- Suggestion badges: IP Rating (from C4), Wattage (from C2), Dimmable (from C2), Color (from C1), Finish (from C1)
- Add IP Rating as option: "IP20"
- Add Color as option: "White", "Black"
- Add specs: Wattage = "40W", Dimmable = "Yes"

### T13 — Create Product P3 (Arc Floor Lamp)

**Steps:** Brand: Philips Lighting, Category: Indoor (C2)
- Suggestion badges: Wattage (from C2), Dimmable (from C2), Color (from C1), Finish (from C1)
- Add Finish as variant option: "Matte Black", "Chrome", "Brushed Brass"
- Specs: Wattage = "75W"

**Note:** This product is assigned to a parent category (Indoor), not a leaf. This is valid — the form allows it.

### T14 — Create Product P4 (Garden Spot Light)

**Steps:** Brand: Flos, Category: Outdoor (C5)
- Add IP Rating as option: "IP65"
- Add Color as option: "Black", "White"
- Specs: IP Rating = "IP65", Wattage = "30W"

---

## Phase 2: Edit Tests

### T15 — Edit Brand: Rename B1

**Steps:** Edit "Philips Lighting" → Change name to "Philips" → Save

**Verify:**
- Slug should regenerate to `philips` (if auto-slug is not locked)
- Products P1 and P3 should still show "Philips" as brand (products store denormalized brand snapshot)

**Caveat:** Products store `{ _id, name, slug }` for the brand. If you rename the brand, **existing products keep the old name** until they are re-saved. The product form loads the brand from `initialData.brand.name`, not from the brand collection. Check if re-saving a product updates the stored brand snapshot.

### T16 — Edit Category: Move C3 (Pendant Lights) under C5 (Outdoor)

**Steps:** Edit "Pendant Lights" → Change parent from "Indoor" to "Outdoor" → Save

**Verify:**
- Warning banner appears: "Changing the parent will move this category and all its children..."
- After save:
  - C3's `level` changes from 2 to 1
  - C3's `ancestors` changes to [C5]
  - C3's `ancestorSlugs` changes to `["outdoor"]`
- Products in C3 (P1) still work — product stores the old `ancestorSlugs` snapshot, which is now stale

**⚠️ Critical edge case:** The product P1's `category.ancestorSlugs` is still `["lighting", "indoor"]` because it was snapshot at creation time. **Moving a category does NOT cascade to products.** The product's URL path becomes incorrect. You must edit and re-save each product in that category to refresh its snapshot.

**Test:** After moving C3, open P1 for editing and re-save without changes. Verify `category.ancestorSlugs` is now `["outdoor"]`.

### T17 — Edit Category: Try to set C3's parent to C3 itself

**Steps:** Edit "Pendant Lights" → Try to set Parent to "Pendant Lights" → Save

**Verify:** Error: "A category cannot be its own parent."

### T18 — Edit Category: Try circular reference

**Steps:**
1. Move C3 back under C2 (Indoor)
2. Edit C1 (Lighting) → Try to set Parent to C3 (Pendant Lights)

**Verify:** Error: "Cannot set a descendant as parent (circular reference)."

**How the server catches this:** It walks up from the proposed parent (C3 → C2 → C1) and finds C1 in the chain.

### T19 — Edit Category: Try to exceed max depth

**Steps:**
1. Create a new root category "Furniture" (C6)
2. Create "Indoor Furniture" under Furniture (C7, level 1)
3. Create "Tables" under Indoor Furniture (C8, level 2)
4. Create "Dining Tables" under Tables (C9, level 3)
5. Try to create "Round Dining Tables" under Dining Tables

**Verify:** Error: "Categories cannot exceed 4 levels deep."

**Caveat:** The depth limit is checked at both create and update. If C9 (level 3) already exists and has descendants, moving it under a deeper parent should also fail because the descendants would overflow.

### T20 — Edit Attribute: Toggle A1 (Color) Off

**Steps:** Admin → Attributes → Find "Color" → Click "Off"

**Verify:**
- Status badge changes to "Inactive"
- Color no longer appears in the AddAttributeDialog (product/category forms)

**Test in category form:**
1. Edit C1 (Lighting) — the Select dropdown for Color should show "Color (color) — Inactive"
2. The category still saves with Color assigned — it's not auto-removed
3. Existing products with Color variants are unaffected

### T21 — Edit Attribute: Toggle A1 back On

**Steps:** Click "On" for Color

**Verify:** Status badge returns to "Active", Color reappears in AddAttributeDialog.

### T22 — Edit Product: Add a new variant option

**Steps:** Edit P1 (Orb Pendant) → Click "+ Add option" → Add "Finish" → Values: "Chrome", "Matte Black" → Save

**Verify:**
- Product now has 3 variant dimensions: Color, Beam Angle, Finish
- Variant count should multiply: previously 2 (Color: Red/Blue), now 6 (2 × 1 × 2)
- The `variantAttributes` array in the DB now includes "Finish"

**Caveat:** Adding a new dimension multiplies variants. If you had 3 values in Color and 4 in Finish, you'd get 12 variants. Be careful with large value counts.

### T23 — Edit Product: Remove a variant option's values

**Steps:** Edit P1 → Remove "Blue" from Color → Save

**Verify:**
- Only "Red" remains in Color
- Variant count should drop: previously 6 (with Finish), now 3
- The removed variant's SKU, price, stock data is lost

**⚠️ Critical edge case:** Removing a value that was used by an existing variant **deletes that variant's data** (price, stock, images). There is no "archive" or soft-delete. The variant is simply not regenerated. If you re-add the value later, you get a fresh variant with defaults.

### T24 — Edit Product: Change category

**Steps:** Edit P1 → Change category from Pendant Lights (C3) to Table Lamps (C4) → Save

**Verify:**
- Product's `category._id` updates to C4
- `category.name` updates to "Table Lamps"
- `category.slug` updates to "table-lamps"
- `category.ancestorSlugs` updates to `["lighting", "indoor"]` (same as C3 in this case, but would differ for C5)

**Caveat:** Changing category does NOT validate that the product's existing variant options/specs are relevant to the new category. You could have a product with "Beam Angle" (a Pendant Lights attribute) assigned to Table Lamps. The form's suggestion badges will update, but existing options stay.

---

## Phase 3: Deletion Tests

### T25 — Delete Brand B2 (Flos)

**Steps:** Admin → Brands → Click delete on Flos

**Verify:**
- Success — Flos has no products assigned? Wait, P2 and P4 use Flos.

**Expected:** Error: "Cannot delete this brand because 2 product(s) are assigned to it. Reassign or remove them first."

**Test:** Reassign P2 and P4 to Philips Lighting, then delete Flos. Should succeed.

### T26 — Delete Category C4 (Table Lamps)

**Steps:** Try to delete Table Lamps

**Expected:** Error: "Cannot delete this category because 1 product(s) are assigned to it."

**Test:** Reassign P2 to another category, then delete C4. Should succeed.

**Caveat:** After deletion, the product P2's `category._id` still points to the deleted C4's ObjectId. The product data is stale. This is the same snapshot staleness issue as T16.

### T27 — Delete Category C2 (Indoor)

**Steps:** Try to delete Indoor

**Expected:** Error: "Cannot delete a category that has subcategories. Remove or reassign them first."

**Test:** Move C3 and C4 to be root categories, then try again. Should still fail if products are assigned. Need to move all products AND all children first.

### T28 — Delete Attribute A1 (Color) that's used by products

**Steps:** Admin → Attributes → Delete Color

**Expected:** Error: "Cannot delete this attribute because it is used by one or more products. Deactivate it instead."

**The server checks:**
1. Is Color assigned to any category? → Yes (C1, C5) → blocked
2. Is any product using "Color" in `variantAttributes` or `baseAttributes`? → Yes (P1, P4) → blocked

**Test:** Remove Color from all categories AND all products, then delete. Should succeed.

### T29 — Delete Attribute that's only on categories (no products)

**Steps:**
1. Remove Beam Angle (A5) from all products (edit P1, remove the option)
2. Try to delete Beam Angle

**Expected:** Still blocked — Beam Angle is assigned to category C3.

**Test:** Remove Beam Angle from C3's attributes, then delete. Should succeed.

### T30 — Delete Attribute after deactivating it

**Steps:**
1. Deactivate Beam Angle (toggle Off)
2. Try to delete it

**Expected:** Still blocked. Deactivation does NOT remove it from categories or products. The delete guard checks references regardless of `isActive`.

---

## Phase 4: Inter-dependency Matrix

| Action | Blocks if... | Error message |
|--------|-------------|---------------|
| **Delete Brand** | Any product has `brand._id === brandId` | "Cannot delete this brand because N product(s)..." |
| **Delete Category** | Any category has `parent === categoryId` | "Cannot delete a category that has subcategories..." |
| **Delete Category** | Any product has `category._id === categoryId` | "Cannot delete this category because N product(s)..." |
| **Delete Attribute** | Any category has `attributes.attributeId === attributeId` | "Cannot delete this attribute because it is assigned to one or more categories..." |
| **Delete Attribute** | Any product uses the attribute name in `variantAttributes` or `baseAttributes` | "Cannot delete this attribute because it is used by one or more products..." |
| **Move Category** | Target would create circular reference | "Cannot set a descendant as parent..." |
| **Move Category** | Target would exceed depth 4 | "Moving here would exceed the maximum depth..." |
| **Move Category** | Category is its own parent | "A category cannot be its own parent." |
| **Deactivate Attribute** | Nothing — always allowed | N/A (just toggles `isActive`) |
| **Rename Category** | Nothing — always allowed (but product snapshots go stale) | N/A |

---

## Phase 5: Edge Cases to Watch

### E1 — Empty variant values
Create a product with a Color option but zero values. Add an image and price. Try to save.
**Expected:** Form should block — at least one variant is required, and each variant needs attribute values.

### E2 — Duplicate attribute on category
Try to add "Color" (A1) twice to the same category.
**Expected:** The Zod `superRefine` on `categoryInputSchema` checks unique `attributeId` values within the array.

### E3 — Category slug collision
Create two root categories with the same name "Lighting".
**Expected:** Second one should get slug `lighting-2` via `uniqueSlug()`.

### E4 — Product slug collision
Create two products with the same name "Orb Pendant".
**Expected:** Second one should get slug `orb-pendant-2`.

### E5 — Brand slug collision
Create two brands named "Flos".
**Expected:** Second gets `flos-2`.

### E6 — Max field lengths
- Product name > 200 chars → blocked
- Slug > 100 chars → blocked
- Meta title > 60 chars → blocked
- Meta description > 160 chars → blocked
- Specification value > 200 chars → blocked
- Content fields (materials, shipping, etc.) > 1000 chars → blocked
- Attribute option value > 100 chars → blocked

### E7 — Sale price > regular price
Set sale price to 500, regular price to 100.
**Expected:** The Zod schema only checks `min(0)` — it does NOT enforce `salePrice <= price`. This is a potential business logic gap. The form should ideally warn or block.

### E8 — Zero-price product
Set price to 0 for all variants.
**Expected:** Valid per Zod (`min: 0`). Whether the UI allows publishing a free product is a business decision.

### E9 — Concurrent slug generation
Two users create categories with the same name simultaneously.
**Expected:** The unique index on `slug` should prevent duplicates. One will succeed, the other will get a MongoDB duplicate key error (11000). The `catch` in `createCategory` returns a generic error message.

### E10 — Category attribute suggestion after parent move
1. C3 (Pendant Lights) has Beam Angle (A5) as a variant attribute
2. Move C3 under C5 (Outdoor)
3. Open a new product form, select Pendant Lights as category
4. **Verify:** Suggestion badges should reflect C5's attributes (IP Rating, Color) + C3's own (Beam Angle), NOT C1/C2's attributes anymore

### E11 — Product with no category attributes
Assign a product to a category that has zero attributes.
**Expected:** No suggestion badges appear. User adds options manually via "Add option" dialog.

### E12 — Attribute type mismatch
A category has "Wattage" (type: number) as a variant attribute. User adds it as an option in the product form.
**Expected:** The product form should store the type (`number`) on the option draft. The specs editor should render a number input for number-type specs.

### E13 — Image deletion order
In the product form, delete images while variants reference them.
**Expected:** The `deleteImage` server action should be called BEFORE removing the image from the variant's `images` array. If the order is reversed, the file is deleted from Cloudinary but the variant still references it (stale URL).

### E14 — Category attributes display when attribute definition is deleted
If an attribute definition is somehow deleted (bypassing guards via direct DB access), the category's `attributeId` becomes an orphan.
**Expected:** `getCategoryAttributes()` in `category-actions.ts` handles this gracefully — it does `.filter((a) => definitionMap.has(String(a.attributeId)))` to skip orphans.

---

## Test Execution Order

1. **T1–T2:** Create brands
2. **T3–T5:** Create attributes
3. **T6–T10:** Create categories (3-level + 2-level tree)
4. **T11–T14:** Create products
5. **T15:** Edit brand name → verify product snapshot staleness
6. **T16:** Move category → verify cascade + product snapshot staleness
7. **T17–T19:** Negative tests (self-parent, circular, depth limit)
8. **T20–T21:** Attribute toggle On/Off → verify category form shows inactive
9. **T22–T24:** Edit products (add option, remove value, change category)
10. **T25–T30:** Delete tests → verify all guards
11. **E1–E14:** Edge cases as time permits
