import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async (selectedSections, dashboardRef) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  // Helper function to add element to PDF
  const addElementToPDF = async (elementId, title, isChart = false) => {
    const element = document.getElementById(elementId);
    if (!element) return currentY;

    try {
      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 124, 207);
      pdf.text(title, margin, currentY);
      currentY += 10;

      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const dateStr = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${dateStr}`, margin, currentY);
      currentY += 10;

      // Check if we need a new page
      if (currentY > pageHeight - 50) {
        pdf.addPage();
        currentY = margin;
      }

      // Capture element
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if image fits on current page
      if (currentY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.addImage(imgData, "PNG", margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 15;

      return currentY;
    } catch (error) {
      console.error(`Error capturing ${elementId}:`, error);
      return currentY;
    }
  };

  // Helper function to add text section
  const addTextSection = async (data, title, renderFunction) => {
    // Create a temporary div to render text content
    const tempDiv = document.createElement("div");
    tempDiv.style.width = "100%";
    tempDiv.style.padding = "20px";
    tempDiv.style.backgroundColor = "#ffffff";
    tempDiv.style.fontFamily = "sans-serif";
    tempDiv.innerHTML = renderFunction(data);
    document.body.appendChild(tempDiv);

    try {
      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 124, 207);
      pdf.text(title, margin, currentY);
      currentY += 10;

      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const dateStr = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${dateStr}`, margin, currentY);
      currentY += 10;

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (currentY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.addImage(imgData, "PNG", margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 15;
    } finally {
      document.body.removeChild(tempDiv);
    }

    return currentY;
  };

  // Add header to first page
  const addHeader = () => {
    pdf.setFontSize(24);
    pdf.setTextColor(0, 124, 207);
    pdf.text("Dashboard Report", margin, currentY);
    currentY += 15;

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Filter: ${selectedSections.filter || "Weekly"}`, margin, currentY);
    currentY += 10;
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += 20;
  };

  addHeader();

  // Add selected sections
  if (selectedSections.kpi) {
    currentY = await addElementToPDF("kpi-section", "Key Performance Indicators");
  }

  if (selectedSections.categories) {
    currentY = await addElementToPDF("categories-chart", "Categories Distribution");
  }

  if (selectedSections.trend) {
    currentY = await addElementToPDF("trend-chart", "Report Trends");
  }

  if (selectedSections.topStaff) {
    currentY = await addTextSection(
      selectedSections.topStaffData,
      "Top Staff Performance",
      (data) => {
        if (!data || data.length === 0) return "<p>No data available</p>";
        let html = '<div style="font-family: sans-serif;">';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background-color: #f3f4f6;"><th style="padding: 10px; text-align: left;">Staff Name</th><th style="padding: 10px; text-align: right;">Resolved Reports</th></tr>';
        data.forEach(item => {
          html += `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.count}</td></tr>`;
        });
        html += '</table></div>';
        return html;
      }
    );
  }

  if (selectedSections.topCategory) {
    currentY = await addTextSection(
      selectedSections.topCategoryData,
      "Top Categories",
      (data) => {
        if (!data || data.length === 0) return "<p>No data available</p>";
        let html = '<div style="font-family: sans-serif;">';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background-color: #f3f4f6;"><th style="padding: 10px; text-align: left;">Category</th><th style="padding: 10px; text-align: right;">Report Count</th></tr>';
        data.forEach(item => {
          html += `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item[0]}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item[1]}</td></tr>`;
        });
        html += '</table></div>';
        return html;
      }
    );
  }

  if (selectedSections.comments) {
    currentY = await addTextSection(
      selectedSections.commentsData,
      "User Comments",
      (data) => {
        if (!data || data.length === 0) return "<p>No comments available</p>";
        let html = '<div style="font-family: sans-serif;">';
        data.forEach((comment, index) => {
          html += `<div style="margin-bottom: 15px; padding: 10px; background-color: #f9fafb; border-radius: 8px;">`;
          html += `<p style="margin: 0; color: #374151;">${comment}</p>`;
          html += `</div>`;
        });
        html += '</div>';
        return html;
      }
    );
  }

  if (selectedSections.ratings) {
    currentY = await addTextSection(
      selectedSections.ratingsData,
      "Ratings Overview",
      (data) => {
        if (!data) return "<p>No ratings available</p>";
        let html = '<div style="font-family: sans-serif;">';
        
        // Question Ratings
        html += '<h3 style="color: #007CCF;">Question Ratings</h3>';
        html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
        html += '<tr style="background-color: #f3f4f6;"><th style="padding: 10px; text-align: left;">Question</th><th style="padding: 10px; text-align: right;">Rating</th></tr>';
        data.questionRatings?.forEach(rating => {
          html += `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${rating.question}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${rating.avg} / 5</td></tr>`;
        });
        html += '</table>';
        
        // Overall Rating
        html += '<div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #007CCF, #3b82f6); border-radius: 8px; color: white; text-align: center;">';
        html += `<h3 style="margin: 0 0 10px 0;">Overall Rating</h3>`;
        html += `<div style="font-size: 36px; font-weight: bold;">${data.overallRating}</div>`;
        html += `<div style="margin-top: 10px;">${'★'.repeat(Math.floor(data.overallRating))}${'☆'.repeat(5 - Math.floor(data.overallRating))}</div>`;
        html += `</div>`;
        
        html += '</div>';
        return html;
      }
    );
  }

  // Save the PDF
  pdf.save(`dashboard-report-${new Date().toISOString().slice(0, 19)}.pdf`);
};