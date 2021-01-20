//task and group constructors
//class Task {
//    constructor(id, name, startDate, endDate, color, assignment, group, percentComplete, notes) {
//        this.id = id;
//        this.name = name;
//        this.type = ''
//        this.previous = ''
//        this.next = ''
//        this.firstChild = ''
//        
//        this.startDate = startDate;
//        this.endDate = endDate;
//        this.color = color;
//        this.assignment = assignment;
//        this.group = group;
//        this.percentComplete = percentComplete;
//        this.notes = notes;
//    }
//}
//
//class TaskGroup {
//    constructor(id, name, startDate, endDate, children, color, assignment, percentComplete, notes) {
//        this.id = id;
//        this.name = name;
//        this.startDate = startDate;
//        this.endDate = endDate;
//        this.children = children;
//        this.color = color;
//        this.assignment = assignment;
//        this.percentComplete = percentComplete;
//        this.notes = notes;
//    }
//}
class Item {
    constructor() {
        this.id = ''
        this.name = ''
        this.type = ''
        this.previous = null
        this.next = null
        this.firstChild = null
        this.lastChild = null
        this.parent = null
        
        this.startDate = ''
        this.endDate = ''
        this.color = ''
        this.assignment = 'Not Assigned'
        this.percentComplete = '0'
        this.notes = ''
    }
}


//testing task
let item1 = new Item()
item1.id = 100;
item1.name = 'group1';
item1.type = 'group';
item1.previous = null;
item1.next = 101;
item1.firstChild = 1;
item1.parent = 1001;


let item2 = new Item()
item2.id = 101;
item2.name = 'group2';
item2.type = 'group';
item2.previous = 100;
item2.next = null;
item2.firstChild = 3;
item2.parent = 1001;

let item3 = new Item()
item3.id = 1;
item3.name = 'task1';
item3.type = 'task';
item3.previous = null;
item3.next = 2;
item3.firstChild = null;
item3.parent = 100;
item3.percentComplete = 90;
item3.assignment = 'you';
item3.startDate = new Date('1/15/2021 12:00');
item3.endDate = new Date('1/20/2021');

let item4 = new Item()
item4.id = 2;
item4.name = 'task2';
item4.type = 'task';
item4.previous = 1;
item4.next = null;
item4.firstChild = null;
item4.parent = 100;
item4.percentComplete = 50;
item4.assignment = 'you';
item4.startDate = new Date('1/17/2021');
item4.endDate = new Date('1/29/2021');


let item5 = new Item()
item5.id = 3;
item5.name = 'task3';
item5.type = 'task';
item5.previous = null;
item5.next = null;
item5.firstChild = null;
item5.parent = 101;
item5.percentComplete = 50;
item5.assignment = 'you';
item5.startDate = new Date('1/27/2021');
item5.endDate = new Date('1/30/2021');

let item6 = new Item()
item6.id = 1001;
item6.name = 'Master Group';
item6.type = 'group';
item6.previous = null;
item6.next = null;
item6.firstChild = 100;
item6.parent = null;

let itemArray = [item1, item2, item3, item4, item5, item6];
itemArray = [];
    




