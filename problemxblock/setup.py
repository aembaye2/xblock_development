from setuptools import setup

setup(
    name='problem-xblock',
    version='0.1',
    description='A general-purpose problem XBlock with input and checker logic.',
    packages=['ProblemXblock'],
    install_requires=[
        'XBlock',
        'web-fragments',
    ],
    entry_points={
        'xblock.v1': [
            'problemblock = ProblemXblock2.problem:ProblemBlock',
        ]
    },
)
