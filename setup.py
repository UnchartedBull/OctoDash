import os
import setuptools


def get_version_and_cmdclass(pkg_path):
    import os
    from importlib.util import module_from_spec, spec_from_file_location

    spec = spec_from_file_location("version", os.path.join(pkg_path, "_version.py"))
    module = module_from_spec(spec)
    spec.loader.exec_module(module)

    data = module.get_data()
    return data["version"], module.get_cmdclass(pkg_path)


def get_cmdclass(cmdclass):
    # from setuptools.command.build_py import build_py as _build_py

    # cmdclass["build_py"] = copy_files_build_py_factory(
    #     {
    #         "octoprint/templates/_data": [
    #             "AUTHORS.md",
    #             "SUPPORTERS.md",
    #             "THIRDPARTYLICENSES.md",
    #         ]
    #     },
    #     cmdclass.get("build_py", _build_py),
    # )

    return cmdclass


if __name__ == "__main__":
    version, cmdclass = get_version_and_cmdclass("octoprint_octodash")
    setuptools.setup(
        # we define the license string like this to be backwards compatible to setuptools<77
        license="Apache-2.0",
        version=version,
        cmdclass=get_cmdclass(cmdclass),
    )