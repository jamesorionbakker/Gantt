let calenderStartDate = new Date(Date.now() - 604800000);
let calenderEndDate = new Date(calenderStartDate);
calenderEndDate.setDate(calenderEndDate.getDate() + 365);

let todaysDate = new Date(Date.now());

class UI {
    constructor() {
        this.tasks = document.querySelector('.tasks');
        this.taskList = document.querySelector('.task-list');
        this.calenderGrid = document.querySelector('.calender-grid');
        this.monthBar = document.querySelector('.month-bar');
        this.taskHeader = document.querySelector('.task-header');
        this.calenderContainer = document.querySelector('.calender-container');
        this.calenderItemContainer = document.querySelector('.calender-item-container');
        this.calenderTargetContainer = document.querySelector('.calender-target-container');
        this.taskListTargetContainer = document.querySelector('.task-list-target-container');
        this.ganttLineCreate = document.querySelector('.gantt-line-create');
        this.gridWidth = 25;
        this.gridHeight = 33;
        this.increment = 24; //number of hours per grid division
        this.daysToLoad = 365;

        this.calenderTopOffset = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--month-bar-height')) + (parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--day-date-char-height')) * 2);
    }
    gridToDate(grid) {
        let gridPos = grid / this.gridWidth;
        let newDate = new Date(calenderStartDate);
        newDate.setDate(newDate.getDate() + gridPos);
        return newDate;
    }
}
let ui = new UI();

class Store {
    constructor() {
        this.storageName = 'gantt'
    }
    get() {
        let data = localStorage.getItem(this.storageName);
        if (data) {
            data = JSON.parse(data);
            return data;
            console.log(data);
        } else {}
    }
    set(object) {
        localStorage.setItem(this.storageName, JSON.stringify(object));
    }
    clear() {
        localStorage.clear();
    }
}
let store = new Store;

class NewTaskForm {
    constructor() {
        this.modal = document.querySelector('#newItemModal');
        this.errorDiv = document.querySelector('#newTaskFormError');
        this.name = document.querySelector('#inputTaskName');
        this.color = document.querySelector('#inputTaskColor');
        this.startDate = document.querySelector('#inputTaskStartDate');
        this.endDate = document.querySelector('#inputTaskEndDate');
        this.group = document.querySelector('#inputTaskGroup');
        this.assignment = document.querySelector('#inputTaskAssignment');
        this.percentCompleted = document.querySelector('#inputTaskPercentCompleted');
        this.createTaskSubmit = document.querySelector('#createNewTask');
        this.sampletext = 'sample';
    }

    submit() {
        if (this.validate()) {
            let newItem = new Item()
            let position = '';
            let reference;

            if (this.group.value === 'none') {
                reference = tasks.last;
                position = 'after';
            } else {
                reference = tasks[this.group.value].id;
                position = 'inside';
            }

            newItem.id = Date.now();
            newItem.type = 'task';
            newItem.name = this.name.value;
            newItem.color = this.color.value;
            newItem.startDate = new Date(this.startDate.value + 'PST')
            newItem.endDate = new Date(this.endDate.value + 'PST')
            newItem.assignment = this.assignment.value;
            newItem.percentComplete = this.percentCompleted.value;
            tasks.new(newItem, position, reference);

            $('#newItemModal').modal('hide');
            this.name.value = null;
            this.group.selectedIndex = null;
            this.assignment.selectedIndex = null;
            this.color.value = "#1E77Eb";
            this.percentCompleted.value = null;
            this.startDate.value = null
            this.endDate.value = null;
        }
    }
    alert(msg) {
        this.errorDiv.innerHTML = `<div class="alert alert-primary" role="alert">${msg}</div>`;
        setTimeout(() => {
            this.errorDiv.innerHTML = '';
        }, 2000);
    }
    validate() {
        if (!this.isValid(this.name.value, ['', 'undefined'])) { //validate name field
            this.alert('Please Enter a Task Name');
        } else if (new Date(this.startDate.value).getTime() >= new Date(this.endDate.value).getTime()) { //validate date fields
            this.alert(`Start Date must be before Stop Date`);
        } else {
            return true;
        }
    }
    isValid(input, check) {
        for (let i = 0; i < check.length; i++) {
            if (input === check[i]) {
                return false
            } else {
                return true;
            }
        }
    }
    highlightField(field) {
        field.style.backgroundColor = '#FFCCCC';
        setTimeout(function () {
            field.style.backgroundColor = null;
        }, 1000);
    }
}
let newTaskForm = new NewTaskForm;

class NewGroupForm {
    constructor() {
        this.modal = document.querySelector('#newItemModal');
        this.errorDiv = document.querySelector('#newGroupFormError');
        this.name = document.querySelector('#inputGroupName');
        this.color = document.querySelector('#inputGroupColor');
        this.createGroupSubmit = document.querySelector('#createNewGroup');
    }
    submit() {
        if (this.name.value == '' || this.name.value == 'undefined' || this.name.value == null) {
            this.alert('Please Enter a Name')
        } else {
            let newItem = new Item()

            newItem.id = Date.now();
            newItem.type = 'group';
            newItem.name = this.name.value;
            newItem.color = this.color.value;
            tasks.new(newItem, 'after', tasks.last);

            $('#newItemModal').modal('hide');
            this.name.value = null;
            this.color.value = "#1E77Eb";
        }
    }
    alert(msg) {
        this.errorDiv.innerHTML = `<div class="alert alert-primary" role="alert">${msg}</div>`;
        setTimeout(() => {
            this.errorDiv.innerHTML = '';
        }, 2000);
    }
}
let newGroupForm = new NewGroupForm;

class InlineEdit {
    constructor() {}

    isEditable(e) {
        if (this.queryArray(e.target.classList, 'editable')) {
            return true;
        }
    }
    queryArray(classList, string) {
        for (let i = 0; i < classList.length; i++) {
            if (classList[i] === string) {
                return true;
            }
        }
        return false;
    }
    edit(e) {

        let targetIdStr = e.target.id;;
        let targetIdArr = targetIdStr.split(",");

        let targetProperty = targetIdArr[0];
        let targetId = parseInt(targetIdArr[1]);


        if (this.isEditable(e)) {
            let originalText = e.target.innerHTML;
            e.target.innerHTML = `<input class="inline-edit" id="beingEdited" type="text" value="${originalText}"></input>`
            let editBox = document.querySelector('#beingEdited');

            const checkForEnterKey = (e2) => {
                if (e2.key === 'Enter' || e2.keyCode === 13) {
                    saveChanges()
                }
            }

            const checkForClickOut = (e2) => {
                if (editBox !== e2.target) {
                    saveChanges()
                }
            }

            const saveChanges = (e2) => {

                if (this.queryArray(e.target.classList, 'percentage')) {
                    editBox.value = parseInt(editBox.value);
                    if (editBox.value > 100) {
                        editBox.value = 100;
                    }
                    if (editBox.value < 0) {
                        editBox.value = 0;
                    }
                    if (editBox.value === 'NaN') {
                        editBox.value = parseInt(originalText);
                    }
                }

                tasks[targetId][targetProperty] = editBox.value;
                tasks.print()

                document.removeEventListener('mousedown', checkForClickOut);
                editBox.removeEventListener('keyup', checkForEnterKey);
            }
            document.addEventListener('mousedown', checkForClickOut);
            editBox.addEventListener('keyup', checkForEnterKey);
        }
    }
}

class GanttLine {
    constructor() {
        document.addEventListener('mouseover', this.showGanttHandles);
        document.addEventListener('mousedown', this.dragGantt);
        this.lastMousePosX = '';
    }

    dragGantt(e) {
        e.preventDefault;

        if (e.target.className === 'gantt-line') {
            guiSchedule.locked = true;
            document.addEventListener('mouseup', function () {
                guiSchedule.locked = false;
                document.removeEventListener('mousemove', moveGantt);

                tasks[parseInt(e.target.id)][this.dateModified] = this.modifiedDate

                tasks.print()
                e.target.firstChild.style.backgroundColor = 'rgba(0,0,0, .1)'; //gantt handles inactive state
                e.target.lastChild.style.backgroundColor = 'rgba(0,0,0, .1)';
            }, {
                once: true
            })

            let origLeft = parseInt(e.target.style.left);
            let origTop = parseInt(e.target.style.top);
            let origWidth = parseInt(e.target.style.width);
            let startX = e.clientX;
            let startY = e.clientY;
            let lastMousePosX = startX;

            let sideToMove = ''
            if (e.offsetX < parseInt(e.target.style.width) / 2) {
                sideToMove = 'left'
                e.target.firstChild.style.backgroundColor = 'rgba(0,0,0, .3)'; //gantt handles active state
            } else {
                sideToMove = 'right'
                e.target.lastChild.style.backgroundColor = 'rgba(0,0,0, .3)';
            }

            let moveGantt = (e2) => {
                if (Math.abs(lastMousePosX - e2.clientX) < ui.gridWidth / 2) { //only trigger move if user moves mouse at least 1/2 grid width
                    return;
                }
                lastMousePosX = e2.clientX;
                e2.preventDefault;
                let curX = e2.clientX;
                let curY = e2.clientY;

                if (sideToMove === 'left') {

                    let leftGridPos = origLeft - (Math.ceil((startX - curX) / ui.gridWidth) * ui.gridWidth);
                    let startDateDiff = (Math.floor((curX - startX) / ui.gridWidth) * ui.increment);
                    let origStartDate = new Date(parseInt(e.target.getAttribute('data-start-time')));
                    this.modifiedDate = new Date(origStartDate.getTime() + (startDateDiff * 3600000));
                    e.target.style.left = `${leftGridPos}px`;
                    e.target.style.width = `${origWidth + (Math.ceil((startX - curX) / ui.gridWidth) * ui.gridWidth)}px`
                    this.dateModified = 'startDate';

                    let toolTip = e.target.querySelector(`.handle-left .tooltip-text`);
                    toolTip.style.visibility = 'visible';
                    toolTip.innerHTML = this.modifiedDate;
                }
                if (sideToMove === 'right') {

                    let rightGridPos = origLeft + origWidth - (Math.ceil((startX - curX) / ui.gridWidth) * ui.gridWidth);
                    let endDateDiff = (Math.floor((curX - startX) / ui.gridWidth) * ui.increment);
                    let origEndDate = new Date(parseInt(e.target.getAttribute('data-end-time')));
                    this.modifiedDate = new Date(origEndDate.getTime() + (endDateDiff * 3600000));
                    e.target.style.width = `${origWidth - (Math.ceil((startX - curX) / ui.gridWidth) * ui.gridWidth)}px`
                    this.dateModified = 'endDate';

                    let toolTip = e.target.querySelector(`.handle-right .tooltip-text`);
                    toolTip.style.visibility = 'visible';
                    toolTip.innerHTML = this.modifiedDate;
                }
            }
            document.addEventListener('mousemove', moveGantt);
        }
    }
    showGanttHandles(e) {
        if (e.target.className === 'gantt-line') {
            e.target.firstChild.style.visibility = 'visible';
            e.target.lastChild.style.visibility = 'visible';
        }
        let hideGanttHandles = () => {
            if (e.target.className === 'gantt-line') {
                e.target.firstChild.style.visibility = 'hidden';
                e.target.lastChild.style.visibility = 'hidden';
                e.target.removeEventListener('mouseout', hideGanttHandles);
            }
        }
        e.target.addEventListener('mouseout', hideGanttHandles);
    }
}

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
        this.drives = [];
        this.drivenBy = null

        this.startDate = ''
        this.endDate = ''
        this.color = ''
        this.assignment = 'Not Assigned'
        this.percentComplete = '0'
        this.notes = ''
    }
}

class Tasks {
    constructor(data) {
        if (data.taskArray.length < 1) {
            this.first = null;
            this.last = null;
        }
        for (let i = 0; i < data.taskArray.length; i++) {
            let currIt = data.taskArray[i]
            if (currIt.previous === null && currIt.parent === null) {
                this.first = currIt.id
            }
            this[currIt.id] = currIt;
        }
        this.itemsToHide = data.hiddenItemsArray;
        this.collapsedGroups = data.collapsedGroupsArray;
        this.saveArray = [];
    }
    print(item, scope) {
        console.log('printing');
        this.printedItemArray = []
        this.saveArray = [];
        ui.taskList.innerHTML = this.compileTaskList(item, scope);
        this.setDateRange();
        ui.calenderItemContainer.innerHTML = this.printGanttItems();
        newTaskForm.group.innerHTML = this.populateNewTaskForm();
        this.printGanttTargets();
        this.printTaskTargets();
        this.printDependencies();
        store.set({
            'taskArray': this.saveArray,
            'hiddenItemsArray': this.itemsToHide,
            'collapsedGroupsArray': this.collapsedGroups
        })
    }
    compileTaskList(item = 'first', scope = '') { //navigates through dbl linked list file structure and generates html of task lists.  Also generates an ordered array of tasks for creating chart.

        let my = {};
        let response = '';
        let collapseArrow = 'fas fa-caret-down';
        let display = 'block';
        if (item === 'first') {
            my = this[this.first];
        } else {
            my = this[item];
        }
        this.collapsedGroups.forEach(function (hiddenID) {
            if (my.id === hiddenID) {
                display = 'none';
                collapseArrow = 'fas fa-caret-right';
            }
        })

        if (!this.first) {
            return '';
        }

        if (my.type === 'group') {
            response += `<div draggable="true" id="${my.id}" class="task-group-title"><div data-id="${my.id}" class="collapse-arrow"><i class="${collapseArrow} collapse-icon"></i></div><span id="name,${my.id}" class="editable semi-bold">${my.name}</span><div class="task-progress"><span id="percentComplete,${my.id}" class="editable percentage">${my.percentComplete}%</span></div>
                                    <div class="task-assignment"><span id="assignment,${my.id}" class="editable text">${my.assignment}</span></div><div class="task-actions" data-id="${my.id}"><i class="fas fa-plus"></i><i class="fas fa-trash-alt"></i></div></div>`
        }
        if (my.type === 'task') {
            response += `<div draggable="true" id="${my.id}" class="task-li"><span id="name,${my.id}" class="editable ">${my.name}</span><div class="task-progress"><span id="percentComplete,${my.id}" class="editable percentage">${my.percentComplete}%</span></div>
                                    <div class="task-assignment"><span id="assignment,${my.id}" class="editable text">${my.assignment}</span></div><div class="task-actions" data-id="${my.id}"><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i></div></div>`
        }
        if (this.isDisplayed(my.id)) {
            this.printedItemArray.push(my);
        }
        this.saveArray.push(my);
        if (my.firstChild) {
            response += `<div data-group-container="${my.id}" style="display:${display}" class="task-group-container">`
            response += this.compileTaskList(my.firstChild, scope)
            return response;
        } else if (my.next) {
            response += this.compileTaskList(my.next, scope)
            return response;
        }
        while (my.parent) {
            this[my.parent].lastChild = my.id;
            if (this[my.parent].next) {
                response += `</div>`
                response += this.compileTaskList(this[my.parent].next, scope)
                return response;
            }
            response += `</div>`
            my = this[my.parent];
        }
        this.last = my.id;
        return response;
    }
    setDateRange() {
        this.saveArray.forEach(function (my) {
            if (my.startDate && my.endDate) {

                let myStartDate = new Date(my.startDate).getTime();
                let myEndDate = new Date(my.endDate).getTime();

                if (myStartDate - 604800000 < calenderStartDate.getTime()) {
                    calenderStartDate = new Date(myStartDate - 604800000);
                }
                if (myEndDate + 31536000000 > calenderEndDate.getTime()) {
                    calenderEndDate = new Date(myEndDate + 31536000000);
                }
            }
        })
        printCalender();
    }
    isDisplayed(id) {
        let displayed = true;
        this.itemsToHide.forEach(function (hiddenItemId) {
            if (id === hiddenItemId) {
                displayed = false;
            }
        })
        return displayed;
    }

    printGanttItems() {
        let response = '';

        for (let i = 0; i < this.printedItemArray.length; i++) {
            let my = this.printedItemArray[i];
            //Generate Gantt Item HTML
            //calculate X position
            let taskStartTime = new Date(my.startDate);
            let msFromCalStartDate = taskStartTime.getTime() - calenderStartDate.getTime();
            let pixelsLeft = Math.floor((msFromCalStartDate / 86400000) * ui.gridWidth);

            //calculate Y position
            let pixelsTop = ui.calenderTopOffset + (ui.gridHeight * i);

            //calculate width
            let taskEndTime = new Date(my.endDate);
            let msTaskLength = taskEndTime.getTime() - taskStartTime.getTime();
            let pixelWidth = Math.floor((msTaskLength / 86400000) * ui.gridWidth);

            response += `<div id="${my.id}" style="top: ${pixelsTop}px;left: ${pixelsLeft}px;width: ${pixelWidth}px; background-color: ${my.color}" data-start-time="${taskStartTime.getTime()}" data-end-time="${taskEndTime.getTime()}" data-desc="gantt-line-for-${my.id}"class="gantt-line" data-id="${my.id}"><div class="handle-left tip" ><span class="tooltip-text">Tooltip text</span></div><div class="handle-right tip"><span class="tooltip-text">Tooltip text</span></div></div>`
        }
        return response;
    }
    printDependencies() {
        let response = '';
        this.printedItemArray.forEach((my, i) => {
            if (my.drives) {
                console.log(my);
                my.drives.forEach((drivenID, j) => {
                    if (tasks[drivenID].startDate) {
                        // console.log(`${my.id} drives ${this[my.drives].id}`);
                        let taskStartTime = new Date(my.startDate);
                        let msFromCalStartDate = taskStartTime.getTime() - calenderStartDate.getTime();
                        let driverLeft = Math.floor((msFromCalStartDate / 86400000) * ui.gridWidth);

                        //calculate Y position
                        let driverTop = ui.calenderTopOffset + (ui.gridHeight * i);

                        //calculate width
                        let taskEndTime = new Date(my.endDate);
                        let msTaskLength = taskEndTime.getTime() - taskStartTime.getTime();
                        let driverWidth = Math.floor((msTaskLength / 86400000) * ui.gridWidth);
                        let driven = {};
                        driven.element = ui.calenderItemContainer.querySelector(`[data-id="${drivenID}"]`);
                        console.log(driven.element);
                        driven.top = parseInt(driven.element.style.top);
                        driven.left = parseInt(driven.element.style.left);


                        let line = {}
                        console.log(driverTop + '<' + driven.top)
                        console.log(driven);
                        if (driverTop < driven.top) { //driver is above driven
                            console.log('driver above')
                            line.originX = driverLeft + driverWidth;
                            line.originY = driverTop + (ui.gridHeight / 2) + 4;
                            line.destX = driven.left + (parseInt(driven.element.style.width) / 3) + (5 * j);
                            line.destY = driven.top;
                            line.width = line.destX - line.originX;
                            line.height = Math.abs(line.destY - line.originY + 8);

                            response += `<div class="dependency-line" style="top: ${line.originY}px; left:${line.originX}px; width: ${line.width}px; height:${line.height}px; border-top: 2px solid ${tasks[drivenID].color}; border-right: 2px solid ${tasks[drivenID].color}; border-top-right-radius: 5px;"></div>`;
                        }
                        if (driverTop > driven.top) {
                            console.log('inverted');
                            line.originX = driverLeft + driverWidth;
                            line.originY = driverTop + (ui.gridHeight / 2) + 4;
                            line.destX = driven.left + (parseInt(driven.element.style.width) / 3) + (5 * j);
                            line.destY = driven.top;
                            line.width = line.destX - line.originX;
                            line.height = Math.abs(line.destY - line.originY) - ui.gridHeight;

                            response += `<div class="dependency-line" style="top: ${line.originY - line.height}px; left:${line.originX}px; width: ${line.width}px; height:${line.height}px; border-bottom: 2px solid ${tasks[drivenID].color}; border-right: 2px solid ${tasks[drivenID].color}; border-bottom-right-radius: 5px;"></div>`;
                        }



//                        response += `<div class="dependency-line" style="top: ${line.destY}px; left:${line.originX}px; width: ${line.width}px; height:${line.height}px; border-bottom: 2px solid ${tasks[driven].color}; border-right: 2px solid ${tasks[driven].color};border-bottom-right-radius: 5px;"></div>`;


                    }
                })
            }
        })

        document.querySelector('.dependency-container').innerHTML = response;
    }
    populateNewTaskForm() {
        let response = `<option value="none">None</option>`;
        for (let i = 0; i < this.printedItemArray.length; i++) {
            let my = this.printedItemArray[i];
            if (my.type === 'group') {
                response += `<option value="${my.id}">${my.name}</option>`;
            }
        }
        return response;


    }
    printGanttTargets() {
        let targets = '';
        for (let i = 0; i < this.printedItemArray.length; i++) {
            targets += `<div data-start-date="${this.printedItemArray[i].startDate}" data-end-date="${this.printedItemArray[i].endDate}" data-type="${this.printedItemArray[i].type}" data-target="${this.printedItemArray[i].id}" data-desc="gantt-line-target-for-${this.printedItemArray[i].id}" style="width: ${ui.gridWidth * ui.daysToLoad}px; top: ${i * ui.gridHeight}px" class="new-gantt-line-target"></div>`
        }
        ui.calenderTargetContainer.firstElementChild.innerHTML = targets;
    }
    printTaskTargets() {
        let targets = `<div class="task-list-target" data-id="${this.first}" data-type="first" style="margin-top: 0px;"></div>`;
        for (let i = 0; i < this.printedItemArray.length; i++) {
            let my = this.printedItemArray[i];
            targets += `<div class="task-list-target" data-id="${my.id}" data-type="${my.type}"></div>`
        }
        ui.taskListTargetContainer.innerHTML = targets;
    }

    new(newItem, position = 'after', referenceID) {
        if (!this.validateItem(newItem, referenceID)) {
            console.log('there was an issue with new item, item was not added')
            return;
        }
        if (this.first === null && referenceID === null) {
            this[newItem.id] = newItem;
            this.first = newItem.id;
            this.last = newItem.id;
            tasks.print();
            return;
        }
        let referenceObj = this[referenceID];

        if (position === 'after') {
            if (referenceObj.next) {
                this[referenceObj.next].previous = newItem.id;
            }
            newItem.next = referenceObj.next;
            this[referenceID].next = newItem.id;
            newItem.previous = referenceID;
            newItem.parent = referenceObj.parent;
        } else if (position === 'before') {
            if (referenceObj.previous) {
                this[referenceObj.previous].next = newItem.id;
                newItem.previous = this[referenceObj.previous].id
            }
            if (referenceObj.parent && !referenceObj.previous) {
                this[referenceObj.parent].firstChild = newItem.id;
            }
            if (!referenceObj.parent && !referenceObj.previous) {
                this.first = newItem.id;
            }
            newItem.next = referenceID;
            this[referenceID].previous = newItem.id;
            newItem.parent = referenceObj.parent;
        } else if (position === 'inside') {
            if (referenceObj.type !== 'group') {
                console.log('you can only put items inside groups')
                return;
            } else {
                if (!this[referenceID].firstChild) { //if there are no children
                    this[referenceID].firstChild = newItem.id;
                } else { //if there are children
                    newItem.previous = this[referenceID].lastChild;
                    this[this[referenceID].lastChild].next = newItem.id;
                }
                newItem.parent = referenceID;
                this[referenceID].lastChild = newItem.id;
            }

        } else {
            console.log(position + ' is an invalid position');
            return;
        }

        this[newItem.id] = newItem;
        tasks.print();

    }
    delete(itemID, print = true) {

        if (itemID === 'all') {
            this.last = null;
            this.first = null;
            tasks.print();
            return;
        }
        let item = this[itemID];
        let previous = item.previous;
        let next = item.next;
        let parent = item.parent;
        let firstChild = item.firstChild;
        let lastChild = item.lastChild;

        //middle child of parent
        if (previous && next) {
            this[previous].next = next;
            this[next].previous = previous
        }
        if (parent) { //only, first or last child
            //only child
            if (this[parent].firstChild === itemID && this[parent].lastChild === itemID) {
                this[parent].firstChild = null;
                this[parent].lastChild = null;
            }
            //last sibling
            if (this[parent].lastChild === itemID && previous) {
                this[parent].lastChild = previous;
                this[previous].next = null;
            }
            //first sibling
            if (this[parent].firstChild === itemID && next) {
                this[parent].firstChild = next;
                this[next].previous = null;
            }
        }
        if (!parent && !(this.first === itemID && this.last === itemID)) { //no parent
            //first
            if (this.first === itemID) {
                this[next].previous = null;
                this.first = next
            }
            //last
            if (this.last === itemID) {
                this[previous].next = null;
                this.last = previous
            }
        }
        if (this.first === itemID && this.last === itemID) {
            this.first = null;
            this.last = null;
        }
        delete this[itemID];
        if (print) {
            this.print();
        }
    }
    move(itemID, position = 'after', referenceID) {
        let item = this[itemID];
        if (position === 'up') {
            if (item.previous) {
                referenceID = this[itemID].previous;
                position = 'before';
            } else {
                console.log('item is first child or first item')
                return;
            }
        }
        if (position === 'down') {
            if (item.next) {
                referenceID = this[itemID].next;
                position = 'after';
            } else {
                console.log('item is last child or last item')
                return;
            }
        }
        this.delete(itemID, true);

        this.collapsedGroups.forEach(function (collapsedGroup) { //if item is moved inside of currently collapsed group, add item to list of hidden items.
            if (collapsedGroup === referenceID) {
                this.itemsToHide.push(itemID);
            }

        }.bind(this))

        item.previous = null;
        item.next = null;
        item.parent = null;

        this.new(item, position, referenceID);
    }
    validateItem(item, referenceID) {
        if (item.type !== 'task' && item.type !== 'group') {
            console.log(item.type + ' is not a valid type');
            return false;
        } else if (!item.id) {
            console.log('item has no id');
            return false;
        } else {
            for (let i = 0; i < this.printedItemArray.length; i++) {
                if (item.id == this.printedItemArray[i].id) {
                    console.log('Id already exists, cannot add duplicate id');
                    return false;
                }
                if (referenceID == this.printedItemArray[i].id) {
                    return true;
                }
            }
            if (this.first === null && referenceID === null) { // there are no items currenty in list
                console.log('list is empty')
                return true;
            }
            console.log('referenced id is not valid')
            console.log(referenceID)
            return false
        }
    }
    collapse(e) {
        let target;

        if (e.target.parentElement.className === 'collapse-arrow') {
            target = e.target;
        } else if (e.target.className === 'collapse-arrow') {
            target = e.target.firstChild
        } else {
            return;
        }
        let groupID = target.parentElement.getAttribute('data-id');
        let groupContainer = document.querySelector(`[data-group-container="${groupID}"]`)
        let children = [];

        function getChildren(list) {
            list.forEach(function (element) {
                if (element.className === 'task-li') {
                    children.push(element.id);
                }
                if (element.className === 'task-group-title') {
                    children.push(element.id);

                    getChildren(document.querySelector(`[data-group-container="${element.id}"]`).childNodes)
                }
            })
        }

        getChildren(groupContainer.childNodes);

        if (groupContainer.style.display === 'none') { //expand
            children.forEach(function (childID) {

                for (let i = 0; i < this.itemsToHide.length; i++) {
                    if (this.itemsToHide[i] === parseInt(childID)) {
                        this.itemsToHide.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.collapsedGroups.length; i++) {
                    if (this.collapsedGroups[i] === parseInt(groupID)) {
                        this.collapsedGroups.splice(i, 1);
                    }
                }
            }.bind(this))
        } else { // collapse
            children.forEach(function (childID) {
                this.itemsToHide.push(parseInt(childID));
                this.collapsedGroups.push(parseInt(groupID));
            }.bind(this))
        }
        tasks.print();
    }
}

class GUISchedule {
    constructor() {
        this.mouseoverEvent = this.mouseOver.bind(this);
        this.mouseMoveEvent = this.mouseMove.bind(this);
        this.mouseOutEvent = this.mouseOut.bind(this);
        this.mouseDownEvent = this.mouseDown.bind(this);
        this.dragEvent = this.drag.bind(this);
        this.releaseEvent = this.release.bind(this);
        this.locked = false;

        this.modifiedItem = ''

        this.startDragLeft = ''
        this.startDragClientX = ''

        ui.calenderContainer.addEventListener('mouseover', this.mouseoverEvent);
        //        document.querySelector()
    }
    mouseOver(e) {
        if (!this.locked) {
            if (e.target.className === 'new-gantt-line-target' && e.target.getAttribute('data-type') === 'task') {
                document.addEventListener('mousemove', this.mouseMoveEvent);
                ui.calenderTargetContainer.addEventListener('mouseout', this.mouseOutEvent);
                ui.calenderTargetContainer.addEventListener('mousedown', this.mouseDownEvent);
            }
        }
    }
    mouseMove(e) {
        if (e.target.className === 'new-gantt-line-target') {
            ui.ganttLineCreate.style.display = 'block'
            ui.ganttLineCreate.style.left = (Math.floor(e.offsetX / ui.gridWidth) * ui.gridWidth) + 'px';
            ui.ganttLineCreate.style.width = ui.gridWidth + 'px';
            ui.ganttLineCreate.style.top = e.target.style.top;
            document.removeEventListener('mouseup', this.releaseEvent);
            this.leftToolTip = ui.ganttLineCreate.firstChild;
            this.rightToolTip = ui.ganttLineCreate.lastChild;
            this.left = parseInt(ui.ganttLineCreate.style.left);
            this.leftToolTip.innerHTML = ui.gridToDate(this.left);
            this.leftToolTip.style.visibility = 'visible';
        }
    }

    mouseOut() {
        ui.ganttLineCreate.style.display = 'none';
        document.removeEventListener('mousemove', this.mouseMoveEvent); //remove listener for mouse move event
        ui.calenderTargetContainer.removeEventListener('mouseout', this.mouseOutEvent); //remove listener for mouseout
        document.removeEventListener('mousedown', this.mouseDownEvent); //remove
    }
    mouseDown(e) {
        this.startDragLeft = parseInt(ui.ganttLineCreate.style.left);
        this.startDragClientX = e.clientX;
        this.modifiedItem = e.target.getAttribute('data-target');
        document.removeEventListener('mousemove', this.mouseMoveEvent);
        document.addEventListener('mousemove', this.dragEvent);
    }
    drag(e) {
        let width = (0 + (Math.ceil((Math.abs(e.clientX - this.startDragClientX)) / ui.gridWidth))) * ui.gridWidth;
        let leftOffset = ((Math.ceil((Math.abs(e.clientX - this.startDragClientX)) / ui.gridWidth)) - 1) * ui.gridWidth;
        if (e.clientX - this.startDragClientX < 0) {
            ui.ganttLineCreate.style.left = (this.startDragLeft - leftOffset) + 'px';
        }
        this.right = (parseInt(ui.ganttLineCreate.style.width) + this.left);
        this.rightToolTip.style.visibility = 'visible'
        this.rightToolTip.innerHTML = ui.gridToDate(this.right);

        ui.ganttLineCreate.style.width = width + 'px';
        document.addEventListener('mouseup', this.releaseEvent);
        ui.calenderTargetContainer.removeEventListener('mouseout', this.mouseOutEvent);
        ui.calenderContainer.removeEventListener('mouseover', this.mouseoverEvent);
        document.querySelector("[data-desc='gantt-line-for-" + this.modifiedItem + "']").style.display = 'none';

    }
    release() {
        let newLeft = parseInt(ui.ganttLineCreate.style.left);
        let newRight = newLeft + parseInt(ui.ganttLineCreate.style.width);

        tasks[this.modifiedItem].startDate = ui.gridToDate(newLeft)
        tasks[this.modifiedItem].endDate = ui.gridToDate(newRight)
        this.rightToolTip.style.visibility = 'hidden'

        document.removeEventListener('mousemove', this.dragEvent);
        ui.calenderTargetContainer.addEventListener('mouseout', this.mouseOutEvent);
        ui.calenderTargetContainer.removeEventListener('mousedown', this.mouseDownEvent);
        ui.ganttLineCreate.style.display = 'none';
        ui.calenderContainer.addEventListener('mouseover', this.mouseoverEvent);

        tasks.print();

    }
}

class RearrangeList {
    constructor() {
        this.draggedItemID = ''
        this.draggedItem = ''
        document.addEventListener('dragstart', this.start.bind(this), false)
        document.addEventListener('dragend', this.end.bind(this), false)
        document.addEventListener('dragenter', this.enter.bind(this), false)
        document.addEventListener('dragleave', this.leave.bind(this), false)
        document.addEventListener('dragover', this.over.bind(this), false)
        document.addEventListener('drop', this.drop.bind(this), false)
    }
    start(e) {
        let targetClass = e.target.className;
        this.draggedItem = e.target;
        if (targetClass === 'task-li' || 'task-group-title') {
            e.target.style.opacity = '0.4';
            document.querySelector('.editable').style.pointerEvents = 'none';
            this.draggedItemID = parseInt(e.target.id)
            document.querySelectorAll('.editable').forEach(function (item) {
                item.style.pointerEvents = 'none';
            })
        }
    }
    end(e) {
        e.target.style.opacity = '1';
        document.querySelectorAll('.editable').forEach(function (item) {
            item.style.pointerEvents = 'auto';
        })
    }
    enter(e) {
        e.preventDefault();
        if (e.target.className === 'task-group-title') {
            e.target.style.border = '1px solid #ccc'
        }
        if (e.target.className === 'task-list-target') {
            e.target.style.backgroundColor = '#aaa'
        }
    }
    leave(e) {
        e.preventDefault();
        if (e.target.className === 'task-group-title') {
            e.target.style.border = 'none'
        }
        if (e.target.className === 'task-list-target') {
            e.target.style.backgroundColor = '#fff'
        }
    }
    over(e) {
        e.preventDefault();
    }
    drop(e) {
        e.preventDefault();
        if (e.target.className === 'task-group-title') {
            let target = parseInt(e.target.id);
            if (target !== this.draggedItemID) {
                tasks.move(this.draggedItemID, 'inside', target);
                return;
            }
            this.draggedItem.style.opacity = '1';
            e.target.style.border = 'none';
            document.querySelectorAll('.editable').forEach(function (item) {
                item.style.pointerEvents = 'auto';
            })
        }
        if (e.target.className === 'task-list-target') {

            let targetId = parseInt(e.target.getAttribute('data-id'));
            let targetType = e.target.getAttribute('data-type');

            if (targetType === 'first') {
                tasks.move(this.draggedItemID, 'before', targetId);
            }
            if (targetType === 'group') {
                if (tasks[targetId].firstChild) {
                    if (this.draggedItemID !== tasks[targetId].firstChild) {
                        tasks.move(this.draggedItemID, 'before', tasks[targetId].firstChild);
                    }
                } else {
                    tasks.move(this.draggedItemID, 'after', targetId);
                }
            }
            if (targetType === 'task') {
                if (this.draggedItemID !== targetId) {
                    tasks.move(this.draggedItemID, 'after', targetId);
                }

            }
            e.target.style.backgroundColor = '#fff';
        }
        document.querySelector('.editable').style.pointerEvents = 'text';
    }
}


let tasks;
if (store.get()) {
    tasks = new Tasks(store.get());
} else {
    console.log('there is nothing in storage');
    tasks = new Tasks({
        'taskArray': [],
        'collapsedGroupsArray': [],
        'hiddenItemsArray': []
    })
}

let inlineEdit = new InlineEdit;
let ganttLine = new GanttLine;
let guiSchedule = new GUISchedule();
let rearrangeList = new RearrangeList();

class TaskListActions {
    constructor() {
        $('.task-list').on("mouseenter mouseleave", '.task-li, .task-group-title', function (e) {
            if (e.type == "mouseenter") {
                this.querySelector('.task-actions').style.display = 'block';
                // check if it is mouseenter, do something
            } else {
                this.querySelector('.task-actions').style.display = 'none';
                // if not, mouseleave, do something
            }
        });

        $('.task-list').on('click', '.fa-trash-alt', function (e) {
            tasks.delete(parseInt(e.target.parentElement.getAttribute('data-id')));
        })
        $('.task-list').on('click', '.fa-edit', this.editTaskModal.bind(this));
        $('.task-list').on('click', '.fa-plus', function (e) {
            console.log('open new task modal')

            let groupID = parseInt(e.target.parentElement.getAttribute('data-id'));
            let groupName = tasks[groupID].name;

            let groupSelect = `<option value='none'>None</option><option selected value="${groupID}">${groupName}</option>`;

            for (let i = 0; i < tasks.printedItemArray.length; i++) {
                let my = tasks.printedItemArray[i];
                if (my.type === 'group' && my.id !== groupID) {
                    groupSelect += `<option value="${my.id}">${my.name}</option>`;
                }
            }
            document.querySelector('#inputTaskGroup').innerHTML = groupSelect;
            $('#newItemModal').modal('show');
        });

        $('#editTaskModal #saveChanges').submit(this.saveChanges.bind(this));
        //document.querySelector('#inputTaskGroup');
    }
    editTaskModal(e) {
        let taskID = parseInt(e.target.parentElement.getAttribute('data-id'));
        this.currentlyEditing = taskID
        let taskGroupName;
        let taskGroupId;
        let taskStartDateString = '';
        let taskEndDateString = '';
        if (tasks[taskID].startDate) {
            let taskStartDate = new Date(tasks[taskID].startDate);
            taskStartDateString = `${taskStartDate.getFullYear()}-${(taskStartDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}-${taskStartDate.getDate()}`;
            let taskEndDate = new Date(tasks[taskID].endDate);
            taskEndDateString = `${taskEndDate.getFullYear()}-${(taskEndDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}-${taskEndDate.getDate()}`;
        }
        if (tasks[taskID].parent) {
            taskGroupName = tasks[tasks[taskID].parent].name;
            taskGroupId = tasks[taskID].parent;
        } else {
            taskGroupName = 'none';
            taskGroupId = 'null';
        }

        let groupSelect = `<option selected value="${taskGroupId}">${taskGroupName}</option>`;

        for (let i = 0; i < tasks.printedItemArray.length; i++) {
            let my = tasks.printedItemArray[i];
            if (my.type === 'group' && my.id !== taskGroupId) {
                groupSelect += `<option value="${my.id}">${my.name}</option>`;
            }
        }
        document.querySelector('#editTaskModal #inputEditTaskName').value = tasks[taskID].name;
        document.querySelector('#editTaskModal #inputEditTaskColor').value = tasks[taskID].color;
        document.querySelector('#editTaskModal #inputEditTaskAssignment').value = tasks[taskID].assignment;
        document.querySelector('#editTaskModal #inputEditTaskPercentCompleted').value = tasks[taskID].percentComplete;
        document.querySelector('#editTaskModal #inputEditTaskStartDate').value = taskStartDateString;
        document.querySelector('#editTaskModal #inputEditTaskEndDate').value = taskEndDateString;
        document.querySelector('#editTaskModal #inputEditTaskGroup').innerHTML = groupSelect;

        $('#editTaskModal').modal('show');
    }
    saveChanges(e) {
        e.preventDefault();
        let id = this.currentlyEditing;
        tasks[id].name = document.querySelector('#editTaskModal #inputEditTaskName').value;
        tasks[id].color = document.querySelector('#editTaskModal #inputEditTaskColor').value;
        tasks[id].assignment = document.querySelector('#editTaskModal #inputEditTaskAssignment').value;
        tasks[id].percentComplete = document.querySelector('#editTaskModal #inputEditTaskPercentCompleted').value;
        console.log(document.querySelector('#editTaskModal #inputEditTaskStartDate').value)

        function validateDate(testdate) {
            var date_regex = /^((0|1)\d{1})-((0|1|2)\d{1})-((19|20)\d{2})/;
            return date_regex.test(testdate);
        }
        console.log(document.querySelector('#editTaskModal #inputEditTaskStartDate').value)

        if (document.querySelector('#editTaskModal #inputEditTaskStartDate').value && document.querySelector('#editTaskModal #inputEditTaskEndDate').value) {
            tasks[id].startDate = new Date(document.querySelector('#editTaskModal #inputEditTaskStartDate').value + 'PST');
            tasks[id].endDate = new Date(document.querySelector('#editTaskModal #inputEditTaskEndDate').value + 'PST');
        }

        $('#editTaskModal').modal('hide');

        let selectedGroupID;

        if (document.querySelector('#editTaskModal #inputEditTaskGroup').value == 'null') {
            selectedGroupID = null
        } else {
            selectedGroupID = parseInt(document.querySelector('#editTaskModal #inputEditTaskGroup').value)
        }

        if (selectedGroupID !== tasks[id].parent) {
            tasks.move(id, 'inside', selectedGroupID);
        } else {
            tasks.print();
        }
    }
}
let taskListActions = new TaskListActions;

newTaskForm.createTaskSubmit.addEventListener('submit', function (e) {
    e.preventDefault();
    newTaskForm.submit()
}); //new task form submit

newGroupForm.createGroupSubmit.addEventListener('submit', function (e) {
    e.preventDefault()
    newGroupForm.submit()
}); //new task form submit

ui.taskList.addEventListener('click', function (e) {
    inlineEdit.edit(e);
})
ui.taskList.addEventListener('click', tasks.collapse.bind(tasks));
