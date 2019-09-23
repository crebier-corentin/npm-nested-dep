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

export class Packages {

    private cache: Map<string, Promise<RegistryPackage>> = new Map();
    private totalDependencies: Set<string> = new Set<string>();

    private async getPackage(name: string, version: string): Promise<RegistryVersion> {
        //Latest
        if (version === "latest") {
            return this.getPackageLatest(name);
        }

        let pack: RegistryPackage;
        //Check cache before sending request
        if (this.cache.has(name)) {
            pack = <RegistryPackage>await this.cache.get(name);
        }
        //Not in cache
        else {
            const promise = fetch(`${NPM_REGISTRY}/${name}`)
                .then(res => res.json());
            this.cache.set(name, promise);
            pack = await promise;
        }

        //Version matching
        const versionRange = new Range(version);
        const packageVersions = Object.keys(pack.versions);

        const rightVersion = maxSatisfying(packageVersions, versionRange);

        if (rightVersion === null) {
            throw new Error(`Cannot find satisfying version for package ${name}@${version}`);
        }

        const rightPackage = pack.versions[rightVersion];

        //Add to totalDependencies
        this.totalDependencies.add(`${rightPackage.name}@${rightPackage.version}`);

        return rightPackage;
    }

    private async getPackageLatest(name: string): Promise<RegistryVersion> {
        const res = await fetch(`${NPM_REGISTRY}/${name}/latest`);

        return <Promise<RegistryVersion>>res.json();
    }

    private async getDependencies(name: string, version: string): Promise<void> {

        const pack = await this.getPackage(name, version);

        const tasks: Promise<void>[] = [];

        if (pack.dependencies !== undefined) {
            for (let [depName, depVersion] of Object.entries(pack.dependencies)) {
                //Don't count the same package twice
                if (!this.totalDependencies.has(`${depName}@${depVersion}`)) {
                    tasks.push(this.getDependencies(depName, depVersion));
                }
            }
        }

        await Promise.all(tasks);

    }

    async getDependenciesCount(name: string): Promise<number> {

        await this.getDependencies(name, "latest");

        return this.totalDependencies.size;
    }
}
