"""
Lovix data migration: old Supabase -> new Supabase
Imports: auth users, profiles, generations, influencers, influencer_poses, assets
"""
import csv, json, urllib.request, urllib.error, sys, time

csv.field_size_limit(10_000_000)

SUPABASE_URL = "https://wljqdlzbumkteifjpnkh.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsanFkbHpidW1rdGVpZmpwbmtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA3NjI4NywiZXhwIjoyMDkzNjUyMjg3fQ.ZkEtF136UNhXV1IrrRkSie12u6rjLU-Yn-omMB1q2F4"
DL = "C:/Users/infoe/Downloads"

def api(method, path, body=None, auth_type="service"):
    url = f"{SUPABASE_URL}{path}"
    headers = {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
    }
    if auth_type == "auth_admin":
        headers["Authorization"] = f"Bearer {SERVICE_KEY}"

    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode()), e.code

def rest(method, table, body=None, params=""):
    return api(method, f"/rest/v1/{table}{params}", body)

def load_csv(fname):
    with open(f"{DL}/{fname}", "r", encoding="utf-8") as f:
        return list(csv.DictReader(f, delimiter=";"))

def clean(val):
    return val if val not in ("", "NULL", "null") else None

# ── 1. AUTH USERS ─────────────────────────────────────────────────────────────
print("\n=== 1. Creating auth users ===")
profiles = load_csv("profiles-export-2026-05-06_16-07-29.csv")
print(f"  Found {len(profiles)} profiles")

ok = fail = skip = 0
for p in profiles:
    uid   = p["id"]
    email = clean(p["email"])
    if not email:
        skip += 1
        continue

    body = {
        "id": uid,
        "email": email,
        "email_confirm": True,
        "user_metadata": {"full_name": clean(p.get("full_name", ""))},
    }
    res, code = api("POST", "/auth/v1/admin/users", body)
    if code in (200, 201):
        ok += 1
    elif "already been registered" in str(res) or "already exists" in str(res) or code == 422:
        skip += 1
    else:
        fail += 1
        print(f"  FAIL {email}: {code} {res}")

print(f"  Created: {ok} | Already exists: {skip} | Failed: {fail}")

# ── 2. PROFILES ───────────────────────────────────────────────────────────────
print("\n=== 2. Importing profiles ===")
rows = []
for p in profiles:
    rows.append({
        "id":         p["id"],
        "email":      clean(p["email"]),
        "full_name":  clean(p.get("full_name")),
        "avatar_url": clean(p.get("avatar_url")),
        "credits":    int(p["credits"]) if p.get("credits") else 0,
        "created_at": p.get("created_at"),
        "updated_at": p.get("updated_at"),
    })

# Upsert in batches of 50
for i in range(0, len(rows), 50):
    batch = rows[i:i+50]
    res, code = api("POST", "/rest/v1/profiles",
        batch,
        # upsert header
    )
    # Use upsert via header
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    headers = {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    data = json.dumps(batch).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            print(f"  Batch {i//50+1}: {len(batch)} rows -> {r.status}")
    except urllib.error.HTTPError as e:
        print(f"  Batch {i//50+1} ERROR: {e.code} {e.read().decode()[:200]}")

# ── 3. GENERATIONS ────────────────────────────────────────────────────────────
print("\n=== 3. Importing generations ===")
gens = load_csv("generations-export-2026-05-06_16-06-08.csv")
print(f"  Found {len(gens)} generations")

valid_types = {'video','image','motion','influencer-video','influencer-motion','influencer-lipsync','influencer-pose'}
gen_rows = []
skipped_b64 = 0
for g in gens:
    result_url = clean(g.get("result_url", ""))
    # Skip base64 inline data - can't store, not a URL
    if result_url and result_url.startswith("data:"):
        result_url = None
        skipped_b64 += 1

    gtype = g.get("type", "image")
    if gtype not in valid_types:
        gtype = "image"

    settings = g.get("settings")
    try:
        settings = json.loads(settings) if settings else {}
    except:
        settings = {}

    gen_rows.append({
        "id":            g["id"],
        "user_id":       g["user_id"],
        "type":          gtype,
        "prompt":        clean(g.get("prompt")),
        "settings":      settings,
        "status":        g.get("status", "completed"),
        "result_url":    result_url,
        "external_id":   clean(g.get("external_id")),
        "credits_used":  int(g.get("credits_used") or 0),
        "error_message": clean(g.get("error_message")),
        "created_at":    g.get("created_at"),
        "updated_at":    g.get("updated_at"),
    })

print(f"  Skipped {skipped_b64} base64 result_urls (inline data)")

for i in range(0, len(gen_rows), 50):
    batch = gen_rows[i:i+50]
    url = f"{SUPABASE_URL}/rest/v1/generations"
    headers = {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    req = urllib.request.Request(url, data=json.dumps(batch).encode(), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            print(f"  Batch {i//50+1}: {len(batch)} rows -> {r.status}")
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  Batch {i//50+1} ERROR: {e.code} {err[:300]}")

# ── 4. INFLUENCERS ────────────────────────────────────────────────────────────
print("\n=== 4. Importing influencers ===")
infs = load_csv("influencers-export-2026-05-06_16-06-48.csv")
print(f"  Found {len(infs)} influencers")

inf_rows = []
for r in infs:
    tags = clean(r.get("personality_tags"))
    if tags:
        try:
            tags = json.loads(tags)
        except:
            tags = [t.strip().strip('"') for t in tags.strip('{}').split(',') if t.strip()]
    inf_rows.append({
        "id":               r["id"],
        "user_id":          r["user_id"],
        "name":             r["name"],
        "avatar_image":     r["avatar_image"],
        "gender":           r["gender"],
        "age_range":        r["age_range"],
        "ethnicity":        clean(r.get("ethnicity")),
        "hair_style":       clean(r.get("hair_style")),
        "fashion_style":    clean(r.get("fashion_style")),
        "personality_tags": tags,
        "voice_profile":    clean(r.get("voice_profile")) or "neutral",
        "created_at":       r.get("created_at"),
        "updated_at":       r.get("updated_at"),
    })

url = f"{SUPABASE_URL}/rest/v1/influencers"
headers = {"Content-Type":"application/json","apikey":SERVICE_KEY,"Authorization":f"Bearer {SERVICE_KEY}","Prefer":"resolution=merge-duplicates,return=minimal"}
req = urllib.request.Request(url, data=json.dumps(inf_rows).encode(), headers=headers, method="POST")
try:
    with urllib.request.urlopen(req) as r:
        print(f"  {len(inf_rows)} influencers -> {r.status}")
except urllib.error.HTTPError as e:
    print(f"  ERROR: {e.code} {e.read().decode()[:300]}")

# ── 5. INFLUENCER POSES ───────────────────────────────────────────────────────
print("\n=== 5. Importing influencer_poses ===")
poses = load_csv("influencer_poses-export-2026-05-06_16-06-30.csv")
print(f"  Found {len(poses)} poses")

pose_rows = []
for r in poses:
    pose_rows.append({
        "id":             r["id"],
        "influencer_id":  r["influencer_id"],
        "user_id":        r["user_id"],
        "image_url":      r["image_url"],
        "image_url_16_9": clean(r.get("image_url_16_9")),
        "image_url_9_16": clean(r.get("image_url_9_16")),
        "prompt":         clean(r.get("prompt")),
        "is_original":    r.get("is_original","false").lower() == "true",
        "created_at":     r.get("created_at"),
    })

url = f"{SUPABASE_URL}/rest/v1/influencer_poses"
headers = {"Content-Type":"application/json","apikey":SERVICE_KEY,"Authorization":f"Bearer {SERVICE_KEY}","Prefer":"resolution=merge-duplicates,return=minimal"}
req = urllib.request.Request(url, data=json.dumps(pose_rows).encode(), headers=headers, method="POST")
try:
    with urllib.request.urlopen(req) as r:
        print(f"  {len(pose_rows)} poses -> {r.status}")
except urllib.error.HTTPError as e:
    print(f"  ERROR: {e.code} {e.read().decode()[:300]}")

# ── 6. ASSETS ─────────────────────────────────────────────────────────────────
print("\n=== 6. Importing assets ===")
assets = load_csv("assets-export-2026-05-06_16-05-28.csv")
print(f"  Found {len(assets)} assets")

asset_rows = []
for r in assets:
    asset_rows.append({
        "id":            r["id"],
        "user_id":       r["user_id"],
        "name":          r["name"],
        "type":          r["type"],
        "url":           r["url"],
        "file_size":     int(r["file_size"]) if clean(r.get("file_size")) else None,
        "thumbnail_url": clean(r.get("thumbnail_url")),
        "created_at":    r.get("created_at"),
        "updated_at":    r.get("updated_at"),
    })

if asset_rows:
    url = f"{SUPABASE_URL}/rest/v1/assets"
    headers = {"Content-Type":"application/json","apikey":SERVICE_KEY,"Authorization":f"Bearer {SERVICE_KEY}","Prefer":"resolution=merge-duplicates,return=minimal"}
    req = urllib.request.Request(url, data=json.dumps(asset_rows).encode(), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            print(f"  {len(asset_rows)} assets -> {r.status}")
    except urllib.error.HTTPError as e:
        print(f"  ERROR: {e.code} {e.read().decode()[:300]}")
else:
    print("  No assets to import")

print("\n=== DONE ===")
