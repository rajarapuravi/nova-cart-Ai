"""
Database router: admin apps use 'admin_db', everything else uses 'default' (customer DB).
"""

ADMIN_APPS = {'admin_panel', 'analytics', 'products', 'coupons'}


class AppRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label in ADMIN_APPS:
            return 'admin_db'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label in ADMIN_APPS:
            return 'admin_db'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in ADMIN_APPS:
            return db == 'admin_db'
        return db == 'default'
