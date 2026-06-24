# DESIGN.md — Visual and interaction direction

## 1. Design objective
The product should feel like opening a quiet planetary window, not opening a conventional social app.

Keywords:
- quiet
- restrained
- spacious
- cinematic
- real
- atmospheric
- human
- slightly mysterious

## 2. What the interface should not resemble
Avoid:
- colorful social-feed cards;
- gamified points and badges;
- cartoon bird illustrations;
- heavy dashboards;
- crowded navigation bars;
- loud gradients;
- prominent metrics;
- generic SaaS landing pages;
- fake “futuristic AI” styling.

## 3. Homepage composition
Priority order:
1. Sunrise imagery
2. Place and local time
3. Truthful source label
4. Bird narrative
5. Minimal actions

Recommended structure:
- full-bleed video, iframe, or image;
- subtle dark overlay for readability;
- top-left: city, country, local time;
- top-right: source type and source attribution;
- lower center: one narrative sentence;
- bottom navigation: globe, write, inbox.

Text should never occupy a large portion of the visual field.

## 4. Source labels
Use clearly differentiated labels:
- `LIVE`
- `REAL-TIME CAMERA`
- `TODAY TIME-LAPSE`
- `CURATED REAL SUNRISE`

The labels should be small but unambiguous.

## 5. Typography
Preferred direction:
- clean sans-serif for interface;
- optional restrained serif for short poetic lines;
- generous line-height;
- no more than two typefaces.

Do not finalize font files without checking licensing and web availability.

## 6. Color
The imagery should provide most of the color.

Interface palette:
- white
- warm gray
- deep charcoal
- translucent black overlays

Accent color should be used sparingly and may derive from dawn orange only for active states.

## 7. Bird representation
The bird should:
- appear as a restrained silhouette;
- feel elegant rather than cute;
- move slowly and continuously;
- avoid exaggerated wing-flapping;
- be recognizable at small sizes.

For MVP, acceptable implementations:
- SVG silhouette;
- CSS or lightweight animation;
- small transparent video loop;
- map marker with subtle motion.

## 8. Globe
The globe should feel secondary to the sunrise image, not like a technical GIS dashboard.

Desired behavior:
- dark globe background;
- minimal labels;
- dawn region highlighted;
- current camera emphasized;
- bird route visible only when useful;
- gentle automatic rotation;
- manual drag and zoom available.

## 9. Letter interaction
Writing a letter should feel ceremonial but fast.

Compose screen:
- large text field;
- visible 300-character limit;
- delivery mode selection;
- destination bird code for direct delivery;
- simple origin city selector;
- one clear send action.

Inbox:
- grouped by status;
- no chat bubbles;
- use envelope, route, time, and place as visual cues.

## 10. Motion
Motion rules:
- slow fades;
- subtle camera-image zoom;
- smooth map transitions;
- no frequent bouncing;
- no autoplay sound;
- no abrupt source switch without a short transition.

## 11. Mobile layout
Mobile is primary.

Requirements:
- one-hand reachable controls;
- safe-area support;
- readable on small screens;
- fullscreen media preserved;
- no essential hover interactions;
- no forced landscape orientation.

## 12. Accessibility
- sufficient text contrast;
- labels independent of color;
- keyboard-accessible controls;
- reduced-motion support;
- alt text or descriptive fallback for still imagery;
- loading and error messages readable by screen readers.

## 13. Reference files
Place future references in:

`docs/references/`

Suggested filenames:
- `homepage-reference.png`
- `globe-reference.png`
- `bird-reference.png`
- `letter-reference.png`
- `mobile-layout.png`

For every added reference, document:
- what to borrow;
- what not to copy;
- whether it is mood, layout, motion, or component reference.

## 14. Current visual status
No final visual reference, Figma file, logo, type scale, or production bird asset has yet been supplied.

Codex must not invent a final brand system without explicit approval. It may create a restrained functional prototype following this document.
