class Store {
    constructor() {
        this.storageName = 'gantt'

    }
    get() {
        //console.log('getting from storage')
        let data = localStorage.getItem(this.storageName);
        if (data) {
            data = JSON.parse(data);
            return data;
            console.log(data);
        } else {
            //console.log('there is nothing in storage');
        }
    }
    set(object) {
        localStorage.setItem(this.storageName, JSON.stringify(object));
    }
    clear(){
        localStorage.clear();
    }
}
let store = new Store;

