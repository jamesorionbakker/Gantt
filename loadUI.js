document.addEventListener('scroll', function (e) {
    ui.tasks.style.left = `${window.pageXOffset + 75}px`;
    ui.calenderGrid.style.top = `${window.pageYOffset}px`;
    ui.monthBar.style.top = `${window.pageYOffset}px`;
    ui.taskHeader.style.top = `${window.pageYOffset}px`;
})

let dayArr = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
let monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let displayedDateArray = []

function printCalender() {

    displayedDateArray = [];
    let calenderGridItem = '';
    let monthBarContent = '';
    let daysInCurMonth = 0;
    for (let i = 0; i < ui.daysToLoad; i++) {
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

        calenderGridItem += `<div class="grid-item ${dayType}" style="width:${ui.gridWidth}px;position:absolute; top: 0px; left: ${ui.gridWidth * i}px"><span class="date-num">${currentDate.getDate()}</span><span class="day-char">${dayArr[currentDate.getDay()]}</span></div>`;

        if (tomorrowsDate.getDate() == 1 || i === 364) {
            monthBarContent += `<div class="month" style="width:${ui.gridWidth * (daysInCurMonth + 1)}px; left:${(ui.gridWidth * i) - daysInCurMonth * ui.gridWidth}px">${monthArr[currentDate.getMonth()]} ${currentDate.getFullYear()}</div>`
            daysInCurMonth = 0;
        }
        if (currentDate.getMonth() === tomorrowsDate.getMonth()) {
            daysInCurMonth++
        }
        displayedDateArray.push(currentDate.getTime());

    }

    ui.calenderGrid.insertAdjacentHTML('beforeend', calenderGridItem);
    ui.monthBar.insertAdjacentHTML('beforeend', monthBarContent);
}

printCalender();
store.get();
tasks.print();











//if(day.type === today){getDrink(cocktail,3)};









