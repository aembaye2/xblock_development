from setuptools import setup, find_packages

setup(
    name='mcxblock',
    version='0.1',
    description='Multiple Choice XBlock (packaged)',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'XBlock',
        'web-fragments',
        'xblock-utils'
    ],
    entry_points={
        'xblock.v1': [
            'mcxblock = mcxblock.mcxblock:MCXBlock',
        ]
    }
)
