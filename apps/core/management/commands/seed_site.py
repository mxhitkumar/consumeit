from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.blog.models import Category, Post, Tag
from apps.cms.models import Page
from apps.core.models import SiteSettings
from apps.pages.models import FAQ, HomePage, PricingPlan, Service, Testimonial


class Command(BaseCommand):
    help = "Seed a full starter site with SEO-friendly pages, services, pricing, FAQ, testimonials, and blog content."

    def handle(self, *args, **options):
        now = timezone.now()

        SiteSettings.objects.update_or_create(
            pk=1,
            defaults={
                "site_name": "ConsumeIT",
                "site_tagline": "SEO-first websites, automation systems, and digital growth for modern brands.",
                "site_url": "https://www.consumeit.in",
                "default_meta_title": "ConsumeIT | Web Development, SEO, AI Automation & Digital Marketing",
                "default_meta_description": (
                    "ConsumeIT helps businesses grow online with high-performance websites, "
                    "technical SEO, content systems, paid media support, and AI automation."
                ),
                "contact_email": "consumeit.services@gmail.com",
                "contact_phone": "+91 99999 99999",
                "address": "Rohtak, Haryana, India",
                "x_handle": "@consumeitx",
                "linkedin_url": "https://www.linkedin.com/company/consumeit",
                "instagram_url": "https://www.instagram.com/consumeit",
                "facebook_url": "https://www.facebook.com/consumeit",
            },
        )

        HomePage.objects.update_or_create(
            pk=1,
            defaults={
                "hero_title": "Turn visibility into qualified leads.",
                "hero_subtitle": (
                    "ConsumeIT builds search-ready websites, conversion-focused service pages, "
                    "and automation workflows that help businesses get discovered and grow faster."
                ),
                "primary_cta_text": "Get in touch",
                "primary_cta_url": "/contact/",
                "secondary_cta_text": "Read the blog",
                "secondary_cta_url": "/blog/",
                "intro_title": "A digital growth foundation built to rank, convert, and scale",
                "intro_text": (
                    "We combine technical web delivery, SEO structure, content planning, "
                    "and automation to help service businesses earn more organic visibility."
                ),
                "meta_title": "ConsumeIT | SEO-Ready Websites, AI Automation, and Growth Marketing",
                "meta_description": (
                    "Launch a faster digital growth engine with ConsumeIT. We build modern websites, "
                    "SEO foundations, automation workflows, and content systems that improve discoverability."
                ),
            },
        )

        pages = [
            {
                "slug": "about",
                "title": "About Us",
                "menu_title": "About",
                "hero_title": "About ConsumeIT",
                "summary": "A digital growth partner focused on websites, SEO systems, and repeatable visibility.",
                "body": """
                    <h2>Why businesses work with ConsumeIT</h2>
                    <p>We help service businesses and creators move beyond brochure sites into scalable digital systems with measurable visibility.</p>
                    <ul>
                        <li>SEO-ready site architecture and conversion-focused page structure</li>
                        <li>Admin-managed content workflows for landing pages, blog publishing, and FAQs</li>
                        <li>Automation support for lead handling, reporting, and repetitive ops</li>
                    </ul>
                    <p>Our delivery focus is simple: make it easier for the right customers to find you, trust you, and contact you.</p>
                """,
                "meta_title": "About ConsumeIT | Web, SEO, and Automation Partner",
                "meta_description": (
                    "Learn how ConsumeIT helps businesses improve search visibility, website performance, and lead generation with modern digital systems."
                ),
                "show_in_navigation": True,
                "sort_order": 10,
            },
            {
                "slug": "contact",
                "title": "Contact",
                "menu_title": "Contact",
                "hero_title": "Talk to ConsumeIT",
                "summary": "Discuss web development, SEO, automation, paid ads, or content growth with our team.",
                "template_key": Page.TEMPLATE_CONTACT,
                "body": """
                    <h2>Let us scope the right growth setup</h2>
                    <p>Share your current site, growth goals, and what is slowing visibility today. We can help with website rebuilds, technical SEO, landing pages, automation, and content operations.</p>
                    <p>Most conversations start with traffic quality, poor lead conversion, or content systems that are too hard to maintain.</p>
                """,
                "meta_title": "Contact ConsumeIT | Start Your Website or SEO Project",
                "meta_description": (
                    "Contact ConsumeIT for help with websites, SEO strategy, automation workflows, paid ads, and digital growth planning."
                ),
                "show_in_navigation": True,
                "sort_order": 20,
            },
        ]
        for page_data in pages:
            Page.objects.update_or_create(slug=page_data["slug"], defaults=page_data)

        services = [
            {
                "slug": "web-development",
                "title": "Web Development",
                "hero_title": "Build a site that performs like part of your sales team",
                "hero_subtitle": "Modern websites for service businesses that need speed, clarity, and stronger lead generation.",
                "short_description": "Fast, maintainable websites and landing pages designed to improve trust, conversions, and search performance.",
                "body": """
                    <h2>What this service solves</h2>
                    <p>Many businesses outgrow static websites that are hard to update, slow to load, and weak at turning traffic into inquiries. We rebuild the experience around speed, structure, and conversion.</p>
                    <h3>What we deliver</h3>
                    <ul>
                        <li>Responsive site architecture and reusable page layouts</li>
                        <li>Conversion-focused service pages and content blocks</li>
                        <li>Technical SEO essentials, performance cleanup, and scalable CMS editing</li>
                    </ul>
                """,
                "who_its_for": "Service businesses, local brands, consultants, and teams replacing outdated brochure sites.",
                "whats_included": "Discovery and structure planning\nResponsive templates\nAdmin-managed content areas\nOn-page SEO foundations\nLaunch QA",
                "expected_results": "Faster site speed, clearer service positioning, stronger trust signals, and better inquiry conversion.",
                "timeline_text": "2 to 6 weeks",
                "starting_price": "Starting at $499",
                "cta_text": "Book a website strategy call",
                "cta_note": "Ideal when your current site looks dated, loads slowly, or is difficult to update.",
                "icon_class": "fa-solid fa-code",
                "sort_order": 10,
                "is_featured": True,
            },
            {
                "slug": "seo-strategy",
                "title": "SEO Strategy",
                "hero_title": "Grow search visibility with cleaner technical and content foundations",
                "hero_subtitle": "SEO planning built for discoverability, relevance, and long-term content velocity.",
                "short_description": "Technical SEO, on-page optimization, metadata planning, and content structure designed to improve organic reach.",
                "body": """
                    <h2>What this service solves</h2>
                    <p>Ranking issues often come from weak structure, inconsistent metadata, poor internal linking, and content that does not match search intent. We fix the foundations first.</p>
                    <h3>What we deliver</h3>
                    <ul>
                        <li>Keyword themes and content opportunity mapping</li>
                        <li>Metadata, heading structure, internal linking, and crawl-readiness review</li>
                        <li>Page-level recommendations aligned to business intent and conversion goals</li>
                    </ul>
                """,
                "who_its_for": "Businesses that want more qualified organic traffic from service, location, and educational search intent.",
                "whats_included": "Technical audit\nKeyword mapping\nMetadata recommendations\nSEO content briefs\nReporting priorities",
                "expected_results": "Improved crawl quality, clearer relevance signals, and stronger growth potential across priority pages.",
                "timeline_text": "2 to 4 weeks",
                "starting_price": "Starting at $299",
                "cta_text": "Get an SEO visibility audit",
                "cta_note": "Best for businesses that publish irregularly or have traffic but poor lead quality.",
                "icon_class": "fa-solid fa-magnifying-glass-chart",
                "sort_order": 20,
                "is_featured": True,
            },
            {
                "slug": "ai-automation",
                "title": "AI Automation",
                "hero_title": "Reduce manual ops and make your workflows easier to scale",
                "hero_subtitle": "Automation support for lead routing, content operations, reporting, and repetitive back-office work.",
                "short_description": "Workflow automation that removes repetitive tasks, improves response time, and keeps growth systems moving.",
                "body": """
                    <h2>What this service solves</h2>
                    <p>Teams lose time to manual follow-up, copy-paste reporting, and disconnected tools. We identify repeatable tasks and turn them into dependable automated flows.</p>
                    <h3>What we deliver</h3>
                    <ul>
                        <li>Lead capture and routing workflows</li>
                        <li>Internal automation for notifications, reporting, and publishing support</li>
                        <li>AI-assisted workflows that still preserve human review where it matters</li>
                    </ul>
                """,
                "who_its_for": "Teams that want faster lead handling, cleaner handoffs, and less repetitive admin work.",
                "whats_included": "Workflow audit\nAutomation design\nTool integration mapping\nTesting and handoff",
                "expected_results": "Faster response cycles, fewer manual steps, and more time spent on sales and delivery.",
                "timeline_text": "1 to 3 weeks",
                "starting_price": "Custom scope",
                "cta_text": "Plan an automation workflow",
                "cta_note": "Useful when growth is bottlenecked by repetitive coordination work.",
                "icon_class": "fa-solid fa-robot",
                "sort_order": 30,
                "is_featured": True,
            },
            {
                "slug": "performance-marketing",
                "title": "Performance Marketing",
                "hero_title": "Support organic growth with targeted paid acquisition",
                "hero_subtitle": "Campaign support for brands that need faster testing and stronger lead intent signals.",
                "short_description": "Paid media support across Google and social platforms to drive qualified traffic and validate offer messaging.",
                "body": """
                    <h2>What this service solves</h2>
                    <p>Paid acquisition underperforms when campaigns and landing pages are disconnected. We align traffic, offer, and page messaging to improve efficiency.</p>
                    <h3>What we deliver</h3>
                    <ul>
                        <li>Campaign setup and audience planning</li>
                        <li>Landing page alignment with ads and offers</li>
                        <li>Tracking priorities for lead quality and conversion review</li>
                    </ul>
                """,
                "who_its_for": "Businesses validating offers, testing markets, or accelerating lead acquisition alongside SEO.",
                "whats_included": "Offer review\nCampaign planning\nLanding page alignment\nMeasurement setup",
                "expected_results": "Faster learning loops, stronger targeting, and better clarity on what messaging converts.",
                "timeline_text": "1 to 2 weeks",
                "starting_price": "Custom monthly retainer",
                "cta_text": "Discuss ad strategy",
                "cta_note": "Best paired with a clear service offer and a focused landing page.",
                "icon_class": "fa-solid fa-bullhorn",
                "sort_order": 40,
                "is_featured": False,
            },
        ]
        for service_data in services:
            Service.objects.update_or_create(slug=service_data["slug"], defaults=service_data)

        faq_items = [
            (
                "Can you redesign an existing site without losing SEO value?",
                "<p>Yes. We preserve important URLs where possible, audit metadata, and carry forward search-critical structure so a redesign does not erase existing visibility.</p>",
                10,
            ),
            (
                "Do you help with both the website and the content strategy?",
                "<p>Yes. The strongest results usually come from pairing site structure, service messaging, FAQs, and blog content with a consistent SEO plan.</p>",
                20,
            ),
            (
                "Will our team be able to update pages without a developer?",
                "<p>Yes. The site is structured around Django admin so you can update services, pages, FAQs, pricing, and blog posts without editing code.</p>",
                30,
            ),
            (
                "How long does it take to see SEO improvements?",
                "<p>Technical cleanup can help quickly, but meaningful growth usually compounds over time as content, internal linking, and authority improve.</p>",
                40,
            ),
            (
                "What kind of businesses benefit most from automation work?",
                "<p>Teams with repetitive lead follow-up, reporting, client onboarding, or publishing tasks usually gain the most from workflow automation.</p>",
                50,
            ),
            (
                "Can you support local businesses that need visibility in a city or region?",
                "<p>Yes. We can shape service pages, local content, and metadata around regional intent so customers can find you more easily.</p>",
                60,
            ),
        ]
        for question, answer, sort_order in faq_items:
            FAQ.objects.update_or_create(
                question=question,
                defaults={"answer": answer, "sort_order": sort_order, "is_active": True},
            )

        plans = [
            {
                "slug": "business-owner-starter-plan",
                "name": "Business Owner Starter Plan",
                "summary": "A launch-ready digital foundation for service businesses that need a credible online presence fast.",
                "price_label": "Starting at $499",
                "billing_period": "one-time",
                "features": "Professional website setup\nCore service pages\nSEO-ready metadata\n30 days support\nLead capture setup",
                "cta_text": "Start your build",
                "cta_url": "/contact/",
                "is_featured": False,
                "sort_order": 10,
            },
            {
                "slug": "content-creation-starter-plan",
                "name": "Content Creation Starter Plan",
                "summary": "A practical setup for creators and personal brands that need content systems, visibility, and publishing consistency.",
                "price_label": "Starting at $399",
                "billing_period": "monthly",
                "features": "Channel setup guidance\nContent workflow support\nSEO-friendly publishing structure\nBasic automation help\nMonthly planning",
                "cta_text": "Launch creator setup",
                "cta_url": "/contact/",
                "is_featured": True,
                "sort_order": 20,
            },
            {
                "slug": "growth-retainer",
                "name": "Growth Retainer",
                "summary": "Ongoing support for SEO, landing pages, automation, reporting, and digital growth operations.",
                "price_label": "Custom",
                "billing_period": "monthly",
                "features": "Monthly SEO priorities\nPage improvements\nBlog and content support\nAutomation tuning\nPerformance reviews",
                "cta_text": "Talk about retainers",
                "cta_url": "/contact/",
                "is_featured": False,
                "sort_order": 30,
            },
        ]
        for plan_data in plans:
            PricingPlan.objects.update_or_create(slug=plan_data["slug"], defaults=plan_data)

        testimonials = [
            {
                "name": "Ujjawal Tiyagi",
                "business_name": "Regional Service Brand",
                "role": "Founder",
                "location": "Hisar, Haryana",
                "result_metric": "Faster launch with clearer positioning",
                "quote": "Professional execution, on-time delivery, and strong communication throughout the project.",
                "sort_order": 10,
            },
            {
                "name": "Rajat",
                "business_name": "Local Growth Team",
                "role": "Operations Lead",
                "location": "Rohtak, Haryana",
                "result_metric": "Better structure for content and lead capture",
                "quote": "Fast turnaround without sacrificing quality, which made the entire rollout easier to trust.",
                "sort_order": 20,
            },
            {
                "name": "Sharukh",
                "business_name": "Creator Brand",
                "role": "Content Creator",
                "location": "Panipat, Haryana",
                "result_metric": "Cleaner content workflow and delivery support",
                "quote": "Clear updates, dependable delivery, and a polished final result that felt ready to use.",
                "sort_order": 30,
            },
        ]
        for testimonial_data in testimonials:
            Testimonial.objects.update_or_create(
                name=testimonial_data["name"], defaults=testimonial_data | {"is_active": True}
            )

        categories = [
            {
                "slug": "seo",
                "title": "SEO",
                "description": "Search visibility, technical SEO, on-page strategy, and ranking growth.",
            },
            {
                "slug": "web-development",
                "title": "Web Development",
                "description": "Website architecture, performance, CMS workflows, and conversion-focused builds.",
            },
            {
                "slug": "automation",
                "title": "Automation",
                "description": "AI-assisted workflows, reporting systems, and operational efficiency.",
            },
            {
                "slug": "content-marketing",
                "title": "Content Marketing",
                "description": "Content systems, editorial planning, and discoverability through publishing.",
            },
        ]
        category_map = {}
        for category_data in categories:
            category, _ = Category.objects.update_or_create(
                slug=category_data["slug"], defaults=category_data
            )
            category_map[category.slug] = category

        tags = [
            {"slug": "django", "name": "Django"},
            {"slug": "technical-seo", "name": "Technical SEO"},
            {"slug": "local-seo", "name": "Local SEO"},
            {"slug": "automation", "name": "Automation"},
            {"slug": "content-strategy", "name": "Content Strategy"},
            {"slug": "website-speed", "name": "Website Speed"},
            {"slug": "lead-generation", "name": "Lead Generation"},
        ]
        tag_map = {}
        for tag_data in tags:
            tag, _ = Tag.objects.update_or_create(slug=tag_data["slug"], defaults=tag_data)
            tag_map[tag.slug] = tag

        posts = [
            {
                "slug": "why-static-sites-stall-growth",
                "title": "Why Static Marketing Sites Stall Growth",
                "excerpt": "Static sites often slow down content velocity, SEO maintenance, and campaign launch speed as a business grows.",
                "content": """
                    <p>A static brochure site can look polished at launch but become restrictive once teams need frequent updates, campaign pages, and better search coverage.</p>
                    <h3>Where the friction shows up</h3>
                    <ul>
                        <li>New pages take too long to publish</li>
                        <li>Metadata and internal links become inconsistent</li>
                        <li>Non-technical teams depend on developers for simple edits</li>
                    </ul>
                    <p>Moving to a structured CMS-backed setup makes content operations faster and strengthens search fundamentals at the same time.</p>
                """,
                "category": category_map["web-development"],
                "tags": ["django", "content-strategy", "lead-generation"],
                "published_at": now - timedelta(days=21),
                "meta_title": "Why Static Sites Stall Growth | ConsumeIT Blog",
                "meta_description": "See why static marketing sites make SEO, publishing, and lead generation harder as your business grows.",
            },
            {
                "slug": "technical-seo-basics-for-service-businesses",
                "title": "Technical SEO Basics for Service Businesses",
                "excerpt": "Technical SEO is often the difference between a site that gets discovered and one that stays invisible.",
                "content": """
                    <p>Before content can perform, search engines need clean signals. Technical SEO creates those signals through crawlability, metadata quality, page speed, and internal linking.</p>
                    <h3>Start with these priorities</h3>
                    <ul>
                        <li>Clear page titles and descriptions aligned to intent</li>
                        <li>Fast-loading pages on mobile and desktop</li>
                        <li>Logical URLs, headings, and internal links between related services</li>
                    </ul>
                    <p>Small technical improvements often create the conditions for much larger content gains later.</p>
                """,
                "category": category_map["seo"],
                "tags": ["technical-seo", "website-speed", "lead-generation"],
                "published_at": now - timedelta(days=14),
                "meta_title": "Technical SEO Basics for Service Businesses | ConsumeIT",
                "meta_description": "Learn the technical SEO basics that help service businesses improve crawlability, relevance, and organic visibility.",
            },
            {
                "slug": "local-seo-signals-that-help-customers-find-you",
                "title": "Local SEO Signals That Help Customers Find You",
                "excerpt": "Local visibility improves when your site, service pages, and business information tell a consistent geographic story.",
                "content": """
                    <p>Local SEO is not only about profiles and directories. Your own site needs to reinforce location relevance through page copy, service targeting, and contact information.</p>
                    <h3>Important local signals</h3>
                    <ul>
                        <li>Location-aware service page copy</li>
                        <li>Consistent contact details and regional references</li>
                        <li>Supporting FAQs and blog content tied to real customer intent</li>
                    </ul>
                    <p>The more clearly your site reflects the markets you serve, the easier it is for customers and search engines to understand your relevance.</p>
                """,
                "category": category_map["seo"],
                "tags": ["local-seo", "content-strategy", "lead-generation"],
                "published_at": now - timedelta(days=7),
                "meta_title": "Local SEO Signals That Help Customers Find You | ConsumeIT",
                "meta_description": "Improve local search visibility with stronger service pages, consistent contact details, and location-aware content.",
            },
            {
                "slug": "where-ai-automation-actually-saves-time",
                "title": "Where AI Automation Actually Saves Time",
                "excerpt": "Automation works best when it targets repetitive operational tasks instead of trying to replace every human decision.",
                "content": """
                    <p>Good automation removes friction from repeatable work such as lead routing, reporting prep, notifications, and publishing support.</p>
                    <h3>High-value automation opportunities</h3>
                    <ul>
                        <li>Lead intake and follow-up handoffs</li>
                        <li>Recurring report assembly and alerts</li>
                        <li>Content workflow support between tools and teams</li>
                    </ul>
                    <p>The best results usually come from narrowing the scope, testing one repeatable workflow, and then expanding carefully.</p>
                """,
                "category": category_map["automation"],
                "tags": ["automation", "content-strategy"],
                "published_at": now - timedelta(days=3),
                "meta_title": "Where AI Automation Actually Saves Time | ConsumeIT",
                "meta_description": "Explore the workflows where AI automation can reduce repetitive work and improve team efficiency.",
            },
        ]

        for post_data in posts:
            tag_slugs = post_data.pop("tags")
            post, _ = Post.objects.update_or_create(slug=post_data["slug"], defaults=post_data | {"status": Post.Status.PUBLISHED})
            post.tags.set([tag_map[slug] for slug in tag_slugs])

        self.stdout.write(self.style.SUCCESS("Starter content seeded successfully."))
