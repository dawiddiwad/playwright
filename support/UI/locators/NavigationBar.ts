export class NavigationBar {
    static appLauncherIcon: string = "//button[descendant::*[contains(text(), 'App Launcher')]]";
    static appLauncherSearch: string = "//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]";
    static selectApplication (applicationName: string): string {
        return `//one-app-launcher-menu-item[descendant::*[@*='${applicationName}']]`;
    }
    static tabsNavigationMenu: string = "//button[descendant::*[contains(text(), 'Show Navigation Menu')]]";
    static tabsNavigationMenuItem (tabName: string): string{
        return `//li[contains(@class, 'listbox') and descendant::*[contains(text(), '${tabName}')]]`;
    }
}