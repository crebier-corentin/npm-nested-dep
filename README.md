# NPM nested dependencies count
![standard dependencies, 9 direct dependencies, 208 nested dependencies](docs/standard-dependencies.png)  
![express dependencies, 30 direct dependencies, 51 nested dependencies](docs/express-dependencies.png)  
![webpack dependencies, 23 direct dependencies, 339 nested dependencies](docs/webpack-dependencies.png)  
A simple browser extension that shows you the total count of nested dependencies for an npm package.

### Why?
Most people will agree that the JS ecosystem is bloated, packages that depend on packages that depend on packages that depend on packages that...  
It's a never ending list of folder and files.  

NPM's current layout only displays the direct dependencies, it can create "tip of the iceberg" scenenarios where a package that has only 2 direct dependencies can have hundred nested ones.

Before installing a package consider this : is it worth it? Are you willing to pay for the overhead?
Hopefully this extension will make developers more cautious of packages and consider not using them in some situations

### Firefox installation
You can find the addon here : https://addons.mozilla.org/fr/firefox/addon/npm-nested-dependencies-count/  

You can also install it manually : 
* Download one of the [releases](https://github.com/bibo5088/npm-nested-dep/releases)
* Go to `about:addons`
* Click on the settings gear 
* Click "Install from file" and select the release download previously. 

### Manual Chrome Installation
This extension is not yet available in the chrome web store.  
In the meantime you can still manually install it :

* Download a [releases](https://github.com/bibo5088/npm-nested-dep/releases) and extract it somewhere
* Go to `chrome://extensions/`
* Enable developer mode
* Click on "Load unpacked extension" and select the previously extracted folder
