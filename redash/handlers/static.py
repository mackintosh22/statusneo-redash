from flask import render_template, send_file, url_for
from flask_login import current_user, login_required
from werkzeug.utils import safe_join

from redash import settings
from redash.authentication import login_manager
from redash.handlers import routes
from redash.handlers.authentication import base_href
from redash.handlers.base import org_scoped_rule
from redash.security import csp_allows_embeding


def render_index():
    if settings.MULTI_ORG:
        response = render_template("multi_org.html", base_href=base_href())
    else:
        full_path = safe_join(settings.STATIC_ASSETS_PATH, "index.html")
        response = send_file(full_path, **dict(max_age=0, conditional=True))

    return response


def render_landing(org_slug=None):
    """Public StatusNeo Insights landing page.

    `base` is the application root ("/" or "/<org_slug>/") so every link on the
    page keeps working in both single-org and multi-org deployments.
    """
    base = url_for("redash.index", org_slug=org_slug)
    return render_template("landing.html", base=base)


@routes.route(org_scoped_rule("/dashboard/<slug>"), methods=["GET"])
@login_required
@csp_allows_embeding
def dashboard(slug, org_slug=None):
    return render_index()


@routes.route(org_scoped_rule("/welcome"), methods=["GET"])
def welcome(org_slug=None):
    # Always public, also reachable by signed-in users who want the landing page.
    return render_landing(org_slug)


@routes.route(org_scoped_rule("/<path:path>"))
@routes.route(org_scoped_rule("/"))
def index(**kwargs):
    if current_user.is_authenticated:
        return render_index()

    # Signed-out visitors see the landing page at the root; every other
    # app URL keeps the original behaviour (redirect to /login?next=...).
    if "path" not in kwargs:
        return render_landing(kwargs.get("org_slug"))

    return login_manager.unauthorized()
