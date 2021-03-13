const gridHeight = 33; //pixels
const gridWidth = 25;
const hoursPerGrid = 24; //number of hours per grid division
const defaultColor = '#1E77Eb';

const oneDay = 86400000;
const oneWeek = 604800000;
let calenderStartDate = new Date(Date.now() - oneWeek);
let calenderEndDate = new Date(calenderStartDate);
calenderEndDate.setDate(calenderEndDate.getDate() + 365);
let todaysDate = new Date();
let tasks;

const dateFloor = (input) => {
    const inputDate = new Date(input);
    const year = inputDate.getUTCFullYear().toString();
    let month = (inputDate.getUTCMonth() + 1).toString();
    month = month.length === 2 ? month : '0' + month;
    const date = inputDate.getUTCDate().toString();
    return `${year}-${month}-${date} 00:00`
}
const gridToDate = (grid) => {
    let gridPos = grid / ui.gridWidth;
    let newDate = new Date(calenderStartDate);
    newDate.setDate(newDate.getDate() + gridPos);
    console.log('grid to date called');
    return newDate;
}
