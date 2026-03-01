from unittest.mock import MagicMock, call
import pytest

from octoprint_octodash import OctodashPlugin


@pytest.mark.parametrize("input, group", [
    ("#this is a comment \n\nsomeothercommand\nchromium-browser --kiosk http://octopi.local", 'http://octopi.local'),
    ("chromium-browser --kiosk https://example.com", 'https://example.com'),
    ("chromium-browser --kiosk http://192.168.2.24:5000", 'http://192.168.2.24:5000'),
    ("chromium-browser --kiosk http://192.168.2.24:5000/printerb", 'http://192.168.2.24:5000/printerb'),
    ("chromium-browser --kiosk http://192.168.2.24:5000/printerb --something", 'http://192.168.2.24:5000/printerb'),
    # ("someothercommand\nchromium-browser --kiosk octopi.local", 'octopi.local'),
    # ("chromium-browser --kiosk octopi.local", "octopi.local"),
])
def test_change_regex(input, group):
    plugin = OctodashPlugin()
    match = plugin.change_instance.search(input)
    assert match is not None
    assert match.group(1) == group

@pytest.mark.parametrize("input", [
    "someothercommand\nchrsdfomium-browser --kiosk octopi.local",
    "chromium-browasdfser --kiosk octopi.local",
])
def test_change_regex_no_match(input):
    plugin = OctodashPlugin()
    match = plugin.change_instance.search(input)
    assert match is None

@pytest.mark.parametrize("input, expected", [
    ("chromium-browser --kiosk http://octopi.local someothercommand", "chromium-browser --kiosk http://new.local someothercommand"),
    # ("someothercommand\nchromium-browser --kiosk http://octopi.local", "someothercommand\nchromium-browser --kiosk http://new.local"),
])
def test_update_xinit_for_instance(input, expected):
    xinit = input
    plugin = OctodashPlugin()
    new = plugin._update_xinit_for_instance(xinit, "http://new.local")
    assert new == expected
