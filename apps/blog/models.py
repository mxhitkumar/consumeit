from ckeditor_uploader.fields import RichTextUploadingField
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class Category(TimeStampedModel):
    title = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["title"]
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Tag(TimeStampedModel):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class PublishedPostQuerySet(models.QuerySet):
    def live(self):
        return self.filter(status=Post.Status.PUBLISHED, published_at__lte=timezone.now())


class Post(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField()
    content = RichTextUploadingField()
    featured_image = models.ImageField(upload_to="blog/", blank=True, null=True)
    featured_image_alt = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, related_name="posts", blank=True, null=True
    )
    tags = models.ManyToManyField(Tag, related_name="posts", blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True
    )
    published_at = models.DateTimeField(default=timezone.now, db_index=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    og_image = models.ImageField(upload_to="seo/blog/", blank=True, null=True)

    objects = models.Manager()
    published = PublishedPostQuerySet.as_manager()

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("blog:detail", kwargs={"slug": self.slug})
