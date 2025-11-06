from django.core.management.base import BaseCommand
from products.models import GlobalOption

class Command(BaseCommand):
    help = "Load predefined RAM, Storage, and Color options into the database."

    def handle(self, *args, **options):
        ram_options = [f"{x}GB" for x in [2, 4, 6, 8, 12, 16, 32, 64, 128, 256]]
        storage_options = (
            [f"{x}GB" for x in [64, 128, 256, 512]]
            + [f"{x}TB" for x in [1, 2]]
        )
        color_options = [
            "Black", "White", "Silver", "Gold", "Blue", "Green", "Red", 
            "Purple", "Gray", "Pink", "Midnight", "Starlight"
        ]

        all_options = []

        for ram in ram_options:
            all_options.append(GlobalOption(type="RAM", value=ram))

        for storage in storage_options:
            all_options.append(GlobalOption(type="Storage", value=storage))

        for color in color_options:
            all_options.append(GlobalOption(type="Color", value=color))

        # Avoid duplicates
        for option in all_options:
            GlobalOption.objects.get_or_create(type=option.type, value=option.value)

        self.stdout.write(self.style.SUCCESS("✅ Global options loaded successfully!"))
