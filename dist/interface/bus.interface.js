"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDefaultSeats = void 0;
const generateDefaultSeats = (totalSeats, seatsPerRow = 4) => {
    const seatLabels = [];
    const numRows = Math.ceil(totalSeats / seatsPerRow);
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const rowLetter = String.fromCharCode(65 + rowIndex); // 65 = 'A'
        for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
            const currentSeatIndex = rowIndex * seatsPerRow + seatNumber;
            if (currentSeatIndex > totalSeats)
                break;
            seatLabels.push(`${rowLetter}${seatNumber}`);
        }
    }
    return seatLabels;
};
exports.generateDefaultSeats = generateDefaultSeats;
