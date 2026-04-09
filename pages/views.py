from django.views.generic import DetailView, TemplateView

from blog.models import Post
from pages.models import FAQ, HomePage, PricingPlan, Service, Testimonial


class HomeView(TemplateView):
    template_name = "pages/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        homepage = HomePage.objects.order_by("pk").first()
        context.update(
            {
                "homepage": homepage,
                "services": Service.objects.all()[:6],
                "testimonials": Testimonial.objects.filter(is_active=True)[:6],
                "plans": PricingPlan.objects.all()[:3],
                "latest_posts": Post.published.live()[:3],
                "meta_title": getattr(homepage, "meta_title", "") or None,
                "meta_description": getattr(homepage, "meta_description", "") or None,
            }
        )
        return context


class ServiceListView(TemplateView):
    template_name = "pages/service_list.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "services": Service.objects.all(),
                "meta_title": "Services | ConsumeIT",
                "meta_description": (
                    "Explore web development, SEO, automation, and digital growth services."
                ),
            }
        )
        return context


class ServiceDetailView(DetailView):
    model = Service
    template_name = "pages/service_detail.html"
    context_object_name = "service"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "meta_title": f"{self.object.title} | ConsumeIT Services",
                "meta_description": self.object.short_description,
            }
        )
        return context


class FAQView(TemplateView):
    template_name = "pages/faq.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "faqs": FAQ.objects.filter(is_active=True),
                "meta_title": "FAQ | ConsumeIT",
                "meta_description": "Answers to common questions about our delivery model and services.",
            }
        )
        return context


class PricingView(TemplateView):
    template_name = "pages/pricing.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "plans": PricingPlan.objects.all(),
                "meta_title": "Pricing | ConsumeIT",
                "meta_description": "Starter website, SEO, and content plans for growing businesses.",
            }
        )
        return context
