import React, { useState, useEffect, useRef } from 'react';
import './planner.css';

interface Schedule {
  day: string;
  date: number;
  event: string[];
  eventColors: string[];
}

const createWeeklySchedule = (): Schedule[] => {
  const daysOfWeek: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const currentDate: Date = new Date();
  const currentDayOfWeek: number = currentDate.getDay();
  const currentDayOfMonth: number = currentDate.getDate();

  const startOfWeek: Date = new Date(currentDate);
  startOfWeek.setDate(currentDayOfMonth - currentDayOfWeek);

  const weeklySchedule: Schedule[] = [];
  for (let i = 0; i < daysOfWeek.length; i++) {
    const tempDate: Date = new Date(startOfWeek);
    tempDate.setDate(startOfWeek.getDate() + i);
    weeklySchedule.push({
      day: daysOfWeek[i],
      date: tempDate.getDate(),
      event: [],
      eventColors: [],
    });
  }

  return weeklySchedule;
};

const getRandomColor = () => {
  const colors = ['#FFEB3B', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#D1C4E9', '#FFE0B2', '#B2DFDB'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Paper: React.FC = () => {
  const [weeklySchedule, setWeeklySchedule] = useState<Schedule[]>(createWeeklySchedule());
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setEditIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDragStart = (eventIndex: number, scheduleIndex: number, event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('eventIndex', eventIndex.toString());
    event.dataTransfer.setData('scheduleIndex', scheduleIndex.toString());
    // localStorage에 인덱스 저장
    window.localStorage.setItem('eventIndex', eventIndex.toString());
    window.localStorage.setItem('scheduleIndex', scheduleIndex.toString());
  };

  const handleDragEnd = () => {
    const eventIndex = parseInt(window.localStorage.getItem('eventIndex') ?? '0', 10);
    const scheduleIndex = parseInt(window.localStorage.getItem('scheduleIndex') ?? '0', 10);
  
    // 올바른 인덱스를 사용하여 이벤트 삭제
    if (weeklySchedule[scheduleIndex] && weeklySchedule[scheduleIndex].event[eventIndex]) {
      const newWeeklySchedule = [...weeklySchedule];
      newWeeklySchedule[scheduleIndex].event.splice(eventIndex, 1);
      newWeeklySchedule[scheduleIndex].eventColors.splice(eventIndex, 1);
      setWeeklySchedule(newWeeklySchedule);
    }
  
    window.localStorage.removeItem('eventIndex');
    window.localStorage.removeItem('scheduleIndex');
  };

  useEffect(() => {
    document.addEventListener('dragend', handleDragEnd as EventListener);
    return () => {
      document.removeEventListener('dragend', handleDragEnd as EventListener);
    };
  }, [weeklySchedule]);

  const handleDrop = (dropIndex: number) => (event: React.DragEvent<HTMLTableDataCellElement>) => {
    event.preventDefault();
    const eventIndex = parseInt(event.dataTransfer.getData('eventIndex'), 10);
    const scheduleIndex = parseInt(event.dataTransfer.getData('scheduleIndex'), 10);

    if (dropIndex !== scheduleIndex) {
      const newWeeklySchedule = [...weeklySchedule];
      const eventToMove = newWeeklySchedule[scheduleIndex].event[eventIndex];
      const colorToMove = newWeeklySchedule[scheduleIndex].eventColors[eventIndex];
      newWeeklySchedule[scheduleIndex].event.splice(eventIndex, 1);
      newWeeklySchedule[scheduleIndex].eventColors.splice(eventIndex, 1);
      newWeeklySchedule[dropIndex].event.push(eventToMove);
      newWeeklySchedule[dropIndex].eventColors.push(colorToMove);
      setWeeklySchedule(newWeeklySchedule);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableDataCellElement>) => {
    event.preventDefault();
  };

  const handleTdClick = (index: number) => {
    setEditIndex(index);
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const newWeeklySchedule = [...weeklySchedule];
      const currentEvents = newWeeklySchedule[index].event;
      const currentColors = newWeeklySchedule[index].eventColors;
      newWeeklySchedule[index] = {
        ...newWeeklySchedule[index],
        event: [...currentEvents, inputValue.trim()],
        eventColors: [...currentColors, getRandomColor()]
      };
      setWeeklySchedule(newWeeklySchedule);
      setEditIndex(null);
      setInputValue('');
    }
  };

  return (
    <div className="paper-container">
      <table>
        <thead>
          <tr>
            {weeklySchedule.map((schedule, index) => (
              <th key={index} className={schedule.day === 'SUN' ? 'sunday' : schedule.day === 'SAT' ? 'saturday' : ''}>
                {schedule.day} ( {schedule.date} )
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {weeklySchedule.map((schedule, index) => (
              <td key={index} onClick={() => handleTdClick(index)} onDrop={handleDrop(index)} onDragOver={handleDragOver}>
                {schedule.event.map((e, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: schedule.eventColors[i], marginBottom: '5px', paddingLeft: '4px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '5px' }}
                    draggable="true"
                    onDragStart={(event) => handleDragStart(i, index, event)}
                  >
                    {e}
                  </div>
                ))}
                {editIndex === index && (
                  <input
                    className="input-container"
                    type="text"
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus
                  />
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const Sticker = () => {
  return (
    <>
      <hr className="dotted-line" />
    </>
  );
};

const Planner = () => {
  return (
    <>
      <Sticker />
      <Paper />
    </>
  );
};

export default Planner;
