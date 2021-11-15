import { chromium, Page } from "playwright-core";
const { setWorldConstructor } = require("@cucumber/cucumber");

class SfdcWorld {
    public PageReady: Promise<Page>;
    constructor(){
        this.PageReady = chromium.launch()
            .then((chrome) => chrome.newContext()
                .then((ctx) => ctx.newPage()));
    }
}

setWorldConstructor(SfdcWorld);