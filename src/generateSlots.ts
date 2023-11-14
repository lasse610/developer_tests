import { DateTime } from "luxon";
import { type AvailabilityData, type Slots } from "./types";
import * as availabilityWindowUtils from "./utils/availabilityWindowUtils";
import * as slotUtils from "./utils/slotUtils";

export default function generateSlots(
    now: DateTime,
    availabilityData: AvailabilityData
): Slots {
    const slots: Slots = {};

    // Assing dates to the availability windows. This way we can handle availability windows that span multiple days
    const availabilityWindowsWithDates =
        availabilityWindowUtils.anchorAvailabilityWindowsToDates(
            now,
            availabilityData.calendarLengthDays,
            availabilityData.availabilityWindows
        );

    for (const availabilityWindow of availabilityWindowsWithDates) {
        // Get all the slots for the current availability window
        const allSlotsForAvailabilityWindow =
            slotUtils.getAllSlotsForAvailabilityWindow(
                availabilityWindow,
                availabilityData.durationMinutes
            );

        // Get all the bookings for the current availability window
        const bookingsForAvailabilityWindow =
            slotUtils.getBookingsForAvailabilityWindow(
                availabilityWindow,
                availabilityData.bookings
            );

        // Get the slots that are available for the current availability window. allSlots - bookings
        const availableSlotsForAvailabilityWindow =
            slotUtils.getAvailableSlotsForAvailabilityWindow(
                allSlotsForAvailabilityWindow,
                bookingsForAvailabilityWindow
            );

        // Filter out past slots and slots that are too close in the future to be bookable
        const bookableSlots = slotUtils.getBookableSlotsForAvailabilityWindow(
            now,
            availableSlotsForAvailabilityWindow,
            availabilityData.mustBookHoursBefore
        );

        if (bookableSlots.length === 0) {
            continue;
        }

        // Group the slots by date so that we can add them to the slots object. Some slots might be on different days
        const slotsForAvailabilityWindowGroupedByDate =
            slotUtils.groupSlotsByDate(bookableSlots);

        // Update the slots object with the slots for the current availability window
        for (const [date, bookableSlotsForDate] of Object.entries(
            slotsForAvailabilityWindowGroupedByDate
        )) {
            if (!slots[date]) {
                slots[date] = [];
            }
            slots[date].push(...bookableSlotsForDate);
        }
    }

    return slots;
}
