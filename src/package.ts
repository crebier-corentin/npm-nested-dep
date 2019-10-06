import {NPMRegistry} from "~npm-registry";

interface NameVersion {
    name: string;
    version: string;
}

function moveArray<T>(array: Array<T>): Array<T> {
    const newArray: Array<T> = [];

    while (array.length > 0) {
        newArray.push(<T>array.shift());
    }

    return newArray;
}

export class Package {

    private totalDependencies: Set<string> = new Set<string>();
    private tasks: NameVersion[] = [];

    name: string;
    version: string;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    private async process(task: NameVersion) {
        const pack = await NPMRegistry.getPackage(task.name, task.version);

        //Package has already been proccesed, ignore dependencies
        if(this.totalDependencies.has(`${pack.name}@${pack.version}`)) return;

        this.totalDependencies.add(`${pack.name}@${pack.version}`);

        if (pack.dependencies !== undefined) {
            for (let [depName, depVersion] of Object.entries(pack.dependencies)) {
                //Don't count the same package twice
                if (!this.totalDependencies.has(`${depName}@${depVersion}`)) {
                    this.tasks.push({name: depName, version: depVersion});
                }
            }
        }
    }

    private async fillDependencies() {
        //Add self to add dependencies
        await this.process({name: this.name, version: this.version});
        //Remove self from list
        this.totalDependencies.clear();

        while (this.tasks.length > 0) {
            const tasksToProcess = moveArray(this.tasks);

            const promises: Promise<void>[] = [];

            for (const taskToProcess of tasksToProcess) {
                promises.push(this.process(taskToProcess));
            }

            await Promise.all(promises);
        }
    }

    async getDependenciesCount(): Promise<number> {

        await this.fillDependencies();

        return this.totalDependencies.size;
    }
}
