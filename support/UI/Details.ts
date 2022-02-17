export class Details {
    static newTaskButton:           string = "//a[contains(@role, 'menuitem') and contains(@title, 'New Task')] | //div[contains(@title, 'New Task')]";
    static selectListViewButton:    string = "//button[contains(@title, 'Select a List View')]";

    static selectListViewItem (listviewName: string): string{
        return `//li[descendant::*[contains(text(), '${listviewName}')]]`
    }
}
