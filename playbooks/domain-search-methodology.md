# Sub-playbook: Domain Search Methodology

> How to systematically find and verify available domains across TLDs, maintain a searchable inventory, and avoid registry traps. Developed through hands-on bulk searching on 2026-04-10.

---

## TLD tier list — ordered by verification reliability + value

### Tier 1: Transparent registry (whois explicitly confirms availability)

| TLD | Reg | Renew | Whois server | Available signal | Trap signal |
|-----|-----|-------|-------------|------------------|-------------|
| .link | $7.72 | $7.72 | `whois.nic.link` | "available for registration" | n/a — no traps found |
| .quest | $1.54 | $12.98 | `whois.nic.quest` | "DOMAIN NOT FOUND" | n/a |
| .lol | $1.00 | $26.26 | `whois.nic.lol` | "DOMAIN NOT FOUND" | renewal trap |
| .sh | $31.20 | $46.65 | `whois.nic.sh` | "Domain not found." | expensive |
| .win | $4.61 | $5.64 | `whois.nic.win` | (rarely seen) | "Reserved Domain Name" — most dict words reserved |
| .me | $8.80 | $17.27 | `whois` (default) | "Domain not found." | "premium domain...contact premium@identity.digital" |

**Use these first.** Their registries expose both availability AND reservation/premium status. `.link` is the clear winner: transparent, flat renewal, massive availability of real English words.

### Tier 2: Opaque registry (RDAP-only, cannot detect reserved/premium)

| TLD | Reg | Renew | Notes |
|-----|-----|-------|-------|
| .fyi | $5.66 | $5.66 | Identity Digital. Cheapest flat renewal. |
| .dev | $10.81 | $12.87 | Google. Famous words likely premium. |
| .page | $10.81 | $10.81 | Google. Flat. |
| .app | $10.81 | $14.93 | Google. |
| .ing | $10.81* | $10.81* | Google. *Nearly all real words are premium $300+. |

**Use carefully.** RDAP `errorCode: 404` means "no registration record" but does NOT mean "available at base price." Brandable/gibberish names are likely safe; real-word picks carry unknown premium risk. Always verify at registrar cart.

### Tier 3: Fully saturated or reservation-trapped (avoid)

| TLD | Issue |
|-----|-------|
| .com (3-letter) | All 17,576 registered since 2014 |
| .io | All 3-letter registered |
| .xyz | Heavily squatted, even gibberish registered |
| .cc | Heavily squatted by Chinese bulk registrars |
| .sh | All tool names taken |
| .party | CentralNic reserved all dictionary words |
| .club | GoDaddy reserved + Chinese bulk squatting |

---

## Batch checking workflow

### Step 1: Generate candidates by category

Think in clusters rather than random words:
- **Compound words**: words that form real terms with the TLD ("miss" + .link = "missing link")
- **Technical jargon**: shader, bezier, lerp, vertex, buffer
- **Materials/metals**: steel, cobalt, titanium, quartz, sapphire
- **Nature**: animals, trees, weather, landforms, celestial
- **Human**: emotions, body parts, character traits, mythology
- **Actions**: verbs that compound well
- **Culture**: food, music, dance, instruments, fabrics

### Step 2: Check in batches with correct method per TLD

**For Tier 1 TLDs (transparent):**

```bash
# .link (best: explicitly says "available for registration")
for d in word1 word2 word3; do
  name="${d}.link"
  printf "%-16s" "$name"
  out=$(whois -h whois.nic.link "$name" 2>&1)
  if echo "$out" | grep -qi "available for registration"; then echo "AVAILABLE ✓"
  elif echo "$out" | grep -qi "Domain Name:\|Registrar:"; then echo "taken"
  else echo "???"
  fi
  sleep 0.35  # respect rate limits
done

# .quest (returns "DOMAIN NOT FOUND")
# Same pattern, whois -h whois.nic.quest, grep "DOMAIN NOT FOUND"

# .lol (returns "DOMAIN NOT FOUND")
# Same pattern, whois -h whois.nic.lol

# .sh (returns "Domain not found.")
# whois -h whois.nic.sh

# .win (check for "Reserved Domain Name" trap)
# whois -h whois.nic.win

# .me (check for "premium domain" trap)
# default whois
```

**For Tier 2 TLDs (RDAP-only):**

```bash
check_rdap() {
  curl -sL --max-time 10 "https://rdap.org/domain/$1" 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if d.get('ldhName'): print('taken')
    elif d.get('errorCode') == 404: print('AVAILABLE ?')  # ? = unverified premium risk
    else: print('unknown')
except: print('err')
"
}
# Add sleep 0.7 between calls — rdap.org rate limits after ~15-20 rapid requests
```

### Step 3: Score hits with the 5+1 rating system

| Dim | 0 | 5 |
|-----|---|---|
| PUN | SLD.TLD doesn't form a phrase | Real compound word |
| WORD | Gibberish | Common English word |
| SHORT | 11+ total chars | 6 total chars |
| SAY | Needs spelling alphabet | Clear on first hearing |
| COST | Premium / $50+ renewal | ≤$10/yr flat |
| FAV | Neutral | User explicitly loves it |

FAV is subjective per-user:
- 3 = explicitly stated preference
- 2 = matches known interests (e.g., jewelry, edu games, webXR)
- 1 = generally cool
- 0 = neutral

### Step 4: Update inventory files immediately

After EVERY batch:
1. **`~/.introdote/data/short-domain-inventory.md`** — add available domains to the correct TLD section and category
2. **`~/.introdote/data/checked-domains-taken.md`** — add all taken/reserved/premium domains
3. Never rely on memory — if it's not in the files, it'll be re-checked wastefully

---

## Known traps (learned the hard way)

### Registry-reserved names
**Symptom**: RDAP says "404 Not Found" but registrar says "not available" or "premium."
**Cause**: The registry holds the name without registering it to anyone. RDAP only tracks registered domains.
**Affected TLDs**: .win, .party, .club (CentralNic/GoDaddy) — reserve most dictionary words.
**Detection**: `whois -h whois.nic.{tld}` shows "Reserved Domain Name" on .win. Other TLDs may not expose this.
**Rule**: NEVER trust RDAP alone for phrase-pun availability. Always cross-check with registry whois.

### Premium-tier pricing
**Symptom**: Domain appears "available" but the registrar cart shows $300–$10,000+ instead of base price.
**Cause**: The registry marks common words as premium tiers with inflated pricing.
**Affected TLDs**: .dev, .app, .ing, .page (Google), .me, .fyi (Identity Digital).
**Detection**: Only detectable at registrar cart, or via .me whois which shows "premium domain" explicitly.
**Rule**: Common English words on Tier 2 TLDs should always be cart-verified before quoting to users.

### Renewal traps
**Symptom**: First-year price is $1–3, renewal is $25–50.
**Affected TLDs**: .lol ($1→$26), .site ($2→$29), .online ($2→$29), .space ($2→$26), .live ($3→$26), .fun ($3→$31).
**Rule**: Always check RENEWAL price, not just registration price. The Porkbun pricing API returns both.

### DNS NXDOMAIN lying
**Symptom**: `dig` returns NXDOMAIN but the domain is actually registered.
**Cause**: Registered domains don't always publish NS/SOA records (especially registry-held premium names).
**Affected TLDs**: New gTLDs (.ing, .dev, .app, etc.).
**Rule**: DNS is not an availability check. Use whois/RDAP.

### macOS `whois` silent fallback
**Symptom**: `whois domain.tld` returns TLD-level IANA registry info instead of domain data.
**Cause**: IANA record doesn't list a `whois:` server for the TLD, so the client falls back to IANA.
**Affected TLDs**: .fyi, .dev, .ing, .app (Identity Digital / Google).
**Rule**: Always use `whois -h <specific-server>` for TLDs where default whois fails. See the TLD tier list above.

---

## Maintenance

- Re-verify inventory entries periodically (domains get registered daily)
- When a domain is used for a project, move it from inventory to a "registered" section
- When adding new TLDs, first test whois transparency with a known-registered + known-gibberish pair before batch checking
- The `~/.introdote/data/checked-domains-taken.md` file prevents redundant work across sessions — always check it before querying

---

## Quick-start for a new search session

```bash
# 1. Read existing inventory and taken list first
cat ~/.introdote/data/short-domain-inventory.md
cat ~/.introdote/data/checked-domains-taken.md

# 2. Generate word list by category (see Step 1 above)

# 3. Filter out already-checked words from taken list

# 4. Run batch check against Tier 1 TLDs first (.link, .quest)

# 5. Score hits, update both files

# 6. Optionally check Tier 2 TLDs (.fyi, .dev) for cheap options, flagging as unverified
```
