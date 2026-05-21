from ninja import NinjaAPI
from apps.accounts.api import router as accounts_router
from apps.applications.api import router as applications_router
from apps.dashboard.api import router as dashboard_router
from apps.settings_app.api import router as settings_router

api = NinjaAPI()

api.add_router("/auth/", accounts_router)
api.add_router("/applications/", applications_router)
api.add_router("/dashboard/", dashboard_router)
api.add_router("/settings/", settings_router)