import { useState, useCallback } from 'react';

export const useDateInput = (initialDate = '') => {
  const [date, setDate] = useState(initialDate);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const updateDate = useCallback((newDay: string, newMonth: string, newYear: string) => {
    if (newDay && newMonth && newYear) {
      const formattedDay = newDay.padStart(2, '0');
      const formattedMonth = newMonth.padStart(2, '0');
      return `${newYear}-${formattedMonth}-${formattedDay}`;
    }
    return '';
  }, []);

  const setDayValue = (value: string) => {
    const newDay = value.slice(0, 2);
    setDay(newDay);
    setDate(updateDate(newDay, month, year));
  };

  const setMonthValue = (value: string) => {
    const newMonth = value.slice(0, 2);
    setMonth(newMonth);
    setDate(updateDate(day, newMonth, year));
  };

  const setYearValue = (value: string) => {
    const newYear = value.slice(0, 4);
    setYear(newYear);
    setDate(updateDate(day, month, newYear));
  };

  const resetDate = () => {
    setDate('');
    setDay('');
    setMonth('');
    setYear('');
  };

  return {
    date,
    day,
    month,
    year,
    setDay: setDayValue,
    setMonth: setMonthValue,
    setYear: setYearValue,
    setDate,
    resetDate,
  };
};

export default useDateInput;
