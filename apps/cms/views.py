from django.shortcuts import get_object_or_404
from django.views.generic import DetailView

from apps.cms.models import Page
from apps.pages.models import Testimonial


class PageDetailView(DetailView):
    model = Page
    context_object_name = "page"

    def get_object(self, queryset=None):
        return get_object_or_404(Page, slug=self.kwargs["slug"], is_published=True)

    def get_template_names(self):
        if self.object.slug == "about":
            return ["cms/page_about.html"]
        if self.object.slug == "contact" or self.object.template_key == Page.TEMPLATE_CONTACT:
            return ["cms/page_contact.html"]
        return ["cms/page_detail.html"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["meta_title"] = self.object.meta_title or self.object.title
        context["meta_description"] = self.object.meta_description or self.object.summary
        if self.object.slug == "about":
            context["testimonials"] = Testimonial.objects.filter(is_active=True)[:6]
        return context
