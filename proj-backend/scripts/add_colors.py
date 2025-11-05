# scripts/add_colors.py
from products.models import Color
from django.db import transaction

# === FULL COLOR LIST WITH HEX CODES ===
COLORS = [
    ("Black", "#000000"),
    ("White", "#FFFFFF"),
    ("Silver", "#C0C0C0"),
    ("Space Gray", "#5C5C5C"),
    ("Space Black", "#1C1C1E"),
    ("Midnight", "#191970"),
    ("Starlight", "#F5F5DC"),
    ("Gold", "#FFD700"),
    ("Rose Gold", "#B76E79"),
    ("Pink", "#FFC1CC"),
    ("Red", "#FF0000"),
    ("Blue", "#0000FF"),
    ("Pacific Blue", "#002D72"),
    ("Sky Blue", "#87CEEB"),
    ("Green", "#008000"),
    ("Mint Green", "#98FF98"),
    ("Yellow", "#FFFF00"),
    ("Purple", "#800080"),
    ("Graphite", "#383838"),
    ("Sierra Blue", "#5A9FD4"),
    ("Alpine Green", "#3D5A45"),
    ("Natural Titanium", "#8B8B8D"),
    ("Blue Titanium", "#4A6FA5"),
    ("White Titanium", "#E8E8E8"),
    ("Black Titanium", "#2B2B2B"),
]

def add_colors():
    print("Adding colors to database...")
    added = 0
    skipped = 0

    with transaction.atomic():
        for name, hex_code in COLORS:
            _, created = Color.objects.get_or_create(
                name=name,
                defaults={"hex_code": hex_code}
            )
            if created:
                added += 1
                print(f"Added: {name} ({hex_code})")
            else:
                skipped += 1
                # Optional: update hex if changed
                color = Color.objects.get(name=name)
                if color.hex_code != hex_code:
                    color.hex_code = hex_code
                    color.save()
                    print(f"Updated: {name} → {hex_code}")

    print(f"\nDone! Added: {added}, Skipped/Updated: {skipped}")
    print("All colors are ready in /api/products/colors/")

if __name__ == "__main__":
    add_colors()