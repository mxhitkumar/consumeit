from django.db import migrations, models


def sync_service_legacy_fields(apps, schema_editor):
    table_name = "pages_service"
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_columns = {row[1] for row in cursor.fetchall()}

        missing_columns = {
            "hero_title": "varchar(255)",
            "hero_subtitle": "TEXT",
            "who_its_for": "TEXT",
            "whats_included": "TEXT",
            "expected_results": "TEXT",
            "timeline_text": "varchar(120)",
            "starting_price": "varchar(120)",
            "cta_text": "varchar(80)",
            "cta_note": "varchar(255)",
        }

        for column_name, column_type in missing_columns.items():
            if column_name not in existing_columns:
                cursor.execute(
                    f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type} NOT NULL DEFAULT ''"
                )


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0002_sync_testimonial_legacy_fields"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    sync_service_legacy_fields,
                    migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="service",
                    name="cta_note",
                    field=models.CharField(blank=True, default="", max_length=255),
                ),
                migrations.AddField(
                    model_name="service",
                    name="cta_text",
                    field=models.CharField(blank=True, default="", max_length=80),
                ),
                migrations.AddField(
                    model_name="service",
                    name="expected_results",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="service",
                    name="hero_subtitle",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="service",
                    name="hero_title",
                    field=models.CharField(blank=True, default="", max_length=255),
                ),
                migrations.AddField(
                    model_name="service",
                    name="starting_price",
                    field=models.CharField(blank=True, default="", max_length=120),
                ),
                migrations.AddField(
                    model_name="service",
                    name="timeline_text",
                    field=models.CharField(blank=True, default="", max_length=120),
                ),
                migrations.AddField(
                    model_name="service",
                    name="whats_included",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="service",
                    name="who_its_for",
                    field=models.TextField(blank=True, default=""),
                ),
            ],
        ),
    ]
