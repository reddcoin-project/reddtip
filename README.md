#Reddcoin Tip Platform

The Reddcoin Tip Platform is a browser extension for [Chrome](https://chrome.google.com/webstore/detail/reddcoin-tip-platform/lcoponfclppkdadbglnkhedjonbfegic?hl=en) and [Firefox](https://addons.mozilla.org/en-us/firefox/addon/reddcoin-tip-platform/) which embeds a GUI into the interfaces of Twitter, Reddit, and Twitch.tv

The same codebase should remain functional for both platforms. There are two json manifest files, `manifest.json` for chrome, and `package.json` for firefox.

The Extension operates largely off a single "content script," located in `/source/data/content.js`. In Chrome, this file is essentially injected into the websites named in manifest.json, in firefox, `lib/main.js` is run every page load which uses a regex to inject the content script into the appropriate pages.

##Chrome Development

To develop for chrome, simply visit [chrome://extensions](chrome://extensions), select "Load unpacked extension..." and browse to the `source` directory. If there are no errors, the current version of the extension will be installed. After making modifications, return to the extension management page and click "Reload Extension" for your changes to take effect.

##Firefox Development

To develop for Firefox, you'll first need to install the Add-on SDK, as [detailed here](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation). When everything is installed properly, you can run `cfx run` from a cfx terminal, which will open a firefox window with the extension installed. Once that process becomes tedious, you can set up an auto-installer constantly integrate your changes, as [detailed here](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_started#Developing_without_cfx_run).


##Contribution / Roadmap

Current TODO List:

* Remove debugging output and refactor so the code works on chrome once again.
* Fix the issue with twitter where tips are not entered properly if the tweet is empty.
* Upgrade the twitter GUI to autofill the tip recipient if there is already a valid user in the tweet textarea.
* Write an interface for extension specific calls which will abstract away differences between the chrome and firefox APIs.
* Implement above mentioned interface for both chrome and firefox.
* Implement an extensive GUI for every command known by the tipbots. By sending and parsing messages to the tipbot, we should be able to display a current balance, add a GUI for withdrawals and registration, and maintain and easy to access interactive tip history