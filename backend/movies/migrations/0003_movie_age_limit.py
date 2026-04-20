from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0002_hall_session_booking'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='age_limit',
            field=models.CharField(
                choices=[('0+', '0+'), ('6+', '6+'), ('12+', '12+'), ('16+', '16+'), ('18+', '18+')],
                default='12+',
                max_length=3,
            ),
        ),
    ]
