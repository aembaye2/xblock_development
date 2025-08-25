# Minimal stub package to satisfy imports of `done` XBlock in the workbench
from types import SimpleNamespace

class DoneXBlock:
    def __init__(self, *args, **kwargs):
        pass

# provide a simple alias used by other code
Done = DoneXBlock
