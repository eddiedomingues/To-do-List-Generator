import React from "react";

function getDateFromTime(time, type) {
    var dateToReturn = {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        miliseconds: 0
    }
    if (type.toLowerCase() === "miliseconds") {
        dateToReturn.miliseconds = time;
        dateToReturn.seconds = (time/1000);
        dateToReturn.minutes = (dateToReturn.seconds/60)
        dateToReturn.hours = (dateToReturn.minutes/60)
        dateToReturn.days = (dateToReturn.hours/24)
        dateToReturn.months = (dateToReturn.days/30)
        dateToReturn.years = (dateToReturn.months/12)
    }
    return dateToReturn;
}

export default getDateFromTime;