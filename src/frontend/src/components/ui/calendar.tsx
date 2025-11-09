"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, formatters, ...props }: CalendarProps) {
  const viWeekday = React.useCallback((day: Date) => {
    const idx = day.getDay();
    // 0..6 => CN, T2..T7
    return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][idx];
  }, []);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      formatters={{
        ...formatters,
        formatWeekdayName: (day) => (formatters?.formatWeekdayName ? formatters.formatWeekdayName(day) : viWeekday(day)),
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "h-9 w-9 p-0 font-medium aria-selected:opacity-100",
          "inline-flex items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground"
        ),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full ring-2 ring-primary/30",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }


