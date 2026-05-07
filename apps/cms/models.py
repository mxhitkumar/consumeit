from ckeditor_uploader.fields import RichTextUploadingField
from django.db import models
from django.urls import reverse
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class Page(TimeStampedModel):
    TEMPLATE_STANDARD = "standard"
    TEMPLATE_CONTACT = "contact"
    TEMPLATE_CHOICES = (
        (TEMPLATE_STANDARD, "Standard"),
        (TEMPLATE_CONTACT, "Contact"),
    )

    title = models.CharField(max_length=200)
    menu_title = models.CharField(max_length=80, blank=True)
    slug = models.SlugField(unique=True)
    hero_title = models.CharField(max_length=255, blank=True)
    summary = models.TextField(blank=True)
    body = RichTextUploadingField()
    template_key = models.CharField(
        max_length=20, choices=TEMPLATE_CHOICES, default=TEMPLATE_STANDARD
    )
    featured_image = models.ImageField(upload_to="pages/", blank=True, null=True)
    featured_image_alt = models.CharField(max_length=255, blank=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    og_title = models.CharField(max_length=255, blank=True)
    og_description = models.TextField(blank=True)
    og_image = models.ImageField(upload_to="seo/pages/", blank=True, null=True)
    is_published = models.BooleanField(default=True)
    show_in_navigation = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=100)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def navigation_label(self):
        return self.menu_title or self.title

    def get_absolute_url(self):
        return reverse("cms:page-detail", kwargs={"slug": self.slug})
