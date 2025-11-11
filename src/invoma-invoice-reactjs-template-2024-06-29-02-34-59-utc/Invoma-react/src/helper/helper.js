import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const pageTitle = title => {
  return (document.title =
    title + ' Invoice');
};

export const currentDate = () => {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const date = `${day}-${month}-${year}`;
  return date;
}

export const currentDate2 = () => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const day = new Date().getDate();
  const monthIndex = new Date().getMonth();
  const monthName = monthNames[monthIndex];
  const year = new Date().getFullYear();
  const date = `${day}-${monthName}-${year}`;
  return date;
}

export const currentDate3 = () => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const day = new Date().getDate();
  const monthIndex = new Date().getMonth();
  const monthName = monthNames[monthIndex];
  const year = new Date().getFullYear();
  const date = `${day} ${monthName} ${year}`;
  return date;
}

export const currentDate4 = () => {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const date = `${day}/${month}/${year}`;
  return date;
}

export const currentDate5 = () => {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const date = `${day}.${month}.${year}`;
  return date;
}


export const handleDownload = async (page) => {
  const content = page.current;

  // Use html2canvas to capture the content as an image
  const canvas = await html2canvas(content);
  const imgData = canvas.toDataURL('image/png');

  // Create a new jsPDF instance
  const pdf = new jsPDF();
  
  // Add the image to the PDF
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  // Save the PDF
  pdf.save('downloaded-content.pdf');
};