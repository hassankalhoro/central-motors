# DNS Changes — Connect centralmotors.com.pk to Vercel

**Project:** suzuki-central-motors (Vercel)
**Domain:** centralmotors.com.pk
**DNS host:** cPanel (Nayatel) → Zone Editor → Manage
**Date:** 2026-06-30

---

## Records to EDIT in cPanel

### 1. Apex A record
| Field | Old value | New value |
|-------|-----------|-----------|
| Name | `centralmotors.com.pk.` | (unchanged) |
| Type | A | A |
| Record | `203.82.48.212` | **`216.198.79.1`** |

### 2. www CNAME record
| Field | Old value | New value |
|-------|-----------|-----------|
| Name | `www.centralmotors.com.pk.` | (unchanged) |
| Type | CNAME | CNAME |
| Record | `centralmotors.com.pk` | **`96263d7e9cf5afd1.vercel-dns-017.com`** |

> Note: The CNAME value is unique to this domain — always copy the exact value Vercel shows.

---

## Leave these UNTOUCHED (keeps email + services working)

- `MX` record → `centralmotors.com.pk`
- `mail.centralmotors.com.pk.` (CNAME)
- `TXT` (SPF) record
- `ftp`, `whm`, `webdisk`, `cpcontacts`, and other subdomain A records

---

## Steps

1. cPanel → Zone Editor → **Manage** for centralmotors.com.pk
2. **Edit** the apex A record → set to `216.198.79.1` → Save
3. **Edit** the www CNAME → set to `96263d7e9cf5afd1.vercel-dns-017.com` → Save
4. Click **Save All Records**
5. In Vercel → **Refresh** the domain
6. Wait for propagation (minutes to a couple hours) → status turns green ✅ and SSL is auto-issued

---

## Notes

- "Redirect apex domains to www" is enabled in Vercel (recommended).
- After this takes effect, the domain stops showing the old WordPress site and serves the Vercel site instead.
- Vercel's older values (`76.76.21.21` / `cname.vercel-dns.com`) still work, but the newer ones above are recommended.
