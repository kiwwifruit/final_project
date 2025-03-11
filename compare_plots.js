document.addEventListener('DOMContentLoaded', function () {
    const featureSelect = document.getElementById('featureSelect');
    const studentSelect1 = document.getElementById('studentSelect_1');
    const studentSelect2 = document.getElementById('studentSelect_2');

    let currentFeature = featureSelect.value;  // Default selected feature
    let currentStudent1 = studentSelect1.value; // Default selected student 1
    let currentStudent2 = studentSelect2.value; // Default selected student 2

    let lastFeature = null; // Store the last selected feature

    featureSelect.addEventListener('change', function() {
        currentFeature = this.value;
        updateCharts(currentFeature, currentStudent1, currentStudent2);
    });

// Example student-grade mapping (Replace with actual data source)
const studentGrades = {
    "S1": "82.0%",
    "S2": "85.0%",
    "S3": "90.0%",
    "S4": "77.0%",
    "S5": "77.0%",
    "S6": "64.0%",
    "S7": "33.0%",
    "S8": "88.0%",
    "S9": "39.0%",
    "S10": "64.0%"
};

function updateStudentOptions() {
    // Get selected values
    let selected1 = studentSelect1.value;
    let selected2 = studentSelect2.value;

    // Update options in both dropdowns
    studentSelect1.querySelectorAll("option").forEach(option => {
        option.disabled = option.value === selected2; // Disable selected2 in studentSelect1
        option.textContent = `${option.value} \u00A0\u00A0(Grade: ${studentGrades[option.value] || "N/A"})`; // Update label
    });

    studentSelect2.querySelectorAll("option").forEach(option => {
        option.disabled = option.value === selected1; // Disable selected1 in studentSelect2
        option.textContent = `${option.value} \u00A0\u00A0(Grade: ${studentGrades[option.value] || "N/A"})`; // Update label
    });

    // If both dropdowns have the same value, adjust studentSelect2
    if (selected1 === selected2) {
        let availableOptions = [...studentSelect2.options].filter(option => !option.disabled);
        if (availableOptions.length > 0) {
            studentSelect2.value = availableOptions[0].value;
            currentStudent2 = studentSelect2.value; // Update currentStudent2
        }
    }
}
    
    // Attach event listeners with option update logic
    studentSelect1.addEventListener('change', function() {
        currentStudent1 = this.value;
        updateStudentOptions(); // Ensure no duplicates
        updateCharts(currentFeature, currentStudent1, currentStudent2);
    });
    
    studentSelect2.addEventListener('change', function() {
        currentStudent2 = this.value;
        updateStudentOptions(); // Ensure no duplicates
        updateCharts(currentFeature, currentStudent1, currentStudent2);
    });
    
    // Initialize the option restrictions
    updateStudentOptions();

    updateCharts(currentFeature, currentStudent1, currentStudent2);


    function updateCharts(feature, student1, student2) {
        const filePaths = getFilePathsForFeature(feature, student1, student2);

        const promises = filePaths.map(path =>
            fetch(path)
            .then(response => response.text())
            .then(data => prepareChartData(data, path.split('/').pop()))
        );
    
        Promise.all(promises).then(chartDataSets => {
            alignYAxis(chartDataSets);
            
            // Instead of clearing, update the charts smoothly
            if (d3.select(".pair-graph-container").empty()) {
                renderCharts(chartDataSets, feature);
            } else {
                updateGraphData(chartDataSets, feature);
            }

            if (lastFeature !== feature) {
                d3.select(".graph-triple-description")
                    .transition()
                    .duration(500)
                    .style("opacity", 0) // Fade out
                    .on("end", function() {
                        d3.select(this)
                            .html(getsDescriptionForFeature(feature)) // Update description
                            .transition()
                            .duration(500)
                            .style("opacity", 1); // Fade in with new text
                    });
    
                lastFeature = feature; // Store the new feature
            }
        });
    }
    function getDescriptionForFeature(feature) {
        switch (feature) {
            case 'hr':
                return "Heart rate (HR) measured in beats per minute increases as stress triggers the fight-or-flight response, releasing adrenaline.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Stable, elevated heart rates correlate with better focus and higher grades.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Erratic fluctuations are linked to stress-related distraction and lower performance.";
            case 'temp':
                return "Temperature (TEMP) in Celsius measures wrist skin temperature, which increases due to stress-induced metabolic heat output.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Moderate, stable increases suggest controlled stress and improved performance.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Excessive drops may indicate disengagement, while erratic fluctuations suggest poor stress regulation, both linked to lower grades.";
            case 'eda':
                return "Electrodermal Activity (EDA) in microsiemens measures skin electrical conductance, which increases due to stress-stimulated sweat gland activity.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Quick recovery from initial stress spikes is correlated with better exam performance.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Sustained high EDA levels indicate prolonged stress and are linked to lower grades.";
            case 'acc':
                return "Acceleration (ACC) in meters per second squared measures body movement, where physical activity helps alleviate stress and muscle tension.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Moderate, consistent movement suggests active problem-solving and correlates with higher performance.\
                <br>&nbsp;&nbsp;&nbsp;&nbsp;Minimal movement may indicate passivity, while excessive or erratic movement can signal stress and lower scores.";
        }
    }
    function updateGraphData(chartDataSets, feature) {
        const pairContainer = d3.select(".pair-graph-container");
    
        pairContainer.selectAll(".pair-graph").each(function (_, index) {
            const container = d3.select(this);
            const svg = container.select("svg g");
            
            if (!chartDataSets[index]) return; // Prevent errors if missing data
    
            const baseWidth = 550, baseHeight = 300, margin = { top: 40, right: 40, bottom: 60, left: 70 };
            const width = index === 2 ? baseWidth * 2 - margin.left - margin.right : baseWidth - margin.left - margin.right;
            const height = baseHeight - margin.top - margin.bottom;
            
            
            const xScale = d3.scaleLinear().domain([0, 150]).range([0, width]);
            const yScale = d3.scaleLinear()
                .domain([chartDataSets[index].alignedMinY, chartDataSets[index].alignedMaxY])
                .range([height, 0]);
    
            // **Update the Title Dynamically**
            container.select(".pair-graph-title")
                .html(chartDataSets[index].label);
    
            // **Update Axis Labels**
            svg.select(".x-axis-label")
                .transition()
                .duration(750)
                .text("Minutes");
    
            svg.select(".y-axis-label")
                .transition()
                .duration(750)
                .text(chartDataSets[index].yLabel);
    
            // **Update the y-axis**
            const yAxis = d3.axisLeft(yScale).tickValues(d3.ticks(chartDataSets[index].alignedMinY, chartDataSets[index].alignedMaxY, 7));
            svg.select(".y-axis")
                .transition()
                .duration(750)
                .call(yAxis);
    
            // **Update the x-axis**
            const xAxis = d3.axisBottom(xScale).tickValues(d3.range(0, 151, 15));
            svg.select(".x-axis")
                .transition()
                .duration(750)
                .call(xAxis);
    
            // **Update the data line**
            const line = d3.line()
                .defined(d => d !== null)
                .x((_, i) => xScale(i))
                .y(d => yScale(d))
                .curve(d3.curveMonotoneX);
    
            svg.select(".data-line")
                .datum(chartDataSets[index].data)
                .transition()
                .duration(750)
                .attr("d", line);
    
            // **Update the average line**
            svg.select(".avg-line")
                .transition()
                .duration(750)
                .attr("y1", yScale(chartDataSets[index].average))
                .attr("y2", yScale(chartDataSets[index].average));
    
            // **Ensure each graph has its own tooltip**
            d3.select(`.tooltip-box-${index}`).remove(); // Remove previous tooltip
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", `tooltip-box tooltip-box-${index}`)
                .style("opacity", 0);
    
            // **Update the tooltip and hover area**
            svg.selectAll(".avg-hover-area").remove(); // Remove old hover area
            svg.append("rect")
                .attr("x", 0)
                .attr("y", yScale(chartDataSets[index].average) - 10) // Adjusted for better detection
                .attr("width", width)
                .attr("height", 20) // Increased size for better hovering
                .attr("fill", "transparent")
                .attr("class", "avg-hover-area")
                .style("cursor", "pointer")
                .on("mouseover", function (event) {
                    d3.select(`.tooltip-box-${index}`)
                        .style("opacity", 1)
                        .html(`Avg: ${chartDataSets[index].average}`);
                })
                .on("mousemove", function (event) {
                    d3.select(`.tooltip-box-${index}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function () {
                    d3.select(`.tooltip-box-${index}`).style("opacity", 0);
                });
        });
        if (lastFeature !== feature) {
            d3.select(".graph-pair-description")
                    .transition()
                    .duration(500)
                    .style("opacity", 0) // Fade out
                    .on("end", function() {
                        d3.select(this)
                            .html(getDescriptionForFeature(feature))
                            .transition()
                            .duration(500)
                            .style("opacity", 1); // Fade in with new text
                    });
                }
    }
    
    function getFilePathsForFeature(feature, student1, student2) {
        switch (feature) {
            case 'hr': return [`HR3/hr_${student1}_Midterm 2.csv`, `HR3/hr_${student2}_Midterm 2.csv`];
            case 'temp': return [`TEMP3/temp_${student1}_Midterm 2.csv`, `TEMP3/temp_${student2}_Midterm 2.csv`];
            case 'eda': return [`EDA3/eda_${student1}_Midterm 2.csv`, `EDA3/eda_${student2}_Midterm 2.csv`];
            case 'acc': return [`ACC3/acc_${student1}_Midterm 2.csv`, `ACC3/acc_${student2}_Midterm 2.csv`];
            default: return [];
        }
    }

    function prepareChartData(csvData, filename) {
        const rows = csvData.split('\n'); // Get all rows
        const labels = Array.from({ length: 151 }, (_, i) => i);
        const data = new Array(151).fill(null);
        const headers = rows[0].split(',');  // Extract column headers

        // Extract the Y-axis label (real column name)
        const yLabel = headers[1].trim(); // Assuming the second column is the Y-axis data
    
        // Extract the grade from the third column (assuming it's on the first row)
        const gradeRow = rows[1].split(','); 
        const grade = gradeRow.length === 3 ? gradeRow[2].trim() : "Unknown"; // Extract or default to "Unknown"
    
        // Process remaining rows (excluding the first row)
        rows.slice(1).forEach(row => {
            const parts = row.split(',');
            if (parts.length >= 2) {
                const minute = parseInt(parts[0], 10);
                const value = parseFloat(parts[1]);
                if (!isNaN(minute) && !isNaN(value) && minute <= 150) {
                    data[minute] = value;
                }
            }
        });
    
        const validData = data.filter(v => v !== null);
        const sum = validData.reduce((acc, val) => acc + val, 0);
        const average = validData.length > 0 ? sum / validData.length : 0;
    
        return {
            labels,
            data,
            label: `${yLabel} vs. Minutes`,
            yLabel,  // Extract "S6" from filename
            grade,  // Store extracted grade
            average: average.toFixed(2),
            minY: Math.min(...validData),
            maxY: Math.max(...validData)
        };
    }

    function alignYAxis(chartDataSets) {
        for (let i = 0; i < chartDataSets.length; i += 2) {
            let minY = Math.min(chartDataSets[i].minY, chartDataSets[i + 1]?.minY ?? chartDataSets[i].minY);
            let maxY = Math.max(chartDataSets[i].maxY, chartDataSets[i + 1]?.maxY ?? chartDataSets[i].maxY);
    
            // Apply buffer (10% of range) to prevent excessive stretching
            minY = Math.floor(minY); // Round down
            maxY = Math.ceil(maxY);  // Round up
    
            chartDataSets[i].alignedMinY = minY;
            chartDataSets[i].alignedMaxY = maxY;
            if (i + 1 < chartDataSets.length) {
                chartDataSets[i + 1].alignedMinY = minY;
                chartDataSets[i + 1].alignedMaxY = maxY;
            }
        }
    }

    function renderCharts(chartDataSets, feature) {
        const chartsContainer = document.getElementById('chartsContainer');
        chartsContainer.innerHTML = '';
    
        const pairContainer = document.createElement('div');
        pairContainer.className = "pair-graph-container";
        chartsContainer.appendChild(pairContainer);
    
        chartDataSets.forEach((chartData, index) => {
            const container = document.createElement('div');
            container.className = "pair-graph";
            container.innerHTML = `
            <h2 class="pair-graph-title">${chartData.label}</h2>
            <div class="legend">
                <svg width="20" height="10">
                    <line x1="0" y1="5" x2="20" y2="5" stroke="#d63d25" stroke-width="3.5" stroke-dasharray="5,3"></line>
                </svg>
                <span>Average Value</span>
            </div>`;
            pairContainer.appendChild(container);
    
            const svgWidth = 550, svgHeight = 300, margin = { top: 40, right: 40, bottom: 60, left: 70 };
            const width = svgWidth - margin.left - margin.right;
            const height = svgHeight - margin.top - margin.bottom;
    
            const svg = d3.select(container)
                .append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
    
            const xScale = d3.scaleLinear().domain([0, 150]).range([0, width]);
            const yScale = d3.scaleLinear().domain([chartData.alignedMinY, chartData.alignedMaxY]).range([height, 0]);
    
            const xAxis = d3.axisBottom(xScale).tickValues(d3.range(0, 151, 15));
            const yAxis = d3.axisLeft(yScale).tickValues(d3.ticks(chartData.alignedMinY, chartData.alignedMaxY, 7));
    
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .attr("class", "x-axis axis")
                .call(xAxis);
    
            svg.append("g")
                .attr("class", "y-axis axis")
                .call(yAxis);
    
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 45)
                .attr("text-anchor", "middle")
                .attr("class", "x-axis-label axis-label")
                .text("Minutes");
    
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .attr("class", "y-axis-label axis-label")
                .text(chartDataSets[index].yLabel);
    
            const line = d3.line()
                .defined(d => d !== null)
                .x((_, i) => xScale(i))
                .y(d => yScale(d))
                .curve(d3.curveMonotoneX);
    
            svg.append("path")
                .datum(chartData.data)
                .attr("class", "data-line")
                .attr("d", line);
    
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", yScale(chartData.average))
                .attr("y2", yScale(chartData.average))
                .attr("class", "avg-line");
    
            d3.select(`.tooltip-box-${index}`).remove();
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", `tooltip-box tooltip-box-${index}`)
                .style("opacity", 0);
    
            svg.append("rect")
                .attr("x", 0)
                .attr("y", yScale(chartData.average) - 15)
                .attr("width", width)
                .attr("height", 30)
                .attr("fill", "transparent")
                .attr("class", "avg-hover-area")
                .style("cursor", "pointer")
                .on("mouseover", function (event) {
                    tooltip.style("opacity", 1)
                        .html(`Avg: ${chartData.average}`);
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0);
                });
        });
        const descriptionBox = document.createElement('p');
        descriptionBox.className = "graph-pair-description";
        descriptionBox.innerHTML = getDescriptionForFeature(feature);
        pairContainer.appendChild(descriptionBox);
    }
});
