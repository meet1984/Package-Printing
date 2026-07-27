# Zeprr Design DNA

Extracted from Stitch Project "11528755462254995280".

## 1. Color Palette

| Role | Hex | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#F3EFE6` | Main page background (warm beige/off-white) |
| **Surface** | `#FFFFFF` | Cards, dropdowns, and input fields |
| **Surface Alt** | `#E1E1E3` | Secondary backgrounds (e.g., behind the contact form) |
| **Primary Accent** | `#F97316` | Main call-to-action buttons ("Shop Now", "Request a Quote") |
| **Primary Hover** | `#EA580C` | Hover state for primary buttons |
| **Dark Background 1** | `#3D2D1D` | Footer and deep background sections |
| **Dark Background 2** | `#61503E` | Highlight sections (e.g., Materials testimonial) |
| **Secondary Button** | `#6A4C30` | Subdued action buttons (e.g., "Send Message") |
| **Text / Headings** | `#1E1A17` | Primary dark text for high contrast |
| **Text Muted** | `#6B6B6B` | Secondary text, placeholders, and descriptions |
| **Border** | `#D1D1D1` | Borders for inputs and light dividers |

## 2. Typography

- **Primary Sans-Serif (Headings & Body)**: `Inter`, `system-ui`, `sans-serif`
  - Used for large punchy headlines (e.g., "Print anything. Low minimums, fast turnaround.") and standard body text.
  - Heading Weights: Black (900) or Bold (700)
  - Body Weight: Regular (400)
- **Secondary Serif (Elegant Headings)**: `Playfair Display`, `Georgia`, `serif`
  - Used for elegant section titles (e.g., "Zeprr Materials & Quality").

## 3. Spacing & Radius

- **Radius**
  - **Buttons**: `9999px` (Pill-shaped)
  - **Cards**: `12px` (Soft rounded corners)
  - **Inputs**: `8px` (Slightly rounded)
- **Spacing Patterns**
  - **Section Padding**: Standard large padding for main sections (e.g., `py-16` or `py-20`).
  - **Card Padding**: Comfortable inner padding (e.g., `p-6`).
  - **Gaps**: `gap-6` or `gap-8` between grid items.

## 4. Component Styles

- **Primary Button**: Pill-shaped (`rounded-full`), vibrant orange (`bg-primary`), white bold text, no border. Hover state slightly darkens the orange.
- **Secondary Button**: Pill-shaped, dark brown (`bg-[#6A4C30]`), white bold text.
- **Cards**: White background (`bg-surface`), `12px` radius, subtle drop shadow (`shadow-sm` or `shadow-md`), no heavy borders.
- **Inputs**: White background, `8px` radius, thin gray border (`border-border`), dark text.
- **Nav/Header**: Transparent or matching the base background (`#F3EFE6`), dark text links, clean spacing.
