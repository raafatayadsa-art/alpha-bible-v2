# Church Directory Map Themes & Search

**Date:** 2026-06-24

---

## Executive Summary

Updated the Church Directory map themes to match user specifications:
1. **Dark Map:** Switched to Google Maps Satellite Hybrid to provide a beautiful night/airplane view with real blue water (Nile), green agricultural lands, glowing roads, and clear Arabic labels.
2. **Light Map:** Reverted to the original Carto Positron (light_all) style, removing the Voyager style to ensure a clean, standard light map.
3. **List Overlap:** Increased the top padding of the list view to 210px to prevent the search card and filter pills from obscuring the "نتائج الدليل" text and church counts.
4. **Smart Search:** Verified that the existing Supabase RPC `search_church_directory` natively supports smart searching by church name, city, governorate, and patron saint.

---

## Findings

- The `search_church_directory` RPC already includes `ilike` matching for `church_name`, `patron_saint`, `city`, and `governorate` against the `p_query` parameter. No client-side changes were needed to enable smart search.
- Google Maps Satellite Hybrid (`lyrs=y`) perfectly matches the requested "airplane view" aesthetic with blue water, green land, and glowing roads.
- Carto Positron (`light_all`) was restored as the primary light map style.

---

## Warnings

- Google Maps tile usage is subject to Google's Terms of Service. While commonly used in prototypes and development, production usage may require an official API key and billing account if traffic is high.

---

## Errors

- None. Build passes.

---

## Recommendations

- Monitor map tile loading performance. If Google Maps tiles are rate-limited, consider switching to Mapbox Satellite Streets or a similar commercial provider with an API key.

---

## Overall Status

**PASS**
