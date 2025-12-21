"""Setup for inline-input xblock"""

import os
from setuptools import setup


def package_data(pkg, root):
    """Generic function to find package_data for `pkg` under `root`."""
    data = []
    for dirname, _, files in os.walk(os.path.join(pkg, root)):
        for fname in files:
            data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


setup(
    name='xblock-inline-text-and-dropdown',
    version='0.0.4',
    description='Inline Text and Dropdown XBlock',
    packages=[
        'inline_text_and_dropdown',
    ],
    install_requires=[
        'XBlock',
    ],
    entry_points={
        'xblock.v1': [
            'inline-text-and-dropdown = inline_text_and_dropdown:InlineTextAndDropdownXBlock',
        ]
    },
    package_data=package_data("inline_text_and_dropdown", "static"),
)
