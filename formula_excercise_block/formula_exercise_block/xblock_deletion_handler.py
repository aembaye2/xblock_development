import logging
try:
    from . import db_service  # relative import
except Exception:  # pragma: no cover
    db_service = None

from django.dispatch import receiver
try:  # xmodule only available inside full Open edX platform, not workbench
    from xmodule.modulestore.django import SignalHandler  # type: ignore
except ImportError:  # pragma: no cover
    SignalHandler = None

log = logging.getLogger(__name__)


if SignalHandler is not None:
    @receiver(SignalHandler.item_deleted)
    def handle_formula_exercise_xblock_deleted(sender, usage_key, user_id, **kwargs):  # noqa: D401
        """Handle deletion inside full platform (no-op in workbench)."""
        usage_key = usage_key.for_branch(None)
        if db_service is not None:
            try:
                db_service.delete_xblock(str(usage_key))
            except Exception:
                log.warning("Failed to delete xblock %s from DB (optional)", usage_key)
else:
    def handle_formula_exercise_xblock_deleted(*args, **kwargs):  # noqa: D401
        """Stub when xmodule not available (workbench)."""
        return None
