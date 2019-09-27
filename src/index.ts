import {browser} from "webextension-polyfill-ts";

const packageNameRegex = new RegExp("npmjs\\.com\\/package\\/([^\\/]+)\\/?");
const packageVersionRegex = new RegExp("npmjs\\.com\\/package\\/.+\\/v\\/([^\\/]+)\\/?");

export function getPackageName(url: string): string | null {
    const result = packageNameRegex.exec(url);

    if (result === null) {
        return null;
    }

    //First capturing group
    return result[1];
}

export function getPackageVersion(url: string): string | "latest" {
    const result = packageVersionRegex.exec(url);

    if (result === null) {
        return "latest";
    }

    //First capturing group
    return result[1];
}

export function findDependenciesElement(): HTMLElement | null {
    for (const span of Array.from(document.querySelectorAll("span"))) {
        if (span.textContent != null && (span.textContent.includes("Dependency") || span.textContent.includes("Dependencies"))) {
            return span;
        }
    }

    return null;
}


const showNestedDependenciesCount = async () => {
    const packageName = getPackageName(window.location.href);
    const packageVersion = getPackageVersion(window.location.href);
    const depElement = findDependenciesElement();

    if (packageName !== null && depElement !== null) {

        const nestedDepCount = await browser.runtime.sendMessage({name: packageName, version: packageVersion});

        let nestedDepNumberSpan = document.getElementById("nested-dep-number-span");
        if (nestedDepNumberSpan === null) {
            //Create nestedDepNumberSpan
            depElement.append(document.createElement("br"));

            const depNumberSpan = depElement.getElementsByTagName("span")[0];

            nestedDepNumberSpan = <HTMLSpanElement>depNumberSpan.cloneNode();
            nestedDepNumberSpan.id = "nested-dep-number-span";

            depElement.appendChild(nestedDepNumberSpan);
            depElement.append("Nested Dependencies");
        }

        nestedDepNumberSpan.innerText = nestedDepCount.toString();

    }
};

window.addEventListener("load", () => {
    showNestedDependenciesCount();

    //Since npmjs is a SPA we need to check periodically if the url changed to update the count
    let previousUrl = window.location.href;
    setInterval(() => {
        if (previousUrl !== window.location.href) {
            previousUrl = window.location.href;

            //Set nestedDepNumberSpan to '...'
            const nestedDepNumberSpan = document.getElementById("nested-dep-number-span");
            if (nestedDepNumberSpan !== null) {
                nestedDepNumberSpan.innerText = "...";
            }

            showNestedDependenciesCount();
        }
    }, 1000);

});

window.addEventListener("popstate", showNestedDependenciesCount);

