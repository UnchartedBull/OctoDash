
from setuptools.command.build_py import build_py
import subprocess

class NpmBuild(build_py):
# Run npm install and npm run build

    user_options = build_py.user_options + [
        ("build-ui", None, "Build UI using npm"),
    ]

    def initialize_options(self):
        super().initialize_options()
        self.build_ui = False

    def finalize_options(self):
        super().finalize_options()

    def run(self):
        if self.build_ui:
            print("Building UI...")
            self.run_npm_build()

        super().run()

    def run_npm_build(self):
        try:
            subprocess.check_call(["npm", "ci"])
            subprocess.check_call(["npm", "run", "build"])
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Error during npm build: {e}")