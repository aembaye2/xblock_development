"""Setup for formula_exercise_block XBlock."""

import os
from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


setup(
    name='formula-exercise-xblock',
    version='0.3.0',
    description='Formula Exercise XBlock (modernized)',
    license='LGPL-3.0',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3 :: Only',
        'License :: OSI Approved :: GNU Lesser General Public License v3 (LGPLv3)',
        'Framework :: Django',
    ],
    python_requires='>=3.8',
    keywords='xblock open edx formula exercise',
    author='Vo Duc An',
    author_email='voducanvn@gmail.com',
    packages=[
        'formula_exercise_block',
    ],
    install_requires=[
        'XBlock',
        'xblock-utils',
        'cexprtk',
    ],
    extras_require={
        'mysql': [
            'mysql-connector-python>=8.0,<9.0'
        ],
    },
    entry_points={
        'xblock.v1': [
            'formula_exercise_block = formula_exercise_block:FormulaExerciseXBlock',
        ]
    },
    package_data=package_data("formula_exercise_block", ["static", "public"]),
)
