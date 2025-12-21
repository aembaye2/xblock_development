import sys
import os

if __name__ == "__main__":
    if os.environ.get('DJANGO_SETTINGS_MODULE') is None:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'settings.base'
    if 'test' in sys.argv[0:3]:
        # Catch warnings in tests and redirect them to be handled by the test runner. Otherwise build results are too
        # noisy to be of much use.
        import logging

        logging.captureWarnings(True)
        sys.argv.append('--noinput')
        sys.argv.append('--logging-clear-handlers')

    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
