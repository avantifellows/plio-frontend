from django.conf import settings
from django.core.cache import cache
from django_tenants.utils import tenant_context
from oauth2_provider.models import Application

from organizations.models import Organization
from plio.models import Plio, Video
from users.models import OrganizationUser, Role, User


Application.objects.get_or_create(
    name=settings.API_APPLICATION_NAME,
    defaults={
        "redirect_uris": "",
        "client_type": Application.CLIENT_CONFIDENTIAL,
        "authorization_grant_type": Application.GRANT_AUTHORIZATION_CODE,
    },
)

workspaces = []
for shortcode, name, api_key in (
    ("e2e", "E2E Workspace", "plio-e2e-api-key"),
    ("e2e-alt", "E2E Alternate Workspace", "plio-e2e-alt-key"),
):
    workspace, _ = Organization.objects.update_or_create(
        shortcode=shortcode,
        defaults={
            "name": name,
            "schema_name": shortcode.replace("-", "_"),
            "api_key": api_key,
            "config": {},
        },
    )
    workspaces.append(workspace)

primary = workspaces[0]
admin_role, _ = Role.objects.get_or_create(name="org-admin")

google_user, _ = User.objects.update_or_create(
    email="plio.e2e.user@gmail.com",
    defaults={"first_name": "Plio", "last_name": "E2E", "config": {}},
)
for workspace in workspaces:
    OrganizationUser.objects.update_or_create(
        user=google_user,
        organization=workspace,
        defaults={"role": admin_role, "is_owner": True},
    )

sso_user, _ = User.objects.update_or_create(
    unique_id="e2e-sso-learner",
    auth_org=primary,
    defaults={"config": {}},
)

with tenant_context(primary):
    video_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
    video = Video.objects.filter(url=video_url).first()
    if video is None:
        video = Video.objects.create(url=video_url)
    video.title = "E2E SSO Video"
    video.duration = 19
    video.save()
    Plio.objects.update_or_create(
        uuid="e2e-sso-plio",
        defaults={
            "name": "E2E SSO Plio",
            "video": video,
            "created_by": google_user,
            "status": "published",
            "is_public": True,
            "config": {},
        },
    )

cache.clear()
print(
    "Seeded e2e workspaces, Google creator memberships, SSO learner, and SSO plio."
)
