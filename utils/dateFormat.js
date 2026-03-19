// DateFormat.js
const formatDate = (dateFormat) => {
  const date = new Date();
  // console.log(dateFormat);
  if (dateFormat === 'NNMMYY|TT:TT') {
    const day = date.getDate().toString().padStart(2, '0'); // Pad day with leading zero
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12 || 12).toString().padStart(2, '0'); // Pad hours with leading zero

    return `${day} ${month} ${year} | ${hours}:${minutes} ${ampm}`;
  }

  if (dateFormat === 'MM-DDTH-YYYY') {
    const day = date.getDate().toString().padStart(2, '0'); // Pad day with leading zero
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12 || 12).toString().padStart(2, '0'); // Pad hours with leading zero

    return `${month}-${day}th-${year}`;
  }
  
  // Add additional format patterns here if needed
  throw new Error(`Unsupported date format: ${dateFormat}`);
}

module.exports = formatDate;