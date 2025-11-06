from django.core.management.base import BaseCommand
from products.models import GlobalOption

class Command(BaseCommand):
    help = "Fix GlobalOption types (normalize to RAM, STORAGE, COLOR) and ensure storage/colors exist."

    def handle(self, *args, **kwargs):
        # Normalize wrong-case types
        changed = 0
        for wrong, correct in (("Storage", "STORAGE"), ("storage", "STORAGE"),
                               ("Color", "COLOR"), ("color", "COLOR")):
            qs = GlobalOption.objects.filter(type=wrong)
            if qs.exists():
                qs.update(type=correct)
                changed += qs.count()

        self.stdout.write(self.style.SUCCESS(f"Normalized {changed} records (if any)."))

        # Ensure standard storage and color options exist (idempotent)
        storage_values = [f"{x}GB" for x in [64, 128, 256, 512]] + [f"{x}TB" for x in [1, 2]]
        color_values = [
            "Black", "White", "Silver", "Gold", "Blue", "Green", "Red",
            "Purple", "Gray", "Pink", "Midnight", "Starlight"
        ]

        created = 0
        for val in storage_values:
            obj, created_flag = GlobalOption.objects.get_or_create(type="STORAGE", value=val)
            if created_flag: created += 1

        for val in color_values:
            obj, created_flag = GlobalOption.objects.get_or_create(type="COLOR", value=val)
            if created_flag: created += 1

        self.stdout.write(self.style.SUCCESS(f"Ensured storage/colors — created {created} new options."))
