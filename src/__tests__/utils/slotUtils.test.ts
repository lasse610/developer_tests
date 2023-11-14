import { DateTime } from "luxon";
import { AvailabilityWithDates, TimeSlot } from "../../types";
import {
    getAllSlotsForAvailabilityWindow,
    getAvailableSlotsForAvailabilityWindow,
    getBookingsForAvailabilityWindow,
} from "../../utils/slotUtils";

describe("slotUtils", () => {
    it("should return correct number of slots when all slots don't fit perfectly", () => {
        const startDate = DateTime.local(2023, 12, 12, 18, 0);
        const endDate = DateTime.local(2023, 12, 12, 20, 45);
        const availabilityWindow: AvailabilityWithDates = {
            from: {
                weekday: startDate.weekday,
                hour: startDate.hour,
            },
            to: {
                weekday: endDate.weekday,
                hour: endDate.hour,
                minute: endDate.minute,
            },
            startDate: startDate,
            endDate: endDate,
        };
        const slots = getAllSlotsForAvailabilityWindow(availabilityWindow, 30);
        expect(slots[slots.length - 1].to.toString()).toBe(
            "2023-12-12T20:30:00.000+02:00"
        );
    });

    it("should return right number of bookings for availability window", () => {
        const startDate = DateTime.local(2023, 12, 11, 0, 0);
        const endDate = DateTime.local(2023, 12, 12, 23, 59);
        const availabilityWindow: AvailabilityWithDates = {
            from: {
                weekday: startDate.weekday,
                hour: startDate.hour,
            },
            to: {
                weekday: endDate.weekday,
                hour: endDate.hour,
                minute: endDate.minute,
            },
            startDate: startDate,
            endDate: endDate,
        };

        const testBookings: TimeSlot[] = [
            {
                from: DateTime.local(2023, 12, 11, 8, 0),
                to: DateTime.local(2023, 12, 11, 16, 0),
            },
            {
                from: DateTime.local(2023, 12, 12, 8, 0),
                to: DateTime.local(2023, 12, 12, 16, 0),
            },
            {
                from: DateTime.local(2023, 12, 13, 8, 0),
                to: DateTime.local(2023, 12, 13, 16, 0),
            },
        ];

        const bookings = getBookingsForAvailabilityWindow(
            availabilityWindow,
            testBookings
        );
        expect(bookings.length).toBe(2);
    });

    it("should return right number of available slots for 3 timeslots and 3 bookings, where 3 of the bookings overlap with 1 slot", () => {
        const startDate = DateTime.local(2023, 12, 11, 0, 0);
        const endDate = DateTime.local(2023, 12, 12, 23, 59);
        const timeSlots: TimeSlot[] = [
            {
                from: DateTime.local(2023, 12, 11, 8, 0),
                to: DateTime.local(2023, 12, 11, 9, 0),
            },
            {
                from: DateTime.local(2023, 12, 11, 10, 0),
                to: DateTime.local(2023, 12, 11, 11, 0),
            },
            {
                from: DateTime.local(2023, 12, 11, 11, 0),
                to: DateTime.local(2023, 12, 11, 12, 0),
            },
        ];

        const testBookings: TimeSlot[] = [
            {
                from: DateTime.local(2023, 12, 11, 10, 15),
                to: DateTime.local(2023, 12, 11, 10, 30),
            },
            {
                from: DateTime.local(2023, 12, 11, 10, 30),
                to: DateTime.local(2023, 12, 11, 10, 45),
            },
            {
                from: DateTime.local(2023, 12, 11, 10, 45),
                to: DateTime.local(2023, 12, 11, 11, 0),
            },
        ];

        const availableSlots = getAvailableSlotsForAvailabilityWindow(
            timeSlots,
            testBookings
        );
        expect(availableSlots.length).toBe(2);
    });
});
