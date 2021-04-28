# Generated by Django 3.2 on 2021-04-28 06:20

import csv

from django.db import migrations

from sales.forms import SaleForm

csv_file_name = 'products_list_django_additional_plus_emails.csv'
DEFAULT_AGE = 20


def import_sales_from_csv(apps, schema_editor):
    User = apps.get_model('users', 'User')

    with open(csv_file_name, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                user = User.objects.get(email=row['user_email'])
            except User.DoesNotExist:
                user = User.objects.create(
                    email=row['user_email'],
                    age=DEFAULT_AGE,
                    username=row['user_email'],
                )
            form_data = row.copy()
            form_data.pop('user_email')
            form_data['user'] = user.id

            form = SaleForm(form_data)

            if form.is_valid():
                form.save()


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0002_alter_sale_user'),
    ]

    operations = [
        migrations.RunPython(
            import_sales_from_csv,
            reverse_code=migrations.RunPython.noop,
        ),
    ]