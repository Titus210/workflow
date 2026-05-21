import random
import string
from datetime import datetime


def generate_tracking_number():
    """
    Generate a tracking number in the format: APP-YYYYMMDD-XXXXXX
    where XXXXXX is 6 random uppercase letters/digits.
    """
    today = datetime.now().strftime("%Y%m%d")
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"APP-{today}-{suffix}"