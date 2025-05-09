
export interface IBus extends Document {
    name: string
    bus_number: string
    seat: string,
    credit: number,
    standing: number,
    price: number,
    source: string,
    stops: [{
      name: string,
      latitude: number,
      longitude: number
      price: number
    }],
    lastStop: string,
  }

  export const generateDefaultSeats = (totalSeats: number, seatsPerRow = 4): string[] => {
    const seatLabels: string[] = [];
    const numRows = Math.ceil(totalSeats / seatsPerRow);
  
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const rowLetter = String.fromCharCode(65 + rowIndex); // 65 = 'A'
      for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
        const currentSeatIndex = rowIndex * seatsPerRow + seatNumber;
        if (currentSeatIndex > totalSeats) break;
        seatLabels.push(`${rowLetter}${seatNumber}`);
      }
    }
  
    return seatLabels;
  };
  