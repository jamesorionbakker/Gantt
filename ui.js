let calenderStartDate = new Date('1/10/2021');
let todaysDate = new Date(Date.now());

//const ui = {
//    tasks: document.querySelector('.tasks'),
//    taskList: document.querySelector('.task-list'),
//    calenderGrid: document.querySelector('.calender-grid'),
//    monthBar: document.querySelector('.month-bar'),
//    taskHeader: document.querySelector('.task-header'),
//    calenderContainer: document.querySelector('.calender-container'),
//    calenderItemContainer: document.querySelector('.calender-item-container'),
//    gridWidth: 25,
//    gridHeight: 33,
//    increment: 24, //number of hours per grid division
//
//    calenderTopOffset: parseInt(getComputedStyle(document.documentElement)
//        .getPropertyValue('--month-bar-height')) + (parseInt(getComputedStyle(document.documentElement)
//        .getPropertyValue('--day-date-char-height')) * 2),
//}

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

    submit() { //create new task
        if (this.validate()) {
            let currentTaskId = Date.now();

            let newItem = new Item()
            let itemToDisplace = tasks[tasks[this.group.value].firstChild];

            if (itemToDisplace) {
                newItem.previous = itemToDisplace.previous;
                newItem.next = itemToDisplace.id;
                tasks[itemToDisplace.id].previous = currentTaskId;
            }

            newItem.id = currentTaskId;
            newItem.parent = this.group.value;
            newItem.type = 'task';
            newItem.name = this.name.value;
            newItem.color = this.color.value;
            newItem.startDate = new Date(this.startDate.value + 'PST')
            newItem.endDate = new Date(this.endDate.value + 'PST')
            newItem.assignment = this.assignment.value;
            newItem.percentComplete = this.percentCompleted.value;
            tasks[currentTaskId] = newItem;
            tasks[this.group.value].firstChild = currentTaskId;

            tasks.print();

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

        } else if (!this.isValid(this.group.value, ['Select a Group', '', 'undefined'])) { //validate group field
            this.alert(`Please Select a Group`);
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
            let currentGroupId = Date.now();
            let itemToDisplace = tasks[tasks.first];
            let newItem = new Item()

            newItem.id = currentGroupId;
            newItem.previous = itemToDisplace.previous;
            newItem.next = itemToDisplace.id;
            newItem.parent = null
            newItem.type = 'group';
            newItem.name = this.name.value;
            newItem.color = this.color.value;
            tasks[currentGroupId] = newItem;
            tasks[itemToDisplace.id].previous = currentGroupId;
            tasks.first = currentGroupId

            tasks.print();

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
        console.log(this.isEditable(e));

        let targetIdStr = e.target.id;;
        let targetIdArr = targetIdStr.split(",");

        let targetProperty = targetIdArr[0];
        let targetId = parseInt(targetIdArr[1]);

        console.log(targetId + targetProperty);

        if (this.isEditable(e)) {
            let originalText = e.target.innerHTML;
            e.target.innerHTML = `<input class="inline-edit" id="beingEdited" type="text" value="${originalText}"></input>`
            let editBox = document.querySelector('#beingEdited');

            const checkForEnterKey = (e2) => {
                console.log('key pressed')
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

class Tasks {
    constructor(array) {
        for (let i = 0; i < array.length; i++) {
            let currIt = array[i]
            if (currIt.previous === null && currIt.parent === null) {
                this.first = currIt.id
            }
            this[currIt.id] = currIt;
            this.tagsToClose = 0;
        }
    }
    print(item, scope) {
        this.printedItemArray = []
        ui.taskList.innerHTML = this.compileTaskList(item, scope);
        ui.calenderItemContainer.innerHTML = this.printGanttItems();
        newTaskForm.group.innerHTML = this.populateNewTaskForm();
        this.printGanttTargets();


        console.log('Task Printed');
    }
    compileTaskList(item = 'first', scope = '') {
        let my = {};
        let response = '';
        if (item === 'first') {
            my = this[this.first];
        } else {
            my = this[item];
        }
        if (my.type === 'group') {
            response += `<div id="${my.id}" class="task-group-title"><div class="collapse-arrow"><i class="fas fa-caret-right collapse-icon"></i></div><span id="name,${my.id}" class="editable">${my.name}</span></div>`
        }
        if (my.type === 'task') {
            response += `<div id="${my.id}" class="task-li"><span id="name,${my.id}" class="editable">${my.name}</span><div class="task-progress"><span id="percentComplete,${my.id}" class="editable percentage">${my.percentComplete}%</span></div>
                                    <div class="task-assignment"><span id="assignment,${my.id}" class="editable text">${my.assignment}</span></div></div>`
        }
        this.printedItemArray.push(my);
        if (my.firstChild) {
            this.tagsToClose++;
            response += `<div class="task-group-container">`
            response += this.compileTaskList(my.firstChild, scope)
            return response;
        } else if (my.next) {
            response += this.compileTaskList(my.next, scope)
            return response;
        } else if (this[my.parent].next) {
            this.tagsToClose--;
            response += `</div>`
            response += this.compileTaskList(this[my.parent].next, scope)
            return response;
        } else {
            for (let i = 0; i < this.tagsToClose; i++) {
                response += `</div>`
            }
            this.tagsToClose = 0;
            return response;
        }
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

            response += `<div id="${my.id}" style="top: ${pixelsTop}px;left: ${pixelsLeft}px;width: ${pixelWidth}px; background-color: ${my.color}" data-start-time="${taskStartTime.getTime()}" data-end-time="${taskEndTime.getTime()}" data-desc="gantt-line-for-${my.id}"class="gantt-line"><div class="handle-left tip" ><span class="tooltip-text">Tooltip text</span></div><div class="handle-right tip"><span class="tooltip-text">Tooltip text</span></div></div>`
        }
        return response;
    }
    populateNewTaskForm() {
        let response = '';
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
            targets += `<div data-start-date="${this.printedItemArray[i].startDate}" data-end-date="${this.printedItemArray[i].endDate}" data-type="${this.printedItemArray[i].type}" data-target="${this.printedItemArray[i].id}" style="width: ${ui.gridWidth * ui.daysToLoad}px; top: ${i * ui.gridHeight}px" class="new-gantt-line-target"></div>`
        }
        ui.calenderTargetContainer.insertAdjacentHTML('beforeend', targets)
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
            console.log('mouseover');
            if (e.target.className === 'new-gantt-line-target' && e.target.getAttribute('data-type') === 'task') {
                document.addEventListener('mousemove', this.mouseMoveEvent);
                ui.calenderTargetContainer.addEventListener('mouseout', this.mouseOutEvent);
                ui.calenderTargetContainer.addEventListener('mousedown', this.mouseDownEvent);
            }
        }
    }
    mouseMove(e) {
        //console.log('mousemove')
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
        //console.log('mouseout')
        ui.ganttLineCreate.style.display = 'none';
        document.removeEventListener('mousemove', this.mouseMoveEvent); //remove listener for mouse move event
        ui.calenderTargetContainer.removeEventListener('mouseout', this.mouseOutEvent); //remove listener for mouseout
        document.removeEventListener('mousedown', this.mouseDownEvent); //remove
    }
    mouseDown(e) {
        //console.log('initdrag');
        console.log(e);
        this.startDragLeft = parseInt(ui.ganttLineCreate.style.left);
        this.startDragClientX = e.clientX;
        this.modifiedItem = e.target.getAttribute('data-target');
        document.removeEventListener('mousemove', this.mouseMoveEvent);
        document.addEventListener('mousemove', this.dragEvent);
    }
    drag(e) {
        //console.log('draggin');
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
        //console.log('released');
        let newLeft = parseInt(ui.ganttLineCreate.style.left);
        let newRight = newLeft + parseInt(ui.ganttLineCreate.style.width);

        tasks[this.modifiedItem].startDate = ui.gridToDate(newLeft)
        tasks[this.modifiedItem].endDate = ui.gridToDate(newRight)
        this.rightToolTip.style.visibility = 'hidden'

        console.log('new left= ' + newLeft + 'new right= ' + newRight);
        console.log(this.modifiedItem);

        document.removeEventListener('mousemove', this.dragEvent);
        ui.calenderTargetContainer.addEventListener('mouseout', this.mouseOutEvent);
        ui.calenderTargetContainer.removeEventListener('mousedown', this.mouseDownEvent);
        ui.ganttLineCreate.style.display = 'none';
        ui.calenderContainer.addEventListener('mouseover', this.mouseoverEvent);

        tasks.print();

    }
}

let tasks = new Tasks(itemArray);
let inlineEdit = new InlineEdit;
let ganttLine = new GanttLine;
let guiSchedule = new GUISchedule();



newTaskForm.createTaskSubmit.addEventListener('submit', function (e) {
    e.preventDefault();
    newTaskForm.submit()
}); //new task form submit

newGroupForm.createGroupSubmit.addEventListener('submit', function (e) {
    e.preventDefault()
    newGroupForm.submit()
}); //new task form submit
//let isFocused = false;
ui.taskList.addEventListener('click', function (e) {
    inlineEdit.edit(e);
})




//function showPopup(eClick, eMove, date) {
//    let popup = document.querySelector('.popup');
//    let popupHeight = parseInt(popup.style.height);
//    let popupWidth = parseInt(popup.style.width);
//    popup.style.left = `${eMove.clientX - (popupWidth / 2)}px`;
//    popup.style.top = `${eClick.clientY - (popupHeight + 20)}px`;
//    popup.innerHTML = `${date}`
//}
//
//

//function newTask() { //create new task
//    if (ui.newTaskForm.group.value === 'Select a Group') {
//        ui.newTaskForm.alert(`Please Select a Group`);
//    } else {
//        let currentTaskId = Date.now();
//        for (let i = 0; i < groupArray.length; i++) { // add current task id to selected group.children
//            if (groupArray[i].id === parseInt(ui.newTaskForm.group.value)) {
//                groupArray[i].children.push(currentTaskId);
//            }
//        }
//        taskArray.push(new Task(currentTaskId, ui.newTaskForm.name.value, ui.newTaskForm.startDate.value, ui.newTaskForm.stopDate.value, ui.newTaskForm.color.value, ui.newTaskForm.assignment.value, ui.newTaskForm.group.value, ui.newTaskForm.percentCompleted.value, 'none'));
//
//
//        tasks.print();
//    }
//}
//
//function removeAllChildNodes(parent) {
//    while (parent.firstChild) {
//        parent.removeChild(parent.firstChild);
//    }
//}

//function populateNewTaskForm() {
//    let newTaskGroupOptions = '';
//    for (let i = 0; i < groupArray.length; i++) {
//        newTaskGroupOptions += `<option value="${groupArray[i].id}">${groupArray[i].name}</option>`;
//
//    }
//    newTaskForm.group.insertAdjacentHTML('beforeend', newTaskGroupOptions)
//
//}
