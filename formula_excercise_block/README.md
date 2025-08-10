# Formula Exercise XBlock
## Introduction
Formula Exercise XBlock (FEX) lets course authors define dynamic, parameterized math (or science) problems whose variable values are generated at runtime and whose expressions are automatically evaluated for correctness when a learner submits answers.

Recent modernization highlights:
* Python 3 only (tested with 3.12).
* Optional submissions + MySQL services (block still works if unavailable).
* ScorableXBlockMixin integration (grades reported without SubmittingXBlockMixin).
* Per‑expression and overall Correct / Incorrect feedback after each submission.
* Deprecated template API replaced (render_django_template).
* Defensive fixes around cexprtk formula evaluation.

## Exercise definition
We create an exercise in the studio by defining the following information: a question template, variables and expressions.
  1. Question template: A question template represents the content of a question. It contains placeholders for variables whose values are generated at runtime. A variable placeholder takes the form of <variable_name> in which "variable_name" is the name of a variable defined in the "Variables" session.
  2. Variables: A question can contain a set of variables. A variable is defined by name, value range (i.e., min, max), type. The variable value is generated at runtime within the value range. 
  3. Expressions: An expression is a mathematical formula which can be composed of a set of (pre-defined) variables, operators (e.g., +, -, sin, cos, ...) and well-known constants (e.g., pi). An expression is defined by name, formula, type and decimal places.
  
## Exercise generation
Based on the question template, variables and expressions, FEX generates a question to be displayed in the student view. FEX takes the question template then generates the variable values to replace the variable placeholders. In addition, it also generates a textfields for expressions.

## Answer evaluation
The user answers a question by filling in the expression textfields. On submit the block:
1. Rehydrates (serialized) variable / expression metadata.
2. Uses cexprtk [1] to evaluate each canonical expression.
3. Compares each submitted value (int or float with configured decimal precision) to the computed value (comparison via an almost-equal helper for floats).
4. Assigns 1/0 per expression and full points only if all expressions are correct.
5. Returns JSON including:
  - point_string
  - expression_results: { expression_name: 0|1 }
  - overall_feedback: "Correct!" or "Incorrect." (any wrong => Incorrect)
  - attempt_number / submit_disabled

Front-end JS adds inline span elements after each expression row plus an overall feedback div.

### Partial credit
Currently full credit is all-or-nothing. To implement partial credit, adjust the points_earned logic in `student_submit` to sum expression weights and update score publishing accordingly.

## Exercise definition example
The following three images show the graphical user interface (GUI) for creating an exercise. The GUI consists of two tabs: General Information and Template. The user inputs common XBlock information in the General Information tab and question related information in the Template tab.

![General Information tab](https://github.com/anvd/formula_excercise_block/blob/master/doc/FEX_GI.png "General Information tab")

![Template tab (1)](https://github.com/anvd/formula_excercise_block/blob/master/doc/FEX_T1.png "Template tab (1)")

![Template tab (2)](https://github.com/anvd/formula_excercise_block/blob/master/doc/FEX_T2.png "Template tab (2)")


## References
  1. cexprtk: https://pypi.python.org/pypi/cexprtk/0.2.0

## Development

### Workbench quick start
Clone the repo and run the XBlock SDK workbench (example):
```
python xblock-sdk/manage.py runserver 0.0.0.0:8000
```
Add a FormulaExerciseXBlock scenario via the Workbench UI.

### Running tests
Legacy unittest modules live inside the package:
```
python -m unittest discover -s formula_excercise_block/formula_exercise_block -p 'test_*.py'
```
You can safely delete any stale `__pycache__` or `.pyc` files; Python regenerates them.

### Optional MySQL support
If MySQL is unavailable the block skips persistence and generates content in-memory. Enable DB features by installing the extra and configuring connection settings in `db_service.py`.

## Accessibility & UX
Feedback spans include `.fe-correct` / `.fe-incorrect` classes. Consider adding an `aria-live="polite"` region for screen reader announcement in a future iteration.

## License
See `LICENSE` file.
