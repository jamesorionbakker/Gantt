
document.addEventListener('scroll', function (e) {
    console.log('scroll');
    ui.tasks.style.left = `${window.pageXOffset + 75}px`;
    ui.calenderGrid.style.top = `${window.pageYOffset}px`;
    ui.monthBar.style.top = `${window.pageYOffset}px`;
    ui.taskHeader.style.top = `${window.pageYOffset}px`;
})


let dayArr = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
let monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let displayedDateArray = []

function printCalender() {
    if (localStorage.getItem('gantt')) {
        let itemArray = JSON.parse(localStorage.getItem('gantt')).items;
        itemArray.forEach(function (my) {
            if (my.startDate && my.type === 'task') {
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
    }
    
    daysToLoad = Math.ceil((calenderEndDate.getTime() - calenderStartDate.getTime()) / 86400000)
    
    
    
    displayedDateArray = [];
    let calenderGridItem = '';
    let monthBarContent = '';
    let daysInCurMonth = 0;
    for (let i = 0; i < daysToLoad; i++) {
        let currentDate = new Date(calenderStartDate);
        currentDate.setDate(currentDate.getDate() + i);
        let tomorrowsDate = new Date(currentDate);
        tomorrowsDate.setDate(currentDate.getDate() + 1);
        let dayType = '';
        if (currentDate.getDay() == 6 || currentDate.getDay() == 0) {
            dayType = 'weekend';
        } else {
            dayType = 'weekday'
        }
        if (currentDate.getDate() === todaysDate.getDate() && currentDate.getMonth() === todaysDate.getMonth() & currentDate.getYear() === todaysDate.getYear()) {
            dayType += ' today';
        }
        calenderGridItem += `<div class="grid-item ${dayType}" style="width:${gridWidth}px;position:absolute; top: 0px; left: ${gridWidth * i}px"><span class="date-num">${currentDate.getDate()}</span><span class="day-char">${dayArr[currentDate.getDay()]}</span></div>`;

        if (tomorrowsDate.getDate() == 1 || i === 364) {
            monthBarContent += `<div class="month" style="width:${gridWidth * (daysInCurMonth + 1)}px; left:${(gridWidth * i) - daysInCurMonth * gridWidth}px">${monthArr[currentDate.getMonth()]} ${currentDate.getFullYear()}</div>`
            daysInCurMonth = 0;
        }
        if (currentDate.getMonth() === tomorrowsDate.getMonth()) {
            daysInCurMonth++
        }
        displayedDateArray.push(currentDate.getTime());
    }
    ui.calenderGrid.innerHTML = calenderGridItem;
    ui.monthBar.innerHTML = monthBarContent;
}
printCalender();
//store.get();

async function loadData(){
    console.log('loading data');
    let response = await fetch('loadData.php');
    let json = await response.json();
    return json;
}

async function printUI(){
    let res = await loadData()
    tasks = new Tasks(res);
    tasks.print();
    addEventListeners();
    console.log(res);
}
printUI();
//tasks.print();

