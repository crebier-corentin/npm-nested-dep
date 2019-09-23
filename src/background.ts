import {browser} from "webextension-polyfill-ts";
import {Package} from "~package";

browser.runtime.onMessage.addListener(message => {
    return Package.getDependenciesCount(message.name, message.version);
});
