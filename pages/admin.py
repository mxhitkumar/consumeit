from django.contrib import admin

from pages.models import FAQ, HomePage, PricingPlan, Service, Testimonial


@admin.register(HomePage)
class HomePageAdmin(admin.ModelAdmin):
    list_display = ("hero_title", "updated_at")

    def has_add_permission(self, request):
        if HomePage.objects.exists():
            return False
        return super().has_add_permission(request)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "starting_price", "timeline_text", "is_featured", "sort_order")
    list_filter = ("is_featured",)
    search_fields = (
        "title",
        "hero_title",
        "short_description",
        "body",
        "who_its_for",
        "whats_included",
        "expected_results",
        "starting_price",
        "cta_note",
    )
    prepopulated_fields = {"slug": ("title",)}


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("question", "answer")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "business_name", "role", "location", "sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "business_name", "role", "location", "quote", "result_metric")


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price_label", "is_featured", "sort_order")
    list_filter = ("is_featured",)
    search_fields = ("name", "summary", "features")
    prepopulated_fields = {"slug": ("name",)}
