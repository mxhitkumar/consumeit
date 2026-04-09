from django.core.management.base import BaseCommand
from django.utils import timezone

from blog.models import Category, Post, Tag
from cms.models import Page
from core.models import SiteSettings
from pages.models import FAQ, HomePage, PricingPlan, Service, Testimonial


class Command(BaseCommand):
    help = "Seed starter CMS, services, pricing, FAQ, and blog content."

    def handle(self, *args, **options):
        SiteSettings.objects.get_or_create(
            pk=1,
            defaults={
                "site_name": "ConsumeIT",
                "site_tagline": "Web development, SEO, AI automation, and digital growth.",
                "site_url": "https://www.consumeit.in",
                "contact_email": "consumeit.services@gmail.com",
                "address": "Rohtak, Haryana, India",
                "x_handle": "@consumeitx",
            },
        )

        HomePage.objects.get_or_create(
            pk=1,
            defaults={
                "meta_title": "ConsumeIT | Django-ready Digital Growth Platform",
                "meta_description": (
                    "A modular Django foundation for service pages, blog content, and "
                    "admin-managed marketing operations."
                ),
            },
        )

        pages = [
            {
                "title": "About Us",
                "menu_title": "About",
                "slug": "about",
                "hero_title": "About ConsumeIT",
                "summary": "A digital growth partner focused on scalable websites and search visibility.",
                "body": """
                    <h2>What changed in the Django rebuild</h2>
                    <p>The original static site has been mapped into reusable templates, admin-managed content, and a scalable publishing workflow.</p>
                    <ul>
                        <li>Reusable layout blocks for header, footer, and SEO metadata</li>
                        <li>Structured services, FAQs, pricing plans, and testimonials</li>
                        <li>Editable CMS pages and a blog with taxonomy and pagination</li>
                    </ul>
                """,
            },
            {
                "title": "Contact",
                "menu_title": "Contact",
                "slug": "contact",
                "hero_title": "Contact Us",
                "summary": "Talk to us about redesigns, SEO migrations, and content-driven growth.",
                "template_key": Page.TEMPLATE_CONTACT,
                "body": """
                    <h2>Let us scope the right build</h2>
                    <p>Share your current site, goals, and timeline. We can turn a static marketing site into a dynamic platform with publishing workflows and better search fundamentals.</p>
                """,
            },
        ]
        for page_data in pages:
            Page.objects.get_or_create(slug=page_data["slug"], defaults=page_data | {"show_in_navigation": True})

        services = [
            (
                "Web Development",
                "web-development",
                "Fast, maintainable websites and web apps built for content teams and marketers.",
            ),
            (
                "SEO Strategy",
                "seo-strategy",
                "Technical SEO, on-page optimization, structured metadata, and crawl-ready architecture.",
            ),
            (
                "AI Automation",
                "ai-automation",
                "Workflow automation that reduces manual operations across sales and content processes.",
            ),
        ]
        for index, (title, slug, short_description) in enumerate(services, start=1):
            Service.objects.get_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "short_description": short_description,
                    "body": f"<p>{short_description}</p><p>This service entry is editable in Django admin and supports rich content, reusable URLs, and SEO-friendly page structure.</p>",
                    "sort_order": index,
                    "is_featured": True,
                },
            )

        faq_items = [
            (
                "Can you migrate an existing static site without losing design quality?",
                "<p>Yes. The goal is to preserve the visual language while replacing hardcoded content with reusable templates and database-backed content blocks.</p>",
            ),
            (
                "Will the blog and pages be editable by non-developers?",
                "<p>Yes. Pages, blog posts, FAQs, services, and pricing can all be edited in Django admin with a rich text editor.</p>",
            ),
            (
                "Do you include SEO foundations in the rebuild?",
                "<p>Yes. The project includes slug URLs, metadata fields, Open Graph tags, sitemap generation, robots.txt, and image alt text support.</p>",
            ),
        ]
        for index, (question, answer) in enumerate(faq_items, start=1):
            FAQ.objects.get_or_create(
                question=question,
                defaults={"answer": answer, "sort_order": index},
            )

        plans = [
            ("Business Owner Starter Plan", "business-owner-starter-plan", "Starting at $499", "one-time"),
            ("Content Creation Starter Plan", "content-creation-starter-plan", "Starting at $399", "monthly"),
            ("Growth Retainer", "growth-retainer", "Custom", "monthly"),
        ]
        for index, (name, slug, price, period) in enumerate(plans, start=1):
            PricingPlan.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "summary": "A focused package designed to launch and grow a service-driven business site.",
                    "price_label": price,
                    "billing_period": period,
                    "features": "Template setup\nCMS editing\nSEO metadata\nResponsive QA",
                    "sort_order": index,
                    "is_featured": index == 2,
                },
            )

        testimonials = [
            ("Ujjawal Tiyagi", "Hisar, Haryana", "Professional execution, on-time delivery, and very strong communication."),
            ("Rajat", "Rohtak, Haryana", "Fast turnaround without sacrificing quality, which made the whole project easier to trust."),
            ("Sharukh", "Panipat, Haryana", "Clear updates, dependable delivery, and a polished final result."),
        ]
        for index, (name, location, quote) in enumerate(testimonials, start=1):
            Testimonial.objects.get_or_create(
                name=name,
                defaults={"location": location, "quote": quote, "sort_order": index},
            )

        seo_category, _ = Category.objects.get_or_create(
            slug="seo",
            defaults={"title": "SEO", "description": "Search visibility and technical optimization."},
        )
        django_tag, _ = Tag.objects.get_or_create(slug="django", defaults={"name": "Django"})
        cms_tag, _ = Tag.objects.get_or_create(slug="cms", defaults={"name": "CMS"})

        post = Post.objects.get_or_create(
            slug="why-static-sites-stall-growth",
            defaults={
                "title": "Why Static Marketing Sites Stall Growth",
                "excerpt": "Static sites look fine at launch, but they slow down content velocity and SEO operations over time.",
                "content": """
                    <p>A static brochure site is hard to scale once teams need regular content updates, campaign landing pages, and SEO governance.</p>
                    <h3>What a Django rebuild solves</h3>
                    <ul>
                        <li>Reusable templates for faster launch cycles</li>
                        <li>Admin-managed content for non-technical teams</li>
                        <li>Structured metadata and clean URL patterns</li>
                    </ul>
                """,
                "category": seo_category,
                "status": Post.Status.PUBLISHED,
                "published_at": timezone.now(),
                "meta_title": "Why Static Sites Stall Growth | ConsumeIT",
                "meta_description": "A practical look at why static sites limit SEO and content operations as businesses grow.",
            },
        )[0]
        post.tags.add(django_tag, cms_tag)

        self.stdout.write(self.style.SUCCESS("Starter content is ready."))
