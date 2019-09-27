import {browser} from "webextension-polyfill-ts";

const packageNameRegex = new RegExp("npmjs\\.com\\/package\\/([^\\/]+)\\/?");
const packageVersionRegex = new RegExp("npmjs\\.com\\/package\\/.+\\/v\\/([^\\/]+)\\/?");

function getPackageName(url: string): string | null {
    const result = packageNameRegex.exec(url);

    if (result === null) {
        return null;
    }

    //First capturing group
    return result[1];
}

function getPackageVersion(url: string): string | "latest" {
    const result = packageVersionRegex.exec(url);

    if (result === null) {
        return "latest";
    }

    //First capturing group
    return result[1];
}

function findDependenciesElement(): HTMLElement | null {
    for (const span of Array.from(document.querySelectorAll("span"))) {
        if (span.textContent != null && (span.textContent.includes("Dependency") || span.textContent.includes("Dependencies"))) {
            return span;
        }
    }

    return null;
}

const nestedDepCounterPrefix = Math.random().toString(36).substr(2, 9);

function getNestedDepCounter(): HTMLSpanElement | null {
    const depElement = findDependenciesElement();

    if (depElement === null) {
        return null;
    }

    let el = <HTMLSpanElement>document.getElementById(`${nestedDepCounterPrefix}-nested-dep-counter`);
    if (el === null) {
        //Create NestedDepCounter
        depElement.append(document.createElement("br"));

        const depNumberSpan = depElement.getElementsByTagName("span")[0];

        el = <HTMLSpanElement>depNumberSpan.cloneNode();
        el.id = `${nestedDepCounterPrefix}-nested-dep-counter`;
        el.innerText = "...";

        depElement.appendChild(el);
        depElement.append("Nested Dependencies");
    }

    return el;

}

const showNestedDependenciesCount = async () => {
    const packageName = getPackageName(window.location.href);
    const packageVersion = getPackageVersion(window.location.href);
    const counter = getNestedDepCounter();

    if (packageName !== null && counter !== null) {
        const nestedDepCount = await browser.runtime.sendMessage({name: packageName, version: packageVersion});
        counter.innerText = nestedDepCount.toString();
    }
};

window.addEventListener("load", () => {
    showNestedDependenciesCount();

    //Since npmjs is a SPA we need to check periodically if the url changed to update the count
    let previousUrl = window.location.href;
    setInterval(() => {
        if (previousUrl !== window.location.href) {
            previousUrl = window.location.href;

            //Set counter to '...'
            const counter = getNestedDepCounter();
            if (counter !== null) {
                counter.innerText = "...";
            }

            showNestedDependenciesCount();
        }
    }, 1000);

});

window.addEventListener("popstate", showNestedDependenciesCount);

