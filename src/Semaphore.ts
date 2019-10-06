//Taken from here https://gist.github.com/Gericop/e33be1f201cf242197d9c4d0a1fa7335

export class Semaphore {
    counter: number = 0;
    waiting: { resolve: () => any, err: (message: string) => any }[] = [];
    max: number;

    constructor(max: number) {
        this.max = max;
    }

    take() {
        if (this.waiting.length > 0 && this.counter < this.max) {
            this.counter++;
            let promise = this.waiting.shift();
            promise!.resolve();
        }
    }

    acquire() {
        if (this.counter < this.max) {
            this.counter++;
            return new Promise(resolve => {
                resolve();
            });
        }
        else {
            return new Promise((resolve, err) => {
                this.waiting.push({resolve: resolve, err: err});
            });
        }
    }

    release() {
        this.counter--;
        this.take();
    }

    purge() {
        let unresolved = this.waiting.length;

        for (let i = 0; i < unresolved; i++) {
            this.waiting[i].err('Task has been purged.');
        }

        this.counter = 0;
        this.waiting = [];

        return unresolved;
    }
}
