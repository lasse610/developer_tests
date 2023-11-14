import { DateTime, Duration } from "luxon";
import generateSlots from "../generateSlots";
import { AvailabilityData } from "../types";

describe("generateSlots", () => {
    // You modify this sample data for the needs of each of your tests.
    let bookableData1: AvailabilityData;

    beforeEach(() => {
        bookableData1 = buildDefaultAvailability();
    });

    it("should not throw", () => {
        bookableData1.durationMinutes = 30;
        const now = DateTime.local(2023, 12, 12, 6, 30);
        expect(() => generateSlots(now, bookableData1)).not.toThrow();
    });

    it("should return correct number of days", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        const slots = generateSlots(now, bookableData1);
        expect(Object.keys(slots).length).toBe(7);
    });

    it("should return correct number of slots when mustBookHoursBefore is increased", () => {
        const now = DateTime.local(2023, 12, 12, 8, 0);
        bookableData1.mustBookHoursBefore = 3;
        bookableData1.calendarLengthDays = 1;
        const slots = generateSlots(now, bookableData1);
        expect(slots["2023-12-12"].length).toBe(5);
    });

    it("should return correct number of slots when a booking from 10 to 11.30 is inserted", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.bookings = [
            {
                from: DateTime.local(2023, 12, 12, 10, 0),
                to: DateTime.local(2023, 12, 12, 11, 30),
            },
        ];
        const slots = generateSlots(now, bookableData1);
        expect(slots["2023-12-12"].length).toBe(6);
    });

    it("should return correct number of slots when a booking from 10:15 to 10:30 is inserted", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.bookings = [
            {
                from: DateTime.local(2023, 12, 12, 10, 15),
                to: DateTime.local(2023, 12, 12, 10, 30),
            },
        ];
        const slots = generateSlots(now, bookableData1);
        expect(slots["2023-12-12"].length).toBe(7);
    });

    it("should return correct number of slots when a multi day availability is", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.bookings = [
            {
                from: DateTime.local(2023, 12, 12, 10, 0),
                to: DateTime.local(2023, 12, 12, 11, 30),
            },
        ];
        const slots = generateSlots(now, bookableData1);
        expect(slots["2023-12-12"].length).toBe(6);
    });

    it("should return correct number of slots when a day has 2 availability windows", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.calendarLengthDays = 1;
        bookableData1.mustBookHoursBefore = 0;
        bookableData1.availabilityWindows = [
            {
                from: {
                    weekday: now.weekday,
                    hour: 8,
                },
                to: {
                    weekday: now.weekday,
                    hour: 12,
                },
            },
            {
                from: {
                    weekday: now.weekday,
                    hour: 13,
                },
                to: {
                    weekday: now.weekday,
                    hour: 16,
                },
            },
        ];
        const slots = generateSlots(now, bookableData1);
        expect(slots["2023-12-12"].length).toBe(7);
    });

    it("should return correct number of days when 4 week calendar days are used", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.calendarLengthDays = 30;
        const slots = generateSlots(now, bookableData1);
        expect(Object.keys(slots).length).toBe(30);
    });

    it("should save slots starting before midnight and ending after midnight to the date where the start of the slot is", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.calendarLengthDays = 1;
        bookableData1.durationMinutes = 120;
        bookableData1.availabilityWindows = [
            {
                from: {
                    weekday: now.weekday,
                    hour: 21,
                },
                to: {
                    weekday: now.weekday + 1,
                    hour: 1,
                },
            },
        ];
        const slots = generateSlots(now, bookableData1);
        expect(slots["2023-12-12"].length).toBe(2);
    });

    it("should not return date that is fully booked", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.calendarLengthDays = 1;
        bookableData1.durationMinutes = 30;
        bookableData1.bookings = [
            {
                from: DateTime.local(2023, 12, 12, 8, 0),
                to: DateTime.local(2023, 12, 12, 16, 0),
            },
        ];
        const slots = generateSlots(now, bookableData1);
        expect(Object.keys(slots).length).toBe(0);
    });

    it("should fit all slots inside the availability window", () => {
        const now = DateTime.local(2023, 12, 12, 6, 30);
        bookableData1.calendarLengthDays = 1;
        bookableData1.durationMinutes = 60;
        bookableData1.availabilityWindows = [
            {
                from: {
                    weekday: now.weekday,
                    hour: 18,
                },
                to: {
                    weekday: now.weekday,
                    hour: 20,
                    minute: 30,
                },
            },
        ];
        const slots = generateSlots(now, bookableData1);
        expect(slots[now.toFormat("yyyy-MM-dd")].length).toBe(2);
    });
});

function buildDefaultAvailability(): AvailabilityData {
    const weekdays = Array.from({ length: 7 }, (_, i) => i + 1);
    return {
        calendarLengthDays: 7,
        availabilityWindows: weekdays.map((weekday) => ({
            from: {
                weekday,
                hour: 8,
            },
            to: {
                weekday,
                hour: 16,
            },
        })),
        durationMinutes: 60,
        mustBookHoursBefore: 1,
        bookings: [],
        timezone: "Europe/Helsinki",
    };
}
