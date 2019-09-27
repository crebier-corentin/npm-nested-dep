import {browser} from "webextension-polyfill-ts";
import {Package} from "~package";

browser.runtime.onMessage.addListener(message => {

    const pack = new Package(message.name, message.version);

    return pack.getDependenciesCount();
});
