import json
import pytest

from drawing.drawing import validate_initial_drawing, LINE


def test_validate_accepts_full_canvas_object():
    canvas = {"version": "5.5.2", "objects": LINE.get('objects', [])}
    out = validate_initial_drawing(canvas)
    assert isinstance(out, list)
    assert len(out) == len(canvas['objects'])


def test_validate_accepts_list_of_objects():
    obj_list = LINE.get('objects', [])
    out = validate_initial_drawing(obj_list)
    assert isinstance(out, list)


def test_validate_rejects_invalid_type():
    with pytest.raises(ValueError):
        validate_initial_drawing('this-is-not-valid')


def test_validate_truncates_large_number_of_items():
    big = [LINE['objects'][0]] * 1000
    out = validate_initial_drawing(big, max_items=10)
    assert len(out) == 10
import json
import pytest
import ast
import logging
import pathlib


# Import the validate_initial_drawing function from the module source without
# executing module-level imports (which pull in external dependencies like
# web_fragments). We parse the file and compile only the function node.
src_path = pathlib.Path(__file__).resolve().parents[1] / "drawing.py"
src = src_path.read_text()
module_ast = ast.parse(src)
func_node = None
for node in module_ast.body:
    if isinstance(node, ast.FunctionDef) and node.name == "validate_initial_drawing":
        func_node = node
        break
if func_node is None:
    raise RuntimeError("validate_initial_drawing not found in drawing.py")

# Create a new module AST containing only the function and required imports
new_module = ast.Module(body=[func_node], type_ignores=[])
ast.fix_missing_locations(new_module)
code = compile(new_module, filename=str(src_path), mode="exec")
globs = {"json": json, "logging": logging}
locs = {}
exec(code, globs, locs)
validate_initial_drawing = locs.get("validate_initial_drawing") or globs.get("validate_initial_drawing")


def make_item(i):
    return {
        "type": "circle",
        "left": str(10 * i),
        "top": 5.5 * i,
        "width": 2 * i,
        "height": 3 * i,
        "stroke": "#000",
    }


def test_valid_list_sanitized():
    items = [make_item(1), make_item(2)]
    out = validate_initial_drawing(items)
    assert isinstance(out, list)
    assert len(out) == 2
    # numeric fields should be floats
    assert isinstance(out[0]["left"], float)
    assert out[0]["stroke"] == "#000"


def test_non_list_raises():
    with pytest.raises(ValueError):
        validate_initial_drawing({"not": "a list"})


def test_truncation_of_items():
    # create many items to trigger truncation
    items = [make_item(i) for i in range(1000)]
    out = validate_initial_drawing(items, max_items=10)
    assert len(out) == 10


def test_size_limit_raises():
    # Create a structure that serializes to a very large string
    big_item = {"type": "poly", "points": ["x" * 5000]}
    with pytest.raises(ValueError):
        validate_initial_drawing([big_item], max_bytes=10)
