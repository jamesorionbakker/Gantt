'use strict';

let ui = new class UI {
    tasks = document.querySelector('.tasks');
    taskList = document.querySelector('.task-list');
    calenderGrid = document.querySelector('.calender-grid');
    monthBar = document.querySelector('.month-bar');
    taskHeader = document.querySelector('.task-header');
    calenderContainer = document.querySelector('.calender-container');
    calenderItemContainer = document.querySelector('.calender-item-container');
    calenderTargetContainer = document.querySelector('.calender-target-container');
    taskListTargetContainer = document.querySelector('.task-list-target-container');
    ganttLineCreate = document.querySelector('.gantt-line-create');
    calenderTopOffset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--month-bar-height')) + (parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--day-date-char-height')) * 2);
}

const store = new class Store {
    storageName = 'gantt'

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

const newTaskForm = new class NewTaskForm {
    modal = document.querySelector('#newItemModal');
    errorDiv = document.querySelector('#newTaskFormError');
    name = document.querySelector('#inputTaskName');
    color = document.querySelector('#inputTaskColor');
    startDate = document.querySelector('#inputTaskStartDate');
    endDate = document.querySelector('#inputTaskEndDate');
    group = document.querySelector('#inputTaskGroup');
    assignment = document.querySelector('#inputTaskAssignment');
    percentCompleted = document.querySelector('#inputTaskPercentCompleted');
    createTaskSubmit = document.querySelector('#createNewTask');
    sampletext = 'sample';

    submit() {
        if (this.isValid()) {
            let newItem = new Item(),
                position, referenceItemID;

            if (this.group.value === 'none') {
                referenceItemID = (tasks.last) ? tasks.last : 'first'; //if tasks is empty reference first, else reference last item.
                position = 'after';
            } else {
                referenceItemID = tasks[this.group.value].id;
                position = 'inside';
            }

            newItem.id = Date.now();
            newItem.type = 'task';
            newItem.name = this.name.value;
            newItem.color = this.color.value;
            newItem.startDate = dateFloor(this.startDate.value)
            newItem.endDate = dateFloor(this.endDate.value)
            newItem.assignment = this.assignment.value;
            newItem.percentComplete = this.percentCompleted.value;

            tasks.insert(newItem, position, referenceItemID);

            this.name.value = null;
            this.group.selectedIndex = null;
            this.assignment.selectedIndex = null;
            this.color.value = defaultColor;
            this.percentCompleted.value = null;
            this.startDate.value = null
            this.endDate.value = null;
            $('#newItemModal').modal('hide');
        }
    }
    alert(msg) {
        this.errorDiv.innerHTML = `<div class="alert alert-primary" role="alert">${msg}</div>`;
        setTimeout(() => {
            this.errorDiv.innerHTML = '';
        }, 2000);
    }
    isValid() {
        if (!/\S+/.test(this.name.value)) { //validate name field
            this.alert('Please Enter a Task Name');
            return false;
        } else if (new Date(this.startDate.value).getTime() >= new Date(this.endDate.value).getTime()) { //validate date fields
            this.alert(`Start Date must be before Stop Date`);
        } else {
            return true;
        }
    }
    populate() {
        let response = `<option value="none">None</option>`;
        for (let i = 0; i < tasks.printedItemArray.length; i++) {
            let my = tasks.printedItemArray[i];
            if (my.type === 'group') {
                response += `<option value="${my.id}">${my.name}</option>`;
            }
        }
        this.group.innerHTML = response;
    }
}

const newGroupForm = new class NewGroupForm {
    modal = document.querySelector('#newItemModal');
    errorDiv = document.querySelector('#newGroupFormError');
    name = document.querySelector('#inputGroupName');
    color = document.querySelector('#inputGroupColor');
    createGroupSubmit = document.querySelector('#createNewGroup');

    submit() { //REFACTORED 3/7/21
        if (!/\S+/.test(this.name.value)) {
            this.alert('Please Enter a Name')
        } else {
            let newItem = new Item()
            newItem.id = Date.now();
            newItem.type = 'group';
            newItem.name = this.name.value;
            newItem.color = this.color.value;
            tasks.insert(newItem, 'after', tasks.last);
            this.name.value = null;
            this.color.value = defaultColor;
            $('#newItemModal').modal('hide');
        }
    }
    alert(msg) {
        this.errorDiv.innerHTML = `<div class="alert alert-primary" role="alert">${msg}</div>`;
        setTimeout(() => {
            this.errorDiv.innerHTML = '';
        }, 2000);
    }
}

let inlineEdit = new class InlineEdit { //REFACTORED 3/6/2021
    edit(e) {
        let targetProperty = e.target.getAttribute('data-property');
        let targetId = parseInt(e.target.getAttribute('data-id'));

        if ([...e.target.classList].includes('editable')) {
            let originalText = e.target.innerHTML;
            e.target.innerHTML = `<input class="inline-edit" id="beingEdited" type="text" value="${originalText}"></input>`
            let inputField = e.target.firstElementChild;

            const saveChanges = (e2) => {
                if (e2.type === 'keyup' && !(e2.key === 'Enter' || e2.keyCode === 13)) { //check for return key
                    return;
                }
                if (e2.type === 'mousedown' && e2.target === inputField) { //check for click out
                    return;
                }
                let inputVal = inputField.value;
                if (inputVal !== originalText) {
                    if ([...e.target.classList].includes('percentage')) { //handle special case of percentage field
                        if (/^\d{1,3}\D+/) {
                            console.log('match');
                            inputVal = inputVal.match(/\d+/);
                        }
                        if (/\D/.test(inputVal)) {
                            inputVal = originalText;
                        }
                        inputVal = Math.min(parseInt(inputVal), 100);
                    }
                    tasks[targetId][targetProperty] = inputVal;
                    tasks.print()
                }
                e.target.innerHTML = originalText;
                document.removeEventListener('mousedown', saveChanges);
                inputField.removeEventListener('keyup', saveChanges);
            }
            document.addEventListener('mousedown', saveChanges);
            inputField.addEventListener('keyup', saveChanges);
        }
    }
}

let guiReschedule = new class GuiReschedule { //refactored 3/7/21
    constructor() {
        $(document.body).on('mouseenter', '.gantt-line', this.showGanttHandles.bind(this));
        $(document.body).on('mouseleave', '.gantt-line', this.hideGanttHandles.bind(this));
        $(document.body).on('mousedown', '.gantt-line', this.mouseDown.bind(this));
        $(document.body).on('mouseup', this.mouseUp.bind(this));
        $(document.body).on('mousemove', this.mouseDrag.bind(this));
    }
    states = { //event states
        dragging: false,
        hover: false,
        mousedown: false
    }
    target = {} //active dom element object
    click = {} //click event object
    showGanttHandles(e) {
        if (!this.states.mousedown) {
            e.target.firstChild.style.visibility = 'visible';
            e.target.lastChild.style.visibility = 'visible';
            this.states.hover = true;
        }
    }
    hideGanttHandles(e) {
        if (this.states.hover && !this.states.mousedown) {
            e.target.firstChild.style.visibility = 'hidden';
            e.target.lastChild.style.visibility = 'hidden';
            this.states.hover = false;
        }
    }
    mouseDown(e) {
        guiSchedule.locked = true;
        this.target.left = parseInt(e.target.style.left);
        this.target.width = parseInt(e.target.style.width);
        this.target.element = e.target;
        this.target.startTime = parseInt(e.target.getAttribute('data-start-time'));
        this.target.endTime = parseInt(e.target.getAttribute('data-end-time'));
        this.click.x = e.clientX;
        if (e.offsetX < parseInt(e.target.style.width) / 2) {
            this.target.sideToMove = 'left'
            e.target.firstChild.style.backgroundColor = 'rgba(0,0,0, .3)';
        } else {
            this.target.sideToMove = 'right'
            e.target.lastChild.style.backgroundColor = 'rgba(0,0,0, .3)';
        }
        this.states.mousedown = true;
    }
    mouseDrag = (e) => {
        if (this.states.mousedown) {
            if (Math.abs(this.click.x - e.clientX) < gridWidth / 2) { //only trigger move if user moves mouse at least 1/2 grid width
                return;
            }
            this.states.dragging = true;
            let curX = e.clientX
            if (this.target.sideToMove === 'left') {
                let leftGridPos = this.target.left - (Math.ceil((this.click.x - curX) / gridWidth) * gridWidth);
                let startDateDiff = Math.floor((curX - this.click.x) / gridWidth);
                let origStartDate = new Date(this.target.startTime);
                this.newDate = new Date(origStartDate.getTime() + (startDateDiff * oneDay));
                this.target.element.style.left = `${leftGridPos}px`;
                this.target.element.style.width = `${this.target.width + (Math.ceil((this.click.x - curX) / gridWidth) * gridWidth)}px`
                this.dateModified = 'startDate';

                let toolTip = this.target.element.querySelector(`.handle-left .tooltip-text`);
                toolTip.style.visibility = 'visible';
                toolTip.innerHTML = this.newDate;
            }
            if (this.target.sideToMove === 'right') {
                let endDateDiff = Math.floor((curX - this.click.x) / gridWidth);
                let origEndDate = new Date(this.target.endTime);
                this.newDate = new Date(origEndDate.getTime() + (endDateDiff * oneDay));
                this.target.element.style.width = `${this.target.width - (Math.ceil((this.click.x - curX) / gridWidth) * gridWidth)}px`
                this.dateModified = 'endDate';

                let toolTip = this.target.element.querySelector(`.handle-right .tooltip-text`);
                toolTip.style.visibility = 'visible';
                toolTip.innerHTML = this.newDate;
            }
        }
    }
    mouseUp(e) {
        this.states.mousedown = false;
        if (this.states.dragging) {
            guiSchedule.locked = false;
            tasks.modifyDate(this.target.element.id, this.dateModified, this.newDate);
            this.target.element.firstChild.style.backgroundColor = 'rgba(0,0,0, .1)';
            this.target.element.lastChild.style.backgroundColor = 'rgba(0,0,0, .1)';
            this.states.dragging = false

        }
    }
}

class Item {
    constructor() {
        this.id = Date.now();
        this.previous = null
        this.next = null
        this.firstChild = null
        this.lastChild = null
        this.parent = null
        this.drives = [];
        this.drivenBy = [];
        this.expanded = true;
        this.name = ''
        this.type = ''
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
        if (data.items.length < 1) {
            this.first = null;
            this.last = null;
        }
        for (let i = 0; i < data.items.length; i++) {
            let currIt = data.items[i]
            if (currIt.previous === null && currIt.parent === null) {
                this.first = currIt.id
            }
            this[currIt.id] = currIt;
        }
        this.saveArray = [];
    }
    print(item) {
        console.log('printing');
        this.printedItemArray = []
        this.saveArray = [];
        ui.taskList.innerHTML = this.compileTaskList();
        this.crawlDependencies();
        this.setDateRange();
        ui.calenderItemContainer.innerHTML = this.printGanttItems();
        newTaskForm.populate();
        this.printGanttTargets();
        this.printTaskTargets();
        this.printDependencies();
        store.set({
            'items': this.saveArray,
        })
    }
    /* REFACTORED 3/7
    rebuilt function to simplify traversing tree
    visibility state stored in task object
    */

    compileTaskList(item = 'first', visible = true) { //preorder-traverses tree and generates html of task lists.  Also generates an ordered array of tasks for creating chart.
        if (!this.first) {
            return '';
        }
        let my = (item === 'first') ? this[this.first] : this[item]
        this.saveArray.push(my);

        let collapseArrow = (my.expanded) ? 'fas fa-caret-down' : 'fas fa-caret-right';
        if (visible) {
            this.printedItemArray.push(my);
        }
        let childrenVisible = (visible && my.expanded) ? true : false;
        
        let response = '';
        if (my.type === 'group') {
            response += `<div draggable="true" id="${my.id}" class="task-group-title"><div data-id="${my.id}" class="collapse-arrow"><i data-id=${my.id} class="${collapseArrow} collapse-icon"></i></div><span data-id="${my.id}" data-property="name" class="editable semi-bold">${my.name} <em>${my.id}</span><div class="task-progress"><span data-id="${my.id}" data-property="percentComplete" class="editable percentage">${my.percentComplete}%</span></div>
            <div class="task-assignment"><span data-id="${my.id}" data-property="assignment" class="editable text">${my.assignment}</span></div><div class="task-actions" data-id="${my.id}"><i class="fas fa-plus"></i><i class="fas fa-trash-alt"></i></div></div>`
        }
        if (my.type === 'task') {
            response += `<div draggable="true" id="${my.id}" class="task-li"><span data-id="${my.id}" data-property="name" class="editable ">${my.name} <em>${my.id}</em></span><div class="task-progress"><span data-id="${my.id}" data-property="percentComplete" class="editable percentage">${my.percentComplete}%</span></div>
            <div class="task-assignment"><span data-id="${my.id}" data-property="assignment" class="editable text">${my.assignment}</span></div><div class="task-actions" data-id="${my.id}"><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i></div></div>`
        }
        if (my.firstChild) {
            response += `<div data-group-container="${my.id}" style="display:${(my.expanded) ? 'block' : 'none'}" class="task-group-container">`
            response += this.compileTaskList(my.firstChild, childrenVisible) + `</div>`;
        }
        if (my.next) {
            response += this.compileTaskList(my.next, visible)
            return response;
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

    printGanttItems() {
        let response = '';
        this.printedItemArray.forEach((my, i) => {
            //calculate X position
            let taskStartTime = new Date(my.startDate).getTime();
            let msFromCalStartDate = taskStartTime - calenderStartDate.getTime();
            let pixelsLeft = Math.floor((msFromCalStartDate / oneDay) * gridWidth);
            //calculate Y position
            let pixelsTop = ui.calenderTopOffset + (gridHeight * i);
            //calculate width
            let taskEndTime = new Date(my.endDate).getTime();
            let msTaskLength = taskEndTime - taskStartTime;
            let pixelWidth = Math.floor((msTaskLength / oneDay) * gridWidth);

            response += `<div id="${my.id}" style="top: ${pixelsTop}px;left: ${pixelsLeft}px;width: ${pixelWidth}px; background-color: ${my.color}" data-start-time="${taskStartTime}" data-end-time="${taskEndTime}" data-desc="gantt-line-for-${my.id}"class="gantt-line" data-id="${my.id}"><div class="handle-left tip" ><span class="tooltip-text">Tooltip text</span></div><div style="left: ${- 25}px" class="dependency-link"><i data-type="drivenBy" data-id="${my.id}" class="dependency-link fas fa-plus"></i></div><div style="left: ${pixelWidth}px" class="dependency-link"><i data-type="drives" data-id="${my.id}" class="dependency-link fas fa-plus"></i></div><div class="handle-right tip"><span class="tooltip-text">Tooltip text</span></div></div>`
        })
        return response;
    }

    crawlDependencies() {
        this.printedItemArray.forEach((my) => {
            function fixDates(id) {
                console.log('fixing dates');

                tasks[id].drives.forEach((drivenId) => {
                    let driverEndTime = new Date(tasks[id].endDate).getTime();
                    let drivenStartTime = new Date(tasks[drivenId].startDate).getTime();
                    let drivenEndTime = new Date(tasks[drivenId].endDate).getTime();

                    console.log(drivenStartTime);
                    console.log(driverEndTime);

                    if (drivenStartTime < driverEndTime) {
                        let newStartDate = new Date(driverEndTime);

                        let daysToShift = Math.floor(Math.abs(drivenStartTime - newStartDate.getTime()) / 86400000);

                        let newEndDate = new Date(drivenEndTime);
                        newEndDate.setDate(newEndDate.getDate() + daysToShift);

                        console.log(newStartDate);

                        tasks[drivenId].startDate = newStartDate;
                        tasks[drivenId].endDate = newEndDate;

                    }

                })

            }

            if (my.drives.length > 0) {
                fixDates(my.id);
            };
        })
    }
    printDependencies() {
        let response = '';
        this.printedItemArray.forEach((my, i) => {
            if (my.drives) {
                my.drives.forEach((drivenID, j) => {
                    if (tasks[drivenID].startDate) {
                        // console.log(`${my.id} drives ${this[my.drives].id}`);
                        let taskStartTime = new Date(my.startDate);
                        let msFromCalStartDate = taskStartTime.getTime() - calenderStartDate.getTime();
                        let driverLeft = Math.floor((msFromCalStartDate / 86400000) * gridWidth);

                        //calculate Y position
                        let driverTop = ui.calenderTopOffset + (gridHeight * i);

                        //calculate width
                        let taskEndTime = new Date(my.endDate);
                        let msTaskLength = taskEndTime.getTime() - taskStartTime.getTime();
                        let driverWidth = Math.floor((msTaskLength / 86400000) * gridWidth);
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
                            line.originY = driverTop + (gridHeight / 2) + 4;
                            line.destX = driven.left + (parseInt(driven.element.style.width) / 3) + (5 * j);
                            line.destY = driven.top;
                            line.width = line.destX - line.originX;
                            line.height = Math.abs(line.destY - line.originY + 8);

                            response += `<div class="dependency-line" style="top: ${line.originY}px; left:${line.originX}px; width: ${line.width}px; height:${line.height}px; border-top: 2px solid ${tasks[drivenID].color}; border-right: 2px solid ${tasks[drivenID].color}; border-top-right-radius: 5px;"></div>`;
                        }
                        if (driverTop > driven.top) {
                            console.log('inverted');
                            line.originX = driverLeft + driverWidth;
                            line.originY = driverTop + (gridHeight / 2) + 4;
                            line.destX = driven.left + (parseInt(driven.element.style.width) / 3) + (5 * j);
                            line.destY = driven.top;
                            line.width = line.destX - line.originX;
                            line.height = Math.abs(line.destY - line.originY) - gridHeight;

                            response += `<div class="dependency-line" style="top: ${line.originY - line.height}px; left:${line.originX}px; width: ${line.width}px; height:${line.height}px; border-bottom: 2px solid ${tasks[drivenID].color}; border-right: 2px solid ${tasks[drivenID].color}; border-bottom-right-radius: 5px;"></div>`;
                        }
                    }
                })
            }
        })
        document.querySelector('.dependency-container').firstElementChild.innerHTML = response;
    }
    printGanttTargets() {
        let targets = '';
        this.printedItemArray.forEach((my, i) => {
            targets += `<div data-start-date="${my.startDate}" data-end-date="${my.endDate}" data-type="${my.type}" data-target="${my.id}" data-desc="gantt-line-target-for-${my.id}" style="width: ${gridWidth * daysToLoad}px; top: ${i * gridHeight}px" class="new-gantt-line-target"></div>`
        })
        ui.calenderTargetContainer.firstElementChild.innerHTML = targets;
    }
    printTaskTargets() {
        let targets = `<div class="task-list-target" data-id="${this.first}" data-type="first" style="margin-top: 0px;"></div>`;
        this.printedItemArray.forEach((my) => {
            targets += `<div class="task-list-target" data-id="${my.id}" data-type="${my.type}"></div>`
        })
        ui.taskListTargetContainer.innerHTML = targets;
    }
    insert(newItem, position = 'after', referenceID = 'last') { //REFACTORED 3/7/21
        if (!this.hasOwnProperty(referenceID)) {
            console.log('referenced item does not exist');
            return;
        }
        let referenceObj = this[referenceID];
        if (!this.first) { //list is empty, add item
            this.first = newItem.id;
        } else { //list in not empty insert accordingly
            if (position === 'after') {
                if (referenceObj.next) {
                    this[referenceObj.next].previous = newItem.id; //displace a middle child
                } else {
                    if (referenceObj.parent) { //displace last child
                        this[referenceObj.parent].lastChild = newItem.id;
                    }
                    this.last = newItem.id; //displace last item
                }
                newItem.next = referenceObj.next;
                this[referenceID].next = newItem.id;
                newItem.previous = referenceID;
                newItem.parent = referenceObj.parent;
            } else if (position === 'before') {
                if (referenceObj.previous) {
                    this[referenceObj.previous].next = newItem.id;
                    newItem.previous = this[referenceObj.previous].id //displace a middle child
                } else if (referenceObj.parent) { // displace a firstChild
                    this[referenceObj.parent].firstChild = newItem.id;
                } else { //displace first item
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
                    } else { //if there are children add to end
                        newItem.previous = this[referenceID].lastChild;
                        this[this[referenceID].lastChild].next = newItem.id;
                    }
                    newItem.parent = referenceID;
                    this[referenceID].lastChild = newItem.id;
                }
            }
        }
        this[newItem.id] = newItem;
        tasks.print();
    }
    delete(itemID, print = true) { //REFACTORED 3/7/21
        if (itemID === 'all') {
            this.first = null;
            tasks.print();
            return;
        }
        let item = this[itemID];
        let previous = item.previous;
        let next = item.next;
        let parent = item.parent;

        if (previous && next) { //middle child or middle root
            console.log('middle item');
            this[previous].next = next;
            this[next].previous = previous
        } 
        else if (parent) { //only, first or last child
            if (!previous && !next) { //only child
                console.log('only child');
                this[parent].firstChild = null;
                this[parent].lastChild = null;
            }
            else if (!next) { //last child
                console.log('last child');
                this[parent].lastChild = previous;
                this[previous].next = null;
            }
            else { //first child
                console.log('first child');
                this[parent].firstChild = next;
                this[next].previous = null;
            }
        }
        else { //first or last root
            if(!next && !previous){ //only root
                console.log('only root');
                this.first = null;
            }
            else if(next){ //first root
                console.log('first root');
                this.first = next;
                this[next].previous = null
            }
            else { //last root
                console.log('last root');
                this.last = previous;
                this[previous].next = null;
            }
        }
        if (print) {
            this.print();
        }
    }
    move(itemID, position = 'after', referenceID) { //REFACTORED 3/7/21
        let item = this[itemID];
        this.delete(itemID, false);
        item.previous = null;
        item.next = null;
        item.parent = null;
        this.insert(item, position, referenceID);
    }
    modifyDate(id, property, dateArg) {
        let startTime = (property === 'startDate') ? new Date(dateArg).getTime() : new Date(this[id].startDate).getTime()
        let endTime = (property === 'endDate') ? new Date(dateArg).getTime() : new Date(this[id].endDate).getTime()
        if(property === 'startDate'){
            if(startTime < endTime){
                this[id].startDate = dateFloor(dateArg);
            }
            else {
                this[id].startDate = dateFloor(new Date(endTime - oneDay))
            }
        }
        else {
            if(startTime < endTime){
                this[id].endDate = dateFloor(dateArg);
            }
            else {
                this[id].endDate = dateFloor(new Date(startTime + oneDay))
            }
        }
        this.print();
    }
    toggle(e) { //REFACTORED FROM 59 LINES LOL
        let my = this[e.target.getAttribute('data-id')];
        my.expanded = (my.expanded) ? false : true;
        this.print();
    }
}

let guiSchedule = new class GUISchedule {
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
        this.startDragClientY = ''
        ui.calenderContainer.addEventListener('mouseover', this.mouseoverEvent);
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
            ui.ganttLineCreate.style.left = (Math.floor(e.offsetX / gridWidth) * gridWidth) + 'px';
            ui.ganttLineCreate.style.width = gridWidth + 'px';
            ui.ganttLineCreate.style.top = e.target.style.top;
            document.removeEventListener('mouseup', this.releaseEvent);
            this.leftToolTip = ui.ganttLineCreate.firstChild;
            this.rightToolTip = ui.ganttLineCreate.lastChild;
            this.left = parseInt(ui.ganttLineCreate.style.left);
            this.leftToolTip.innerHTML = gridToDate(this.left);
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
        this.startDragClientY = e.clientY;
        this.modifiedItem = e.target.getAttribute('data-target');
        document.removeEventListener('mousemove', this.mouseMoveEvent);
        document.addEventListener('mousemove', this.dragEvent);
    }
    drag(e) {
        let width = (0 + (Math.ceil((Math.abs(e.clientX - this.startDragClientX)) / gridWidth))) * gridWidth;
        let leftOffset = ((Math.ceil((Math.abs(e.clientX - this.startDragClientX)) / gridWidth)) - 1) * gridWidth;
        if (e.clientX - this.startDragClientX < 0) {
            ui.ganttLineCreate.style.left = (this.startDragLeft - leftOffset) + 'px';
        }
        this.right = (parseInt(ui.ganttLineCreate.style.width) + this.left);
        this.rightToolTip.style.visibility = 'visible'
        this.rightToolTip.innerHTML = gridToDate(this.right);

        ui.ganttLineCreate.style.width = width + 'px';
        document.addEventListener('mouseup', this.releaseEvent);
        ui.calenderTargetContainer.removeEventListener('mouseout', this.mouseOutEvent);
        ui.calenderContainer.removeEventListener('mouseover', this.mouseoverEvent);
        document.querySelector("[data-desc='gantt-line-for-" + this.modifiedItem + "']").style.display = 'none';

    }
    release() {
        let newLeft = parseInt(ui.ganttLineCreate.style.left);
        let newRight = newLeft + parseInt(ui.ganttLineCreate.style.width);

        tasks[this.modifiedItem].startDate = gridToDate(newLeft)
        tasks[this.modifiedItem].endDate = gridToDate(newRight)
        this.rightToolTip.style.visibility = 'hidden'

        document.removeEventListener('mousemove', this.dragEvent);
        ui.calenderTargetContainer.addEventListener('mouseout', this.mouseOutEvent);
        ui.calenderTargetContainer.removeEventListener('mousedown', this.mouseDownEvent);
        ui.ganttLineCreate.style.display = 'none';
        ui.calenderContainer.addEventListener('mouseover', this.mouseoverEvent);

        tasks.print();

    }
}

let rearrangeList = new class RearrangeList {
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
    let defTask = new Item();
    defTask.name = 'This is a sample task';
    defTask.type = 'task'
    console.log('there is nothing in storage');
    tasks = new Tasks({items: [defTask]})
}

let taskListActions = new class TaskListActions {
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
            tasks[id].startDate = dateFloor(document.querySelector('#editTaskModal #inputEditTaskStartDate').value);
            tasks[id].endDate = dateFloor(document.querySelector('#editTaskModal #inputEditTaskEndDate').value);
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

class Dependency {
    constructor() {
        this.isDragging = false;
        this.dragType = ''
        this.createDependency = document.querySelector('#createDependency');
        $('.calender-container').on("mouseenter mouseleave", '.gantt-line', this.icon.bind(this));
        $('.calender-container').on("mousedown", 'div.dependency-link', this.mouseDown.bind(this));
        $('.calender-container').mousemove(this.drag.bind(this));
        $('.calender-container').mouseup(this.mouseUp.bind(this));

    }
    mouseDown(e) {
        this.isDragging = true;
        this.dragType = e.target.getAttribute('data-type');
        console.log(this.dragType);
        this.startingElementId = e.target.getAttribute('data-id');
        this.startingElement = $(`[data-desc="gantt-line-for-${this.startingElementId}"]`)
        document.querySelectorAll('div.dependency-link').forEach((element) => {
            element.style.display = 'none'
        })
        guiSchedule.locked = true;

    }
    drag(e) {
        if (this.isDragging) {
            let start = {};
            $('.calender-container').on("mouseenter mouseleave", '.gantt-line', this.onTarget.bind(this));

            start.x = this.startingElement.offset().left + (this.startingElement.width() / 2);
            start.y = this.startingElement.offset().top;
            let cur = {};
            cur.x = e.pageX;
            cur.y = e.clientY;
            let color = tasks[this.startingElementId].color;

            console.log(Math.abs(start.x - cur.x) + 'px')

            this.createDependency.style.width = Math.abs(start.x - cur.x) + 'px'
            this.createDependency.style.height = Math.abs(start.y - cur.y) + 'px'
            this.createDependency.style.border = `2px solid ${color}`;
            this.createDependency.style.display = 'block';


            if (cur.x < start.x) { //left
                this.createDependency.style.left = cur.x + 'px';
                this.createDependency.style.left = cur.x + 'px';
                this.createDependency.style.borderLeft = 'none';
            }
            if (cur.x > start.x) { //right
                this.createDependency.style.left = start.x + 'px';
                this.createDependency.style.borderRight = 'none';
            }
            if (cur.y < start.y) { //up
                this.createDependency.style.top = cur.y + 'px';
                this.createDependency.style.borderBottom = 'none';
            }
            if (cur.y > start.y) { //down
                this.createDependency.style.top = start.y + 'px';
                this.createDependency.style.borderTop = 'none';
            }

        }
    }
    onTarget(e) {
        if (this.isDragging) {
            this.targetId = e.target.getAttribute('data-id');
            if (this.targetId === this.startingElementId) {
                return;
            }
            if (e.type === 'mouseenter') {
                e.target.style.border = '3px dashed #555';

            } else {
                e.target.style.border = '';
            }
        }

    }
    mouseUp(e) {
        if (this.isDragging) {
            this.createDependency.style.display = 'none';
            this.targetId = e.target.getAttribute('data-id');

            if (e.target.className === 'gantt-line') {
                if (this.targetId !== this.startingElementId) {
                    e.target.style.border = '';
                    this.addDependency();

                }


            }
            this.isDragging = false;
            guiSchedule.locked = false;
        }

    }
    addDependency() {
        let modified = false;
        if (this.dragType === 'drives') {

            if (this.checkDependencies(tasks[this.startingElementId].drives, this.targetId) === -1) { // makes sure dependency is not duplicated, value of -1 returned if duplicate is found.
                tasks[this.startingElementId].drives.push(this.targetId);
                modified = true;
            }
            if (this.checkDependencies(tasks[this.targetId].drivenBy, this.startingElementId) === -1) { // makes sure dependency is not duplicated, value of -1 returned if duplicate is found.
                tasks[this.targetId].drivenBy.push(this.startingElementId);
                modified = true
            }
        }
        if (this.dragType === 'drivenBy') {
            if (this.checkDependencies(tasks[this.targetId].drives, this.startingElementId) === -1) { // makes sure dependency is not duplicated, value of -1 returned if duplicate is found.
                tasks[this.targetId].drives.push(this.startingElementId);
                modified = true;
            }
            if (this.checkDependencies(tasks[this.startingElementId].drivenBy, this.targetId) === -1) { // makes sure dependency is not duplicated, value of -1 returned if duplicate is found.
                tasks[this.startingElementId].drivenBy.push(this.targetId);
                modified = true;
            }
        }
        if (modified) {
            tasks.print();
        }
    }
    icon(e) {
        if (!this.isDragging) {
            if (e.type === 'mouseenter') {
                e.target.querySelectorAll('div.dependency-link').forEach((element) => {
                    element.style.display = 'block'
                })
            } else {
                e.target.querySelectorAll('div.dependency-link').forEach((element) => {
                    element.style.display = 'none'
                })
            }
        }
    }
    checkDependencies(arr, id) {
        let index = arr.findIndex(check);

        function check(currItId) {
            if (currItId === id) {
                return true;
            }
        }
        return index;
    }
}
let dependency = new Dependency;
newTaskForm.createTaskSubmit.addEventListener('submit', function (e) {
    e.preventDefault();
    newTaskForm.submit()
}); //new task form submit

newGroupForm.createGroupSubmit.addEventListener('submit', function (e) {
    e.preventDefault()
    newGroupForm.submit()
}); //new task form submit


$(ui.taskList).on('click', '.editable', inlineEdit.edit)
$(ui.taskList).on('click', '.collapse-arrow', tasks.toggle.bind(tasks))