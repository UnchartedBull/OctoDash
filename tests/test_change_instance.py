from unittest.mock import MagicMock, call
import pytest

from octoprint_octodash import OctodashPlugin

@pytest.fixture
def plugin():
    plugin = OctodashPlugin()
    return plugin


@pytest.mark.parametrize("input, group", [
    ("OCTOPRINT_URL=http://localhost:5000\nchromium-browser --kiosk http://octopi.local", 'http://localhost:5000'),
    ("something\nOCTOPRINT_URL=http://localhost:5000\nchromium-browser --kiosk http://octopi.local\nsdf", 'http://localhost:5000'),
    ("OCTOPRINT_URL=https://octopi.example.com", 'https://octopi.example.com'),
    ('\nls\n\n# a commment\n\nOCTOPRINT_URL=http://localhost\n\nchromium-browser --kiosk $OCTOPRINT_URL/plugin/octodash\n\n', 'http://localhost')
])
def test_change_regex(plugin, input, group):
    match = plugin.change_instance.search(input)
    assert match is not None
    assert match.group(1) == group

@pytest.mark.parametrize("input", [
    "someothercommand\nchrsdfomium-browser --kiosk octopi.local",
    "chromium-browasdfser --kiosk octopi.local",
])
def test_change_regex_no_match(plugin, input):
    match = plugin.change_instance.search(input)
    assert match is None

@pytest.mark.parametrize("input, expected", [
    ("OCTOPRINT_URL=http://localhost:8080", "OCTOPRINT_URL=http://new.local"),
    ("someothercommand\nOCTOPRINT_URL=http://localhost:8080", "someothercommand\nOCTOPRINT_URL=http://new.local"),
    ('\nls\n\n# a commment\n\nOCTOPRINT_URL=http://localhost\n\nchromium-browser --kiosk $OCTOPRINT_URL/plugin/octodash\n\n', '\nls\n\n# a commment\n\nOCTOPRINT_URL=http://new.local\n\nchromium-browser --kiosk $OCTOPRINT_URL/plugin/octodash\n\n')
])
def test_update_xinit_for_instance(plugin, input, expected):
    xinit = input
    new = plugin._update_xinit_for_instance(xinit, "http://new.local")
    assert new == expected
