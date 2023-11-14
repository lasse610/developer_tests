import { DateTime } from "luxon";
import { TimeSlot, AvailabilityWithDates, Slots } from "../types";

// Filters out slots that are too close in the future to be bookable
export function getBookableSlotsForAvailabilityWindow(
    dateNow: DateTime,
    slots: TimeSlot[],
    mustBookHoursBefore: number
) {
    const bookableSlots: TimeSlot[] = [];

    for (const slot of slots) {
        if (slot.from < dateNow.plus({ hours: mustBookHoursBefore })) {
            continue;
        }
        bookableSlots.push(slot);
    }
    return bookableSlots;
}

// Returns all the slots for the availability window based on the slot duration
export function getAllSlotsForAvailabilityWindow(
    availabilityWindow: AvailabilityWithDates,
    slotDurationInMinutes: number
) {
    const allTimeSlotsForDate: TimeSlot[] = [];
    const availabilityWindowStart = availabilityWindow.startDate;
    const availabilityWindowEnd = availabilityWindow.endDate;

    // Time object we update to roll over the  availability window
    let timeSlotStartTime = availabilityWindowStart;
    let timeSlotEndTime = availabilityWindowStart.plus({
        minutes: slotDurationInMinutes,
    });
    while (true) {
        if (
            timeSlotStartTime >= availabilityWindowEnd ||
            timeSlotEndTime > availabilityWindowEnd
        ) {
            break;
        }

        // Add the time slot to the array and increment the timeslot start and end times
        allTimeSlotsForDate.push({
            from: timeSlotStartTime,
            to: timeSlotEndTime,
        });
        timeSlotStartTime = timeSlotStartTime.plus({
            minutes: slotDurationInMinutes,
        });
        timeSlotEndTime = timeSlotEndTime.plus({
            minutes: slotDurationInMinutes,
        });
    }
    return allTimeSlotsForDate;
}

// Groups slots by date so that we can add them to the slots object. Some slots might be on different days
export function groupSlotsByDate(slots: TimeSlot[]) {
    const slotsByDate: Slots = {};
    for (const slot of slots) {
        const date = slot.from.toFormat("yyyy-MM-dd");
        if (!slotsByDate[date]) {
            slotsByDate[date] = [];
        }
        slotsByDate[date].push(slot);
    }
    return slotsByDate;
}

// Returns all the bookings for the availability window. Kinda unnecessary for small amount of bookings
export function getBookingsForAvailabilityWindow(
    availabilityWindow: AvailabilityWithDates,
    allBookings: TimeSlot[]
) {
    const bookingsForAvailabilityWindow: TimeSlot[] = [];

    for (const booking of allBookings) {
        if (
            booking.from >= availabilityWindow.startDate &&
            booking.to <= availabilityWindow.endDate
        ) {
            bookingsForAvailabilityWindow.push(booking);
        }
    }
    return bookingsForAvailabilityWindow;
}

// Returns all the slots that are available for the availability window. allSlots - bookings
export function getAvailableSlotsForAvailabilityWindow(
    allSlotsForDate: TimeSlot[],
    bookingsForDate: TimeSlot[]
) {
    const AvailableSlotsForDate: TimeSlot[] = [];
    // Loop over all the slots for the date
    for (const slot of allSlotsForDate) {
        // If the slot overlaps with any of the bookings skip it. Else add it to the array
        if (isBooked(slot, bookingsForDate)) {
            continue;
        }
        AvailableSlotsForDate.push(slot);
    }
    return AvailableSlotsForDate;
}

function isBooked(slot: TimeSlot, bookingsForDate: TimeSlot[]) {
    for (const booking of bookingsForDate) {
        if (isOverlapping(slot, booking)) {
            return true;
        }
    }
    return false;
}

function isOverlapping(slot1: TimeSlot, slot2: TimeSlot) {
    // overlapping in traditional sense
    if (slot1.from < slot2.to && slot1.to > slot2.from) return true;
    // overlapping in the sense that slot1 is inside slot2
    if (slot1.from > slot2.from && slot1.to < slot2.to) return true;
    // overlapping in the sense that slot2 is inside slot1
    if (slot2.from > slot1.from && slot2.to < slot1.to) return true;
    // no overlap
    return false;
}
