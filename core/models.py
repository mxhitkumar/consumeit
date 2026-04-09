from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SiteSettings(TimeStampedModel):
    site_name = models.CharField(max_length=120, default="ConsumeIT")
    site_tagline = models.CharField(
        max_length=255,
        default="Scalable web development, SEO, and automation for modern brands.",
    )
    site_url = models.URLField(default="https://www.consumeit.in")
    default_meta_title = models.CharField(
        max_length=255,
        default="ConsumeIT | Web Development, SEO, AI Automation & Marketing",
    )
    default_meta_description = models.TextField(
        default=(
            "ConsumeIT helps brands grow with modern websites, search visibility, "
            "automation, and performance-driven marketing."
        )
    )
    contact_email = models.EmailField(default="consumeit.services@gmail.com")
    contact_phone = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=255, blank=True)
    x_handle = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    google_analytics_measurement_id = models.CharField(max_length=50, blank=True)
    default_og_image = models.ImageField(upload_to="seo/", blank=True, null=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self) -> str:
        return self.site_name
