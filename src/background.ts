import {browser} from "webextension-polyfill-ts";
import {Packages} from "~/packages.ts";

browser.runtime.onMessage.addListener(message => {

    const packages = new Packages();

    return packages.getDependenciesCount(message.name);
});
