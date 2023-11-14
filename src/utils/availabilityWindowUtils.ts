import { DateTime } from "luxon";
import { Availability, AvailabilityWithDates } from "../types";

// Anchors dates for weekly availability windows based on how much into the future we want to generate slots
export function anchorAvailabilityWindowsToDates(
    now: DateTime,
    calendarLengthDays: number,
    availabilityWindows: Availability[]
) {
    const availabilityWindowsWithDates: AvailabilityWithDates[] = [];

    for (let i = 0; i < calendarLengthDays; i++) {
        const date = now.plus({ days: i }).startOf("day"); // Truncate the time to the start of the day so that later additions of hours and minutes go smoothly
        const weekday = date.weekday;

        // Find the availability windows for the current day.
        // We need to check all the availability windows because the one day might have multiple availability windows
        for (const availabilityWindow of availabilityWindows) {
            if (availabilityWindow.from.weekday === weekday) {
                // Difference between the start and end date of the availability window
                const endDateDifference =
                    availabilityWindow.to.weekday -
                    availabilityWindow.from.weekday;

                const availabilityWindowStartDate = date.plus({
                    hours: availabilityWindow.from.hour,
                    minutes: availabilityWindow.from.minute || 0,
                });
                const availabilityWindowEndDate = date.plus({
                    days: endDateDifference, // Add possible difference between the start and end date of the availability window
                    hours: availabilityWindow.to.hour,
                    minutes: availabilityWindow.to.minute || 0,
                });
                availabilityWindowsWithDates.push({
                    ...availabilityWindow,
                    startDate: availabilityWindowStartDate,
                    endDate: availabilityWindowEndDate,
                });
            }
        }
    }

    return availabilityWindowsWithDates;
}
