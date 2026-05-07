import re

from django.views.generic import DetailView, ListView

from apps.blog.models import Category, Post, Tag


class BlogListView(ListView):
    model = Post
    template_name = "blog/list.html"
    context_object_name = "posts"
    paginate_by = 6

    def get_queryset(self):
        return Post.published.live().select_related("category").prefetch_related("tags")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        all_posts = Post.published.live()
        context.update(
            {
                "meta_title": "Blog | ConsumeIT",
                "meta_description": "Insights on SEO, web development, CMS strategy, and digital growth.",
                "categories": Category.objects.all(),
                "recent_posts": all_posts[:3],
                "tags": Tag.objects.all()[:10],
            }
        )
        return context


class BlogDetailView(DetailView):
    template_name = "blog/detail.html"
    context_object_name = "post"

    def get_queryset(self):
        return Post.published.live().select_related("category").prefetch_related("tags")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        all_posts = Post.published.live()
        content_text = re.sub(r"<[^>]+>", " ", self.object.content or "")
        word_count = len(content_text.split())
        context["related_posts"] = (
            all_posts
            .exclude(pk=self.object.pk)
            .select_related("category")
            .prefetch_related("tags")[:3]
        )
        context["previous_post"] = (
            all_posts.filter(published_at__lt=self.object.published_at).first()
        )
        context["next_post"] = (
            all_posts.filter(published_at__gt=self.object.published_at).order_by("published_at").first()
        )
        context["categories"] = Category.objects.all()
        context["recent_posts"] = all_posts.exclude(pk=self.object.pk)[:3]
        context["tags"] = Tag.objects.all()[:10]
        context["reading_time"] = max(1, round(word_count / 200))
        context["meta_title"] = self.object.meta_title or self.object.title
        context["meta_description"] = self.object.meta_description or self.object.excerpt
        return context
