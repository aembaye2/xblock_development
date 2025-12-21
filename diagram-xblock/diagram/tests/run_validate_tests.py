import json
import logging
import pathlib
import ast
import sys


def load_validator():
    src_path = pathlib.Path(__file__).resolve().parents[1] / "diagram.py"
    src = src_path.read_text()
    module_ast = ast.parse(src)
    func_node = None
    for node in module_ast.body:
        if isinstance(node, ast.FunctionDef) and node.name == "validate_initial_diagram":
            func_node = node
            break
    if func_node is None:
        raise RuntimeError("validate_initial_diagram not found in diagram.py")
    new_module = ast.Module(body=[func_node], type_ignores=[])
    ast.fix_missing_locations(new_module)
    code = compile(new_module, filename=str(src_path), mode="exec")
    globs = {"json": json, "logging": logging}
    locs = {}
    exec(code, globs, locs)
    return locs.get("validate_initial_diagram") or globs.get("validate_initial_diagram")


def assert_ok(cond, msg):
    if not cond:
        raise AssertionError(msg)


def make_item(i):
    return {
        "type": "circle",
        "left": str(10 * i),
        "top": 5.5 * i,
        "width": 2 * i,
        "height": 3 * i,
        "stroke": "#000",
    }


def run_tests():
    validate_initial_diagram = load_validator()

    # test valid
    items = [make_item(1), make_item(2)]
    out = validate_initial_diagram(items)
    assert_ok(isinstance(out, list), "output is not a list")
    assert_ok(len(out) == 2, "unexpected length")
    assert_ok(isinstance(out[0]["left"], float), "left not float")

    # non-list
    try:
        validate_initial_diagram({"not": "a list"})
        raise AssertionError("expected ValueError for non-list")
    except ValueError:
        pass

    # truncation
    items = [make_item(i) for i in range(1000)]
    out = validate_initial_diagram(items, max_items=10)
    assert_ok(len(out) == 10, "truncation failed")

    # size limit
    big_item = {"type": "poly", "points": ["x" * 5000]}
    try:
        validate_initial_diagram([big_item], max_bytes=10)
        raise AssertionError("expected ValueError for size limit")
    except ValueError:
        pass

    print("All tests passed")


if __name__ == '__main__':
    try:
        run_tests()
    except AssertionError as e:
        print("TEST FAILED:", e)
        sys.exit(2)
    except Exception as e:
        print("ERROR DURING TESTS:", e)
        sys.exit(3)
