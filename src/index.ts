import {browser} from "webextension-polyfill-ts";

const packageNameRegex = new RegExp("npmjs\\.com\\/package\\/(.+)\\/?");

export function getPackageName(url: string): string | null {
    const result = packageNameRegex.exec(url);

    if (result === null) {
        return null;
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

(async () => {
    const packageName = getPackageName(window.location.href);
    const depElement = findDependenciesElement();

    if (packageName !== null && depElement !== null) {

        const nestedDepCount = await browser.runtime.sendMessage({name: packageName, version: "latest"});

        depElement.append(document.createElement("br"));

        const depNumberSpan = depElement.getElementsByTagName("span")[0];

        const nestedDepNumberSpan = <HTMLSpanElement>depNumberSpan.cloneNode();
        nestedDepNumberSpan.innerText = nestedDepCount.toString();

        depElement.appendChild(nestedDepNumberSpan);
        depElement.append("Nested Dependencies")

    }
})();

