import {Range, maxSatisfying} from "semver";

interface RegistryVersion {
    name: string;
    version: string;
    dependencies?: { [name: string]: string; };
}

interface RegistryPackage {
    versions: {
        [version: string]: RegistryVersion;
    };
}

const NPM_REGISTRY = "https://registry.npmjs.org/";

export class Package {

    private static async getPackage(name: string, version: string): Promise<RegistryVersion> {
        //Latest
        if (version === "latest") {
            return Package.getPackageLatest(name);
        }

        const res = await fetch(`${NPM_REGISTRY}/${name}`);
        const pack = <RegistryPackage>await res.json();

        const versionRange = new Range(version);
        const packageVersions = Object.keys(pack.versions);

        const rightVersion = maxSatisfying(packageVersions, versionRange);

        if (rightVersion === null) {
            throw new Error(`Cannot find satisfying version for package ${name}@${version}`);
        }

        return pack.versions[rightVersion];
    }

    private static async getPackageLatest(name: string): Promise<RegistryVersion> {
        const res = await fetch(`${NPM_REGISTRY}/${name}/latest`);

        return <Promise<RegistryVersion>>res.json();
    }

    private static async getDependencies(name: string, version: string): Promise<RegistryVersion[]> {

        const pack = await Package.getPackage(name, version);

        const depCountTasks: Promise<RegistryVersion[]>[] = [];

        if (pack.dependencies !== undefined) {
            for (let [depName, depVersion] of Object.entries(pack.dependencies)) {
                depCountTasks.push(Package.getDependencies(depName, depVersion));
            }
        }

        const dependencies = await Promise.all(depCountTasks);
        return [pack, ...dependencies.flat()];

    }

    static async getDependenciesCount(name: string, version: string): Promise<number> {
        const allDependencies = await Package.getDependencies(name, version);

        const set = new Set<string>(allDependencies.map(dep => `${dep.name}@${dep.version}`));

        return set.size - 1; //Remove self from dependencies
    }
}
