"""Formula Exercise XBlock (modernized for Python 3 & optional MySQL)."""

import json
import pkg_resources
from xblock.core import XBlock
from xblock.fields import Scope, JSONField, Integer, String, Boolean, Float
from xblock.fragment import Fragment
from xblock.exceptions import JsonHandlerError
from xblock.validation import Validation
from xblockutils.studio_editable import StudioEditableXBlockMixin, FutureFields
from xblockutils.resources import ResourceLoader
from xblock.scorable import ScorableXBlockMixin, Score

try:  # submissions service optional (workbench may not have it)
    from submissions import api as sub_api
except ImportError:
    sub_api = None

from . import question_service  # noqa: E402
from . import db_service  # noqa: E402
from . import formula_service  # noqa: E402
try:
    import xblock_deletion_handler  # noqa: F401  (optional side-effects)
except Exception:  # pragma: no cover
    pass

loader = ResourceLoader(__name__)


@XBlock.needs("i18n")
class FormulaExerciseXBlock(StudioEditableXBlockMixin, ScorableXBlockMixin, XBlock):
    """
    Formula Exercise XBlock
    """

    display_name = String(
        display_name="Formula Exercise XBlock",
        help="This name appears in the horizontal navigation at the top of the page.",
        scope=Scope.settings,
        default="Formula Exercise XBlock"
    )

    max_attempts = Integer(
        display_name="Maximum Attempts",
        help="Defines the number of times a student can try to answer this problem.",
        default=1,
        values={"min": 1}, scope=Scope.settings)

    max_points = Integer(
        display_name="Possible points",
        help="Defines the maximum points that the learner can earn.",
        default=1,
        scope=Scope.settings)

    show_points_earned = Boolean(
        display_name="Shows points earned",
        help="Shows points earned",
        default=True,
        scope=Scope.settings)

    show_submission_times = Boolean(
        display_name="Shows submission times",
        help="Shows submission times",
        default=True,
        scope=Scope.settings)

    show_answer = Boolean(
        display_name="Show Answer",
        help="Defines when to show the 'Show/Hide Answer' button",
        default=True,
        scope=Scope.settings)

    xblock_id = None
    newly_created_block = True

    question_template = ""
    variables = {}
    expressions = {}

    generated_question = ""
    generated_variables = {}
    submitted_expressions = {}

    attempt_number = 0
    _raw_earned = Float(default=0.0, scope=Scope.user_state)
    _raw_possible = Float(default=1.0, scope=Scope.user_state)

    editable_fields = ('display_name', 'max_attempts', 'max_points', 'show_points_earned', 'show_submission_times', 'show_answer')

    has_score = True

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        """
        The primary view of the FormulaExerciseXBlock, shown to students when viewing courses.
        """
        context = {}
        self.submitted_expressions = {}

        if self.xblock_id is None:
            self.xblock_id = str(self.location.replace(branch=None, version=None))

        if self.newly_created_block:
            try:
                self.newly_created_block = (db_service.is_block_in_db(self.xblock_id) is False)
            except Exception:
                self.newly_created_block = True

        if self.newly_created_block:
            self.question_template, self.variables, self.expressions = question_service.generate_question_template()
            try:
                db_service.create_question_template(self.xblock_id, self.question_template, self.variables, self.expressions)
            except Exception:
                pass
            self.newly_created_block = False
        else:
            self.load_data_from_dbms()

        if self.generated_question == "":
            self.generated_question, self.generated_variables = question_service.generate_question(self.question_template, self.variables)

        for expression_name, _expression_value in self.expressions.items():
            self.submitted_expressions[expression_name] = ''

        if sub_api is not None:
            submissions = sub_api.get_submissions(self.student_item_key, 1)
            if submissions:
                latest_submission = submissions[0]
                answer = latest_submission.get('answer', {})
                self.generated_question = answer.get('generated_question', self.generated_question)
                if 'variable_values' in answer:
                    try:
                        saved_generated_variables = json.loads(answer['variable_values'])
                        for var_name, var_value in saved_generated_variables.items():
                            self.generated_variables[var_name] = var_value
                    except Exception:
                        pass
                try:
                    saved_submitted_expressions = json.loads(answer['expression_values'])
                    for submitted_expr_name, submitted_expr_val in saved_submitted_expressions.items():
                        self.submitted_expressions[submitted_expr_name] = submitted_expr_val
                except Exception:
                    pass
                self.attempt_number = latest_submission.get('attempt_number', 0)
                context['disabled'] = 'disabled' if self.attempt_number >= self.max_attempts else ''
            else:
                context['disabled'] = ''
        else:
            context['disabled'] = ''

        self.serialize_data_to_context(context)

        context['attempt_number'] = self.attempt_number_string
        context['point_string'] = self.point_string
        context['question'] = self.generated_question
        context['xblock_id'] = self.xblock_id
        context['submitted_expressions'] = self.submitted_expressions
        context['show_answer'] = self.show_answer

        frag = Fragment()
        frag.content = loader.render_django_template('static/html/formula_exercise_block.html', context)
        frag.add_css(self.resource_string("static/css/formula_exercise_block.css"))
        frag.add_javascript(self.resource_string("static/js/src/formula_exercise_block.js"))
        frag.initialize_js('FormulaExerciseXBlock')
        return frag

    def studio_view(self, context):
        """
        Render a form for editing this XBlock (override the StudioEditableXBlockMixin's method)
        """
        location = self.location.replace(branch=None, version=None)
        item_id = str(location)
        if db_service.is_xblock_submitted(item_id):
            disabled_edit_fragment = Fragment()
            disabled_edit_fragment.content = loader.render_django_template('static/html/formula_exercise_disabled_studio_edit.html', {})
            disabled_edit_fragment.add_javascript(loader.load_unicode('static/js/src/formula_exercise_disabled_studio_edit.js'))
            disabled_edit_fragment.initialize_js('StudioDisabledEditXBlock')
            return disabled_edit_fragment

        fragment = Fragment()
        context = {'fields': []}
        for field_name in self.editable_fields:
            field = self.fields[field_name]
            assert field.scope in (Scope.content, Scope.settings), (
                "Only Scope.content or Scope.settings fields can be used with "
                "StudioEditableXBlockMixin. Other scopes are for user-specific data and are "
                "not generally created/configured by content authors in Studio."
            )
            field_info = self._make_field_info(field_name, field)
            if field_info is not None:
                context["fields"].append(field_info)

        self.load_data_from_dbms()
        context['question_template'] = self.question_template
        context["variables"] = self.variables
        context["expressions"] = self.expressions

        fragment.content = loader.render_django_template('static/html/formula_exercise_studio_edit.html', context)
        fragment.add_css(self.resource_string("static/css/formula_exercise_block_studio_edit.css"))
        fragment.add_javascript(loader.load_unicode('static/js/src/formula_exercise_studio_edit.js'))
        fragment.initialize_js('StudioEditableXBlockMixin')
        return fragment

    def serialize_data_to_context(self, context):
        context['saved_question_template'] = self.question_template
        context['serialized_variables'] = json.dumps(self.variables)
        context['serialized_expressions'] = json.dumps(self.expressions)
        context['serialized_generated_variables'] = json.dumps(self.generated_variables)

    def deserialize_data_from_context(self, context):
        self.question_template = context['saved_question_template']
        self.variables = json.loads(context['serialized_variables'])
        self.expressions = json.loads(context['serialized_expressions'])
        self.generated_variables = json.loads(context['serialized_generated_variables'])

    def load_data_from_dbms(self):
        if self.xblock_id is None:
            self.xblock_id = str(self.location.replace(branch=None, version=None))
        try:
            self.question_template, self.variables, self.expressions = db_service.fetch_question_template_data(self.xblock_id)
        except Exception:
            pass

    @XBlock.json_handler
    def student_submit(self, data, suffix=''):
        submitted_expression_values = json.loads(data['submitted_expression_values'])
        self.deserialize_data_from_context(data)

        formula_service_expressions = {}
        for expression_name, expression in self.expressions.items():
            formula_service_expressions[expression_name] = [expression, submitted_expression_values[expression_name]]

        formula_service_variables = {}
        for var_name, var_value in self.generated_variables.items():
            formula_service_variables[var_name] = [self.variables[var_name], var_value]

        evaluation_result = formula_service.evaluate_submission(formula_service_variables, formula_service_expressions)
        points_earned = self.max_points
        for _expr_name, point in evaluation_result.items():
            if point == 0:
                points_earned = 0
                break

        submission_data = {
            'generated_question': data['saved_generated_question'],
            'expression_values': data['submitted_expression_values'],
            'variable_values': data['serialized_generated_variables']
        }
        submission = None
        if sub_api is not None:
            submission = sub_api.create_submission(self.student_item_key, submission_data)
            sub_api.set_score(submission['uuid'], points_earned, self.max_points)

        self._raw_earned = float(points_earned)
        self._raw_possible = float(self.max_points)

        submit_result = {
            'point_string': self.point_string,
            'expression_results': evaluation_result,
            'overall_feedback': 'Correct!' if all(val == 1 for val in evaluation_result.values()) else 'Incorrect.'
        }

        if submission is not None:
            self.attempt_number = submission.get('attempt_number', self.attempt_number + 1)
        else:
            self.attempt_number += 1
        submit_result['attempt_number'] = self.attempt_number_string
        submit_result['submit_disabled'] = 'disabled' if (self.attempt_number >= self.max_attempts) else ''

        return submit_result

    @XBlock.json_handler
    def validate_expressions(self, expressions, suffix=''):
        return formula_service.check_expressions(expressions)

    @XBlock.json_handler
    def fe_submit_studio_edits(self, data, suffix=''):
        if self.xblock_id is None:
            self.xblock_id = str(self.location.replace(branch=None, version=None))

        question_template = data['question_template']
        updated_variables = data['variables']
        updated_expressions = data['expressions']
        db_service.update_question_template(self.xblock_id, question_template, updated_variables, updated_expressions)

        self.question_template = question_template
        self.variables = updated_variables
        self.expressions = updated_expressions

        values = {}
        to_reset = []
        for field_name in self.editable_fields:
            field = self.fields[field_name]
            if field_name in data['values']:
                if isinstance(field, JSONField):
                    values[field_name] = field.from_json(data['values'][field_name])
                else:
                    raise JsonHandlerError(400, "Unsupported field type: {}".format(field_name))
            elif field_name in data['defaults'] and field.is_set_on(self):
                to_reset.append(field_name)
        self.clean_studio_edits(values)
        validation = Validation(self.scope_ids.usage_id)
        preview_data = FutureFields(
            new_fields_dict=values,
            newly_removed_fields=to_reset,
            fallback_obj=self
        )
        self.validate_field_data(validation, preview_data)
        if validation:
            for field_name, value in values.items():
                setattr(self, field_name, value)
            for field_name in to_reset:
                self.fields[field_name].delete_from(self)
            return {'result': 'success'}
        else:
            raise JsonHandlerError(400, validation.to_json())

    @property
    def point_string(self):
        if self.show_points_earned:
            if sub_api is not None:
                score = sub_api.get_score(self.student_item_key)
                if score is not None:
                    return f"{score['points_earned']} / {score['points_possible']} point(s)"
            else:
                return f"{int(self._raw_earned)} / {int(self._raw_possible)} point(s)"
        return str(self.max_points) + ' point(s) possible'

    @property
    def attempt_number_string(self):
        if self.show_submission_times:
            return f"You have submitted {self.attempt_number}/{self.max_attempts} time(s)"
        return ""

    @XBlock.json_handler
    def show_answer_handler(self, data, suffix=''):
        self.deserialize_data_from_context(data)
        formula_service_variables = {}
        for var_name, var_value in self.generated_variables.items():
            formula_service_variables[var_name] = [self.variables[var_name], var_value]
        expression_values = formula_service.evaluate_expressions(formula_service_variables, self.expressions)
        return {'expression_values': expression_values}

    @staticmethod
    def workbench_scenarios():
        return [
            ("FormulaExerciseXBlock",
             """<formula_exercise_block/>
             """),
            ("Multiple FormulaExerciseXBlock",
             """<vertical_demo>
                <formula_exercise_block/>
                <formula_exercise_block/>
                <formula_exercise_block/>
                </vertical_demo>
             """),
        ]

    def has_submitted_answer(self):
        return self.attempt_number > 0

    def get_score(self):
        return Score(raw_earned=self._raw_earned, raw_possible=self._raw_possible)

    def set_score(self, score):
        self._raw_earned = float(score.raw_earned)
        self._raw_possible = float(score.raw_possible)

    def calculate_score(self):
        return Score(raw_earned=self._raw_earned, raw_possible=self._raw_possible)

    @property
    def student_item_key(self):
        location = self.location.replace(branch=None, version=None)
        return dict(
            student_id=getattr(self.runtime, 'anonymous_student_id', ''),
            course_id=str(location.course_key),
            item_id=str(location),
            item_type=self.scope_ids.block_type,
        )

