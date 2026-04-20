from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0003_movie_age_limit'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='price',
            field=models.DecimalField(decimal_places=2, default=2000, max_digits=8),
        ),
        migrations.RemoveField(
            model_name='movie',
            name='rating',
        ),
    ]
