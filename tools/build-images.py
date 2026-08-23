#!/usr/bin/env python3
"""
Derive the site's project imagery from the originals in assets/projects/.

Source layout is one folder per project, named as the project is named:

    assets/projects/Emerald Clipz/SnapInsta.to_649225574_....jpg

Output is flat, in assets/img/, named `<slug>-<n>-<width>.webp`:

    assets/img/emerald-clipz-1-600.webp
    assets/img/emerald-clipz-1-1080.webp

content.js addresses images by that pattern alone — slug plus index — so
nothing here needs to be wired up by hand once a folder is in place. What
does need updating is the project's `imgs:` count in content.js, which is
how many shots the case study asks for.

ORDER IS THE FILENAME ORDER. `<slug>-1` is the first file alphabetically,
and it becomes that project's card image and case-study hero. Renaming a
source file therefore reshuffles the set — check the work grid after.

HOW MANY are taken per project is read from content.js's `imgs:` field, not
from how many files the folder holds. Several folders carry more shots than
the case study shows, and generating the rest would put megabytes into every
deploy that nothing requests. Raise `imgs:` to use more; pass --all to
generate everything, which is the useful mode when choosing which to keep.

Widths are 600 and 1080, and nothing is ever upscaled: a source narrower
than 1080 only gets the variants it can fill. That is why some projects
have both widths and some have one, and why `srcset` must never assume a
1080 exists.

Usage:  tools/build-images.py [--out DIR] [--dry-run]
"""
import argparse, json, pathlib, re, sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "projects"
WIDTHS = (600, 1080)
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

# Folders that are not projects. `new` is a staging area the originals were
# dropped into; it has no entry in content.js and nothing links to it.
SKIP = {"new"}


def slugify(name):
    """'Danny's Foods' -> 'danny-s-foods', matching the slugs in content.js."""
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


def declared_counts():
    """slug -> imgs, read straight out of content.js.

    Parsed rather than imported: content.js is a browser file with no module
    exports, and a regex over two fields is a smaller price than a JS runtime
    in the image pipeline. Both fields sit in the same object literal, so
    pairing them by order of appearance is safe.
    """
    src = (ROOT / "content.js").read_text()
    slugs = re.findall(r"slug:\s*'([^']+)'", src)
    imgs = re.findall(r"imgs:\s*(\d+)", src)
    if len(slugs) != len(imgs):
        sys.exit("content.js has %d slugs but %d imgs: counts — every project "
                 "needs both" % (len(slugs), len(imgs)))
    return dict(zip(slugs, (int(i) for i in imgs)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "assets" / "img"))
    ap.add_argument("--dry-run", action="store_true",
                    help="list what would be written without writing it")
    ap.add_argument("--all", action="store_true",
                    help="generate every shot in every folder, ignoring the "
                         "imgs: counts in content.js")
    args = ap.parse_args()
    out = pathlib.Path(args.out)

    if not SRC.is_dir():
        sys.exit("no %s — the originals are missing" % SRC)

    if not args.dry_run:
        out.mkdir(parents=True, exist_ok=True)

    want = {} if args.all else declared_counts()
    manifest, written, skipped = {}, 0, 0

    for folder in sorted(p for p in SRC.iterdir() if p.is_dir()):
        if folder.name in SKIP:
            continue
        slug = slugify(folder.name)
        files = sorted(f for f in folder.iterdir()
                       if f.suffix.lower() in EXTS and not f.name.startswith("."))
        if not files:
            print("  ! %s: no images" % folder.name)
            continue

        if not args.all:
            if slug not in want:
                print("  - %-24s not in content.js, skipped" % slug)
                continue
            if len(files) < want[slug]:
                print("  ! %-24s content.js asks for %d, folder has %d"
                      % (slug, want[slug], len(files)))
            files = files[:want[slug]]

        shots = []
        for n, f in enumerate(files, 1):
            im = Image.open(f)
            im = im.convert("RGB") if im.mode in ("RGBA", "P", "LA") else im
            sizes = []
            for w in WIDTHS:
                if w > im.width:          # never upscale
                    continue
                h = round(w * im.height / im.width)
                dest = out / ("%s-%d-%d.webp" % (slug, n, w))
                if not args.dry_run:
                    im.resize((w, h), Image.LANCZOS).save(
                        dest, "WEBP", quality=82, method=6)
                sizes.append(w)
                written += 1
            if not sizes:
                # Narrower than the smallest variant: ship it at its own size
                # rather than dropping the shot.
                dest = out / ("%s-%d-%d.webp" % (slug, n, WIDTHS[0]))
                if not args.dry_run:
                    im.save(dest, "WEBP", quality=82, method=6)
                sizes = [WIDTHS[0]]
                written += 1
                skipped += 1
            shots.append({"base": "%s-%d" % (slug, n),
                          "sizes": sizes,
                          "ar": round(im.width / im.height, 3),
                          "source": f.name})

        manifest[slug] = {"name": folder.name, "images": shots}
        print("  %-24s %2d shots" % (slug, len(shots)))

    if not args.dry_run:
        (out / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True))

    print("\n%d projects, %d files%s%s" % (
        len(manifest), written,
        " (%d below %dpx, shipped at source size)" % (skipped, WIDTHS[0]) if skipped else "",
        "  [dry run, nothing written]" if args.dry_run else ""))
    print("Remember: `imgs:` in content.js is per-project and is not updated here.")


if __name__ == "__main__":
    main()
