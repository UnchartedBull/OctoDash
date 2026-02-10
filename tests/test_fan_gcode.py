import unittest
from unittest.mock import MagicMock, call
from octoprint_octodash import OctodashPlugin

# class MockPluginManager:
#     messages = []

#     def send_plugin_message(self, plugin_name, message):
#         self.messages.append((plugin_name, message))


class TestFanGcode(unittest.TestCase):
    def setUp(self):
        self.plugin = OctodashPlugin()
        # self.plugin._plugin_manager = MockPluginManager()
        self.plugin._plugin_manager= MagicMock()

    def test_fan_sending(self):
        cases = [
            ((None, "255"), "code", {"1": 100.0}),
            ((None, "0"), "code", {"1": 0.0}),
            ((None, "210"), "code", {"1": (int("210") / 255 * 100)}),
        ]
        
        for gcode, direction, expected in cases:
            self.plugin.send_fan_speed(gcode, direction)
            # self.plugin._plugin_manager.send_plugin_message.assert_called_with("octodash", {
            #     "fanspeed": expected})

        self.plugin._plugin_manager.send_plugin_message.assert_has_calls(
            [call('octodash', {'fanspeed': expected}) for _, _, expected in cases]
        )


    # def test_good(self):
    #     suites = [
    #         # ("M106", (None, None)),
    #         # ("M106 P1", (1, None)),
    #         # ("M106 S255", (None, '255')),
    #         # ("M106 P1 S128", ('1', '128')),
    #         # ("M106 P2 S64", ('2', '64')),
    #         # ("M106 P3 S0", ('3', '0')),
    #         # ("M107", (None, '')),
    #         # ("M107 P1", ('1', '')),
    #     ]
    #     for gcode, expected in suites:
    #       match = self.plugin._run_gcode_test(gcode)
    #       self.assertIsNotNone(match, f"Expected to match: {gcode}")
    #       self.assertEqual(match, expected)

    # def test_bad(self):
    #     bad_gcodes = [
    #         "34343 M106 S255",
    #         "DSFM106 S255",
    #         "G10 F1500 E-6.5",
    #     ]
    #     for gcode in bad_gcodes:
    #       match = self.plugin._run_gcode_test(gcode)
    #       self.assertIsNone(match)
