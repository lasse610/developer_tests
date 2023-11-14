import { DateTime } from "luxon";
import { Availability } from "../../types";
import { anchorAvailabilityWindowsToDates } from "../../utils/availabilityWindowUtils";

describe("availabilityWindowUtils", () => {
    it("should assign right end and start dates for a multiday availability", () => {
        const now = DateTime.local(2023, 12, 22, 0, 0);
        const calendarLengthDays = 7;
        const availabilityWindows: Availability[] = [
            {
                from: {
                    weekday: 7,
                    hour: 8,
                },
                to: {
                    weekday: 1,
                    hour: 16,
                    minute: 30,
                },
            },
        ];

        const availabilitesWithDates = anchorAvailabilityWindowsToDates(
            now,
            calendarLengthDays,
            availabilityWindows
        );
        expect(availabilitesWithDates[0].startDate.toString()).toBe(
            "2023-12-24T08:00:00.000+02:00"
        );
        expect(availabilitesWithDates[0].endDate.toString()).toBe(
            "2023-12-25T16:30:00.000+02:00"
        );
    });
});
