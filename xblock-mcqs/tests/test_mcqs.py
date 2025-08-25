import importlib
import sys
import types


def make_fake_xblock_environment():
    """Create minimal fake xblock modules required to import mcqs.py."""
    # xblock.core
    core = types.ModuleType('xblock.core')

    def json_handler(fn):
        return fn

    class XBlock(object):
        pass

    # attach decorator after class definition
    XBlock.json_handler = staticmethod(json_handler)
    core.XBlock = XBlock

    # xblock.fields with descriptor-based Field and Scope
    fields = types.ModuleType('xblock.fields')

    class Scope:
        content = 'content'
        settings = 'settings'
        user_state = 'user_state'

    class Field:
        def __init__(self, default=None, **kwargs):
            self.default = default
            self.kwargs = kwargs
            self.name = None

        def __set_name__(self, owner, name):
            self.name = name

        def __get__(self, instance, owner):
            if instance is None:
                return self
            storage = instance.__dict__.setdefault('_field_values', {})
            return storage.get(self.name, self.default)

        def __set__(self, instance, value):
            storage = instance.__dict__.setdefault('_field_values', {})
            storage[self.name] = value

    # expose field factory names
    def _make_field(default=None, **kwargs):
        return Field(default=default, **kwargs)

    fields.Scope = Scope
    for name in ('Integer', 'String', 'List', 'Boolean', 'Float'):
        setattr(fields, name, _make_field)

    # xblock.fragment
    fragment = types.ModuleType('xblock.fragment')

    class Fragment:
        def __init__(self, content=''):
            self.content = content

        def add_content(self, s):
            self.content += s

        def add_css(self, s):
            pass

        def add_javascript(self, s):
            pass

        def initialize_js(self, name, data=None):
            pass

    fragment.Fragment = Fragment

    # xblock.scorable
    scorable = types.ModuleType('xblock.scorable')

    class Score:
        def __init__(self, raw_earned=0.0, raw_possible=1.0):
            self.raw_earned = raw_earned
            self.raw_possible = raw_possible

    class ScorableXBlockMixin:
        def _publish_grade(self, score, only_if_higher=None):
            # no-op for tests
            self._published = (score, only_if_higher)

    scorable.Score = Score
    scorable.ScorableXBlockMixin = ScorableXBlockMixin

    # xblock.validation
    validation = types.ModuleType('xblock.validation')

    class ValidationMessage:
        ERROR = 'error'

        def __init__(self, level, message):
            self.level = level
            self.message = message

    validation.ValidationMessage = ValidationMessage

    # Insert into sys.modules
    sys.modules['xblock'] = types.ModuleType('xblock')
    sys.modules['xblock.core'] = core
    sys.modules['xblock.fields'] = fields
    sys.modules['xblock.fragment'] = fragment
    sys.modules['xblock.scorable'] = scorable
    sys.modules['xblock.validation'] = validation

    # xblockutils.studio_editable stub
    xu = types.ModuleType('xblockutils')
    xu_sub = types.ModuleType('xblockutils.studio_editable')

    class StudioEditableXBlockMixin(object):
        pass

    xu_sub.StudioEditableXBlockMixin = StudioEditableXBlockMixin
    sys.modules['xblockutils'] = xu
    sys.modules['xblockutils.studio_editable'] = xu_sub

    # minimal django.template stub
    django_template = types.ModuleType('django.template')

    class Template:
        def __init__(self, s=''):
            self.s = s

        def render(self, context):
            # naive rendering for tests: if context provides 'self', return empty question
            return ''

    class Context(dict):
        pass

    django_template.Template = Template
    django_template.Context = Context
    sys.modules['django.template'] = django_template


def test_check_answer_correct_and_score():
    make_fake_xblock_environment()
    # ensure local package is importable
    import os
    pkg_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if pkg_dir not in sys.path:
        sys.path.insert(0, pkg_dir)
    mcqs = importlib.import_module('mcqs.mcqs')
    McqsXBlock = getattr(mcqs, 'McqsXBlock')
    blk = McqsXBlock()
    # Set up a scenario where correct_choice is 2
    blk.correct_choice = 2
    res = blk.check_answer({'ans': 2})
    assert res.get('correct') is True
    score = blk.get_score()
    assert score.raw_earned == 1.0


def test_check_answer_incorrect_and_publish():
    make_fake_xblock_environment()
    import os
    pkg_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if pkg_dir not in sys.path:
        sys.path.insert(0, pkg_dir)
    mcqs = importlib.import_module('mcqs.mcqs')
    McqsXBlock = getattr(mcqs, 'McqsXBlock')
    blk = McqsXBlock()
    blk.correct_choice = 3
    res = blk.check_answer({'ans': 1})
    assert res.get('correct') is not True
    score = blk.get_score()
    assert score.raw_earned == 0.0
