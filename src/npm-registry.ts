import {Range, maxSatisfying} from "semver";

export interface RegistryVersion {
    name: string;
    version: string;
    dependencies?: { [name: string]: string; };
}

export interface RegistryPackage {
    versions: {
        [version: string]: RegistryVersion;
    };
}

const NPM_REGISTRY_URL = "https://registry.npmjs.org/";

export class NPMRegistry {

    private static cache: Map<string, Promise<RegistryPackage>> = new Map();

    public static async getPackage(name: string, version: string): Promise<RegistryVersion> {
        //Latest
        if (version === "latest") {
            return NPMRegistry.getPackageLatest(name);
        }

        let pack: RegistryPackage;
        //Check cache before sending request
        if (NPMRegistry.cache.has(name)) {
            pack = <RegistryPackage>await NPMRegistry.cache.get(name);
        }
        //Not in cache
        else {
            const promise = fetch(`${NPM_REGISTRY_URL}/${name}`)
                .then(res => res.json());
            NPMRegistry.cache.set(name, promise);
            pack = await promise;
        }

        //Version matching
        const versionRange = new Range(version);
        const packageVersions = Object.keys(pack.versions);

        const rightVersion = maxSatisfying(packageVersions, versionRange);

        if (rightVersion === null) {
            throw new Error(`Cannot find satisfying version for package ${name}@${version}`);
        }

        return pack.versions[rightVersion];
    }

    public static async getPackageLatest(name: string): Promise<RegistryVersion> {
        const res = await fetch(`${NPM_REGISTRY_URL}/${name}/latest`);

        return <Promise<RegistryVersion>>res.json();
    }
}
