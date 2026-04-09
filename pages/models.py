from ckeditor_uploader.fields import RichTextUploadingField
from django.db import models
from django.urls import reverse
from django.utils.text import slugify

from core.models import TimeStampedModel


class HomePage(TimeStampedModel):
    hero_title = models.CharField(
        max_length=255, default="Build a growth engine, not just another website."
    )
    hero_subtitle = models.TextField(
        default=(
            "ConsumeIT turns static marketing sites into high-converting digital "
            "platforms with SEO, automation, and scalable content operations."
        )
    )
    primary_cta_text = models.CharField(max_length=50, default="Get in touch")
    primary_cta_url = models.CharField(max_length=255, default="/contact/")
    secondary_cta_text = models.CharField(max_length=50, default="Read the blog")
    secondary_cta_url = models.CharField(max_length=255, default="/blog/")
    intro_title = models.CharField(max_length=255, default="A dynamic foundation for growth")
    intro_text = models.TextField(
        default=(
            "We modernize brochure-style websites into modular Django platforms with "
            "reusable templates, editable CMS pages, and a search-ready content layer."
        )
    )
    hero_image = models.ImageField(upload_to="home/", blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Homepage"
        verbose_name_plural = "Homepage"

    def __str__(self) -> str:
        return "Homepage"


class Service(TimeStampedModel):
    title = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    short_description = models.CharField(max_length=255)
    body = RichTextUploadingField()
    icon_class = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to="services/", blank=True, null=True)
    image_alt = models.CharField(max_length=255, blank=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=100)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("pages:service-detail", kwargs={"slug": self.slug})


class FAQ(TimeStampedModel):
    question = models.CharField(max_length=255)
    answer = RichTextUploadingField()
    sort_order = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "question"]

    def __str__(self) -> str:
        return self.question


class Testimonial(TimeStampedModel):
    name = models.CharField(max_length=120)
    location = models.CharField(max_length=120, blank=True)
    quote = models.TextField()
    avatar = models.ImageField(upload_to="testimonials/", blank=True, null=True)
    avatar_alt = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name


class PricingPlan(TimeStampedModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    summary = models.CharField(max_length=255)
    price_label = models.CharField(max_length=50)
    billing_period = models.CharField(max_length=50, blank=True)
    features = models.TextField(help_text="One feature per line.")
    cta_text = models.CharField(max_length=50, default="Get started")
    cta_url = models.CharField(max_length=255, default="/contact/")
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=100)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def feature_list(self):
        return [item.strip() for item in self.features.splitlines() if item.strip()]
