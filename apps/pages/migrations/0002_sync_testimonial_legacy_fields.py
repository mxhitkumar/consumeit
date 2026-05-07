from django.db import migrations, models


def sync_testimonial_legacy_fields(apps, schema_editor):
    table_name = "pages_testimonial"
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_columns = {row[1] for row in cursor.fetchall()}

        missing_columns = {
            "business_name": "varchar(150)",
            "role": "varchar(120)",
            "result_metric": "varchar(150)",
        }

        for column_name, column_type in missing_columns.items():
            if column_name not in existing_columns:
                cursor.execute(
                    f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type} NOT NULL DEFAULT ''"
                )


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    sync_testimonial_legacy_fields,
                    migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="testimonial",
                    name="business_name",
                    field=models.CharField(blank=True, default="", max_length=150),
                ),
                migrations.AddField(
                    model_name="testimonial",
                    name="role",
                    field=models.CharField(blank=True, default="", max_length=120),
                ),
                migrations.AddField(
                    model_name="testimonial",
                    name="result_metric",
                    field=models.CharField(blank=True, default="", max_length=150),
                ),
            ],
        ),
    ]
