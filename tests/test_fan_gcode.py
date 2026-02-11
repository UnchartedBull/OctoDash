from unittest.mock import MagicMock, call
import pytest

from octoprint_octodash import OctodashPlugin


@pytest.mark.parametrize("match, expected", [
    ((None, "255"), {"1": 100.0}),
    ((None, "0"), {"1": 0.0}),
    (("1", "255"), {"1": 100.0}),
    (("2", "0"), {"2": 0.0}),
    ((None, "210"), {"1": (int("210") / 255 * 100)}),
])
def test_fan_sending(match, expected):
    plugin = OctodashPlugin()
    plugin._plugin_manager = MagicMock()
    
    plugin.send_fan_speed(match, "code")

    plugin._plugin_manager.send_plugin_message.assert_called_once_with(
        'octodash', {'fanspeed': expected},
    )

@pytest.mark.parametrize("gcode, expected", [
    # ("M106", (None, None)),
    # ("M106 P1", (1, None)),
    ("M106 S255", (None, '255')),
    ("M106 P1 S128", ('1', '128')),
    ("M106 P2 S64", ('2', '64')),
    ("M106 P3 S0", ('3', '0')),
    ("M107", (None, '0')),
    ("M107 P1", ('1', '0')),
])
def test_good(gcode, expected):
    plugin = OctodashPlugin()

    match = plugin._run_gcode_test(gcode)
    assert match is not None, f"Expected to match: {gcode}"
    assert match == expected

@pytest.mark.parametrize("gcode", [
        "34343 M106 S255",
        "DSFM106 S255",
        "G10 F1500 E-6.5",
])
def test_bad(gcode):
    plugin = OctodashPlugin()
    match = plugin._run_gcode_test(gcode)
    assert match is None, f"Expected not to match: {gcode}"
