import {NPMRegistry} from "~npm-registry";

export class Package {

    private totalDependencies: Set<string> = new Set<string>();

    name: string;
    version: string;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    public async fillDependencies(name?: string, version?: string): Promise<void> {

        let pack;
        //Other package
        if (name !== undefined && version !== undefined) {
            pack = await NPMRegistry.getPackage(name, version);
            this.totalDependencies.add(`${pack.name}@${pack.version}`);
        }
        //Self
        else {
            pack = await NPMRegistry.getPackage(this.name, this.version);
        }

        const tasks: Promise<void>[] = [];

        if (pack.dependencies !== undefined) {
            for (let [depName, depVersion] of Object.entries(pack.dependencies)) {
                //Don't count the same package twice
                if (!this.totalDependencies.has(`${depName}@${depVersion}`)) {
                    tasks.push(this.fillDependencies(depName, depVersion));
                }
            }
        }

        await Promise.all(tasks);

    }

    async getDependenciesCount(): Promise<number> {

        await this.fillDependencies();

        return this.totalDependencies.size;
    }
}
