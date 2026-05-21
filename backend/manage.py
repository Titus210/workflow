#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    should_seed = (
        len(sys.argv) > 1
        and sys.argv[1] == 'runserver'
        and os.getenv('RUN_MAIN') != 'true'
        and os.getenv('AUTO_SEED_MOCK_DATA', 'True') == 'True'
    )

    if should_seed:
        try:
            import django
            from django.core.management import call_command

            django.setup()
            call_command('seed_mock_data')
        except Exception as exc:
            print(f"Skipping mock data seeding: {exc}", file=sys.stderr)

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
