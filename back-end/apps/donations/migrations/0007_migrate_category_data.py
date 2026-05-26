from django.db import migrations

def migrate_categories(apps, schema_editor):
    Donation = apps.get_model('donations', 'Donation')
    mapping = {
        'fruits': 'Fruit',
        'legumes': 'Fruit',
        'pain': 'Pastries',
        'conserves': 'Preserved',
        'produits_laitiers': 'Milk',
        'autre': 'Other',
    }
    for old, new in mapping.items():
        Donation.objects.filter(category=old).update(category=new)

class Migration(migrations.Migration):
    dependencies = [
        ('donations', '0006_update_category_choices'),  
    ]
    operations = [
        migrations.RunPython(migrate_categories, migrations.RunPython.noop),
    ]