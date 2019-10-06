import {Range, maxSatisfying} from "semver";
import {Semaphore} from "~Semaphore";

export interface RegistryVersion {
    name: string;
    version: string;
    dependencies?: { [name: string]: string; };
}

export interface RegistryPackage {
    "dist-tags": { [version: string]: string; }
    versions: {
        [version: string]: RegistryVersion;
    };
}

const NPM_REGISTRY_URL = "https://registry.npmjs.org/";

export class NPMRegistry {

    private static cache: Map<string, Promise<RegistryPackage>> = new Map();

    private static fetchSemaphore: Semaphore = new Semaphore(10);

    private static async rateLimitedFetch(url: string) {
        await this.fetchSemaphore.acquire();

        const result = await fetch(url).catch(reason => {
            this.fetchSemaphore.release();

            return Promise.reject(reason);
        });

        this.fetchSemaphore.release();
        return result;
    }

    public static async getPackage(name: string, version: string): Promise<RegistryVersion> {
        let pack: RegistryPackage;
        //Check cache before sending request
        if (NPMRegistry.cache.has(name)) {
            pack = <RegistryPackage>await NPMRegistry.cache.get(name);
        }
        //Not in cache
        else {
            const promise = this.rateLimitedFetch(`${NPM_REGISTRY_URL}/${name}`)
                .then(res => res.json());
            NPMRegistry.cache.set(name, promise);
            pack = await promise;
        }

        //Dist tag (latest...)
        if (pack["dist-tags"].hasOwnProperty(version)) {
            return pack.versions[pack["dist-tags"][version]];
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
}
