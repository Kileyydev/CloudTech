from django.core.management.base import BaseCommand
from products.models import GlobalOption


class Command(BaseCommand):
    help = "Adds predefined color options to the GlobalOption model (type='COLOR')"

    def handle(self, *args, **options):
        colors = [
            "Black",
            "Space Black",
            "White",
            "Starlight",
            "Midnight",
            "Silver",
            "Gold",
            "Gray",
            "Space Gray",
            "Deep Blue",
            "Blue",
            "Ultramarine",
            "Teal",
            "Green",
            "Sage",
            "Midnight Green",
            "Alpine Green",
            "Purple",
            "Lavender",
            "Deep Purple",
            "Pink",
            "Yellow",
            "Cosmic Orange",
            "(PRODUCT)RED",
            "Graphite",
            "Sierra Blue",
            "Natural Titanium",
            "Black Titanium",
            "White Titanium",
            "Blue Titanium",
            "Desert Titanium",
            "Bronze Titanium",
        ]

        self.stdout.write(self.style.MIGRATE_HEADING("🌈 Checking and adding color options..."))
        existing_colors = set(
            GlobalOption.objects.filter(type="COLOR").values_list("value", flat=True)
        )

        created_count = 0
        skipped_count = 0

        for color in colors:
            color_name = color.strip()
            if color_name in existing_colors:
                self.stdout.write(self.style.WARNING(f"⚠️  Skipped (already exists): {color_name}"))
                skipped_count += 1
            else:
                GlobalOption.objects.create(type="COLOR", value=color_name)
                self.stdout.write(self.style.SUCCESS(f"✅ Added: {color_name}"))
                created_count += 1

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"🎨 Done! Added {created_count} new colors, skipped {skipped_count} existing ones."))
