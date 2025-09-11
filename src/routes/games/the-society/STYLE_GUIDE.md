### **File 1: `STYLE_GUIDE.md`**

# 90s UI Style Guide: "AOL-Vaesen"

## 1. Core Philosophy

The aesthetic goal is to create an interface that feels like a lost piece of software from 1998. It's inspired by the colorful, self-contained world of America Online (AOL), but built for the serious business of hunting monsters. It avoids the drab grays of corporate software in favor of a more engaging, vibrant palette.

The guiding principles are:

- **Vibrant but Limited:** Use a constrained but strong color palette. Avoid modern gradients and shadows.
- **Crisp & Pixelated:** All fonts and icons should be sharp and aliased. No anti-aliasing.
- **Tactile & Obvious:** Buttons should look like buttons. UI elements use beveled edges (`outset`, `inset`) to give a sense of physical depth.
- **Content-First, Chrome Second:** The UI "chrome" (borders, buttons, tabs) sets the scene, but the content (emails, articles, monster files) is the focus and should be highly legible.
- **Responsive Retro:** The design must adapt to modern screens, from mobile to widescreen desktops, while retaining its fixed-aspect, retro feel.

## 2. Color Palette

This palette moves away from Windows 95 gray and embraces the deeper blues and teals common in AOL and other online services.

| Role                   | Hex Code  | Scss/CSS Variable   | Description                                                               |
| ---------------------- | --------- | ------------------- | ------------------------------------------------------------------------- |
| **Primary Background** | `#000080` | `$primary-bg`       | A deep navy blue. Used for the main app background, window title bars.    |
| **Content Background** | `#F5F5DC` | `$content-bg`       | A "beige" or off-white. Easy on the eyes for reading text. Feels aged.    |
| **Primary Accent**     | `#008080` | `$accent-primary`   | A strong teal. Used for active tabs, selected items, and important icons. |
| **Link Color**         | `#0000FF` | `$link-color`       | The classic, unmistakable blue for hyperlinks.                            |
| **Text Color**         | `#000000` | `$text-color`       | Standard black for all body copy.                                         |
| **Highlight / Select** | `#FFFF00` | `$highlight-bg`     | A bright, unmissable yellow for text selection or critical notifications. |
| **Bevel Edges (3D)**   | `#C0C0C0` | `$bevel-light`      | "Silver." The light edge for creating the 3D button effect.               |
| **Bevel Edges (3D)**   | `#808080` | `$bevel-dark`       | "Gray." The dark/shadow edge for the 3D button effect.                    |
| **Notification Badge** | `#FF0000` | `$notification-red` | A pure red for notification dots on tabs (new email/chat).                |

## 3. Typography

The font is the most critical element for achieving the retro feel.

- **Primary Font:** `MS Sans Serif`. Since this is not a web-safe font, the CSS `font-family` stack should be:
  `font-family: "MS Sans Serif", "Geneva", "Verdana", "Arial", sans-serif;`
  _(For a more guaranteed pixel look, consider sourcing a free pixel font like "W95FA" and importing it via `@font-face`.)_

- **Font Rendering:** Enforce sharp, aliased rendering.

  ```css
  body {
  	-webkit-font-smoothing: none;
  	-moz-osx-font-smoothing: grayscale;
  	font-smooth: never;
  }
  ```

- **Sizing:**
  - `h1` (Component Titles, e.g., "Monsterpedia"): `16px`, `bold`
  - `h2` (Article/Email Subjects): `14px`, `bold`
  - `p`, `body` (Main text content): `12px`, `normal`
  - `ui-text` (Button labels, tabs): `12px`, `normal`

- **Styling:**
  - Links (`<a>`) must be `$link-color` and have `text-decoration: underline;`.
  - Visited links can turn purple: `#800080`.

## 4. Layout & Responsiveness

The UI should live within a main container that adapts to the screen.

- **Main Container:**
  - On desktops, it should have a `max-width` (e.g., `1280px`) and `margin: auto;` to center it. The main `<body>` background can be black or a tiled 90s pattern to frame the "application."
  - On mobile, the container should be `width: 100%;` and `height: 100%;`.
- **Spacing:** Use a consistent, chunky spacing unit, like `8px`. Paddings and margins should be multiples of this unit (`8px`, `16px`).
- **Structure:** Flexbox should be used for most layouts (e.g., side-by-side panes in the email client). Avoid complex modern grid layouts.

## 5. Component Styles

- **Buttons:**
  - Classic 3D beveled style.
  - `background-color: $bevel-light;`
  - `border: 1px solid;`
  - `border-color: $bevel-light $bevel-dark $bevel-dark $bevel-light;` (top/left are light, bottom/right are dark)
  - `box-shadow: 1px 1px 0 0 $bevel-dark;`
  - **Active/Pressed State:** The effect should invert.
    - `border-color: $bevel-dark $bevel-light $bevel-light $bevel-dark;`

- **Tabs (Top Navigation):**
  - **Inactive Tab:** Standard button style but with a background that blends more into the primary background.
  - **Active Tab:** Should appear connected to the main content pane. No bottom border, and its background color should be `$content-bg`.
  - **Notification:** A small, `$notification-red` circle (`8x8px`) in the corner of the tab text.

- **Windows / Panes:**
  - Each component (Email, News, etc.) lives in a "window" with a `$content-bg` background.
  - It should be visually framed with a 1px `inset` border to look sunken into the main application.
  - A title bar at the top with `$primary-bg`, `white` text, and the component's title (e.g., "Inbox").

- **Scrollbars:**
  - Style the scrollbar to be blocky and gray, resembling old OS scrollbars.
  - `::-webkit-scrollbar { width: 16px; }`
  - `::-webkit-scrollbar-track { background: $bevel-light; }`
  - `::-webkit-scrollbar-thumb { background: $bevel-light; border: 1px solid; border-color: $bevel-light $bevel-dark $bevel-dark $bevel-light; }`

- **Icons:**
  - Strictly pixel art style, 16x16 or 24x24 pixels max.
  - Use a limited subset of the main color palette.
  - **Examples:** Email (envelope), Chat (speech bubbles), News (newspaper), Monsterpedia (open book/magnifying glass), Map (folded map).

- **Feedback:**
  - **Loading state:** Instead of a modern spinner, the cursor should change to a pixelated hourglass (`cursor: wait;`).

---
