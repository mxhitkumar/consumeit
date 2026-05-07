from apps.cms.models import Page
from apps.core.models import SiteSettings


def global_site_context(request):
    site_settings = SiteSettings.objects.order_by("pk").first() or SiteSettings()
    menu_pages = Page.objects.filter(is_published=True, show_in_navigation=True).order_by(
        "sort_order", "title"
    )
    return {
        "site_settings": site_settings,
        "menu_pages": menu_pages,
    }
