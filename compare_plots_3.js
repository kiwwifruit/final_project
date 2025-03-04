document.addEventListener('DOMContentLoaded', function () {
    const featuresSelect = document.getElementById('featuresSelect');
    const studentSelect = document.getElementById('studentSelect');

    let currentFeature = featuresSelect.value; // Default selected feature
    let currentStudent = studentSelect.value; // Default selected student

    featuresSelect.addEventListener('change', function() {
        currentFeature = this.value;
        updatesCharts(currentFeature, currentStudent);
    });

    studentSelect.addEventListener('change', function() {
        currentStudent = this.value;
        updatesCharts(currentFeature, currentStudent);
    });

    updatesCharts(currentFeature, currentStudent);

    function updatesCharts(feature, student) {
        const filePaths = getFilePathsForFeatureStudent(feature, student);
        const promises = filePaths.map(path =>
            fetch(path)
            .then(response => response.text())
            .then(data => preparesChartData(data, path.split('/').pop()))
        );
    
        Promise.all(promises).then(chartDataSets => {
            alignsYAxis(chartDataSets);
            
            // Instead of clearing, update the charts smoothly
            if (d3.select(".triple-graph-container").empty()) {
                renderCharts(chartDataSets, feature, student);
            } else {
                updateGraphData(chartDataSets, feature, student);
            }
        });
    }
    
    function getsDescriptionForFeature(feature) {
        switch (feature) {
            case 'hr':
                return "* Heart rate (HR) indicates both physical stress and cognitive engagement. \
                S7 exhibits frequent heart rate spikes throughout the exam, suggesting difficulty managing \
                stress. In contrast, S5 maintains a generally elevated yet stable heart rate, suggesting \
                sustained cognitive effort and focus.\
                <br><br> * Higher heart rates, when consistent rather than erratic, are associated with improved \
                concentration and better exam performance. Rapid and unpredictable fluctuations may indicate \
                stress-related distraction and hinder cognitive performance.";
            case 'temp':
                return "* Skin temperature (TEMP) changes can indicate stress-related physiological responses, \
                such as blood vessel constriction. S7 shows significant fluctuations with lower baseline \
                temperatures, suggesting stress responses at various stages of the exam or disengagement. \
                In contrast, S8 maintains a stable, slightly elevated temperature throughout the exam, \
                indicating calmness and sustained focus. \
                <br><br> * Consistent body temperature suggests better stress management and a higher potential for good performance.";
            case 'eda':
                return "* Electrodermal Activity (EDA) measures skin electrical conductance as a quantitative indicator of how much you sweat, \
                serving as a direct measurement of emotional stress. S2 shows a brief spike at the beginning—likely \
                due to initial nervousness—followed by a calm, stable pattern. In contrast, S4 experiences high, \
                sustained EDA early on, reflecting ongoing stress. \
                <br><br> * Higher grades are associated with quick recovery from initial anxiety. \
                Students who manage to calm down shortly after starting the exam generally perform better.";
            case 'acc':
                return "* The accelerometer records acceleration (ACC) as a measurement of body movement, which can \
                reflect cognitive engagement or attempts to manage stress. S3 shows elevated movement levels \
                throughout the exam, especially during the early stages, suggesting active thinking and \
                problem-solving. In contrast, S7 maintains low movement for most of the exam, possibly indicating \
                passivity. However, there is a notable spike near the end, which may represent growing discomfort, \
                rushed attempts to complete remaining questions, or late-stage stress. \
                <br><br> * Higher movement values appear to correlate with better performance, potentially reflecting cognitive effort. However, constant fidgeting or sudden movement spikes can be signs of stress-related distraction, potentially leading to lower scores.";
        }
    }

    function updateGraphData(chartDataSets, feature, student) {
        const tripleContainer = d3.select(".triple-graph-container");
    
        tripleContainer.selectAll(".triple-graph").each(function (_, index) {
            const container = d3.select(this);
            const svg = container.select("svg g");
    
            if (!chartDataSets[index]) return; // Prevent errors if missing data
    
            // Adjust width and height based on whether it's a midterm or final
            const baseWidth = 550, baseHeight = 300, margin = { top: 40, right: 40, bottom: 60, left: 70 };
            const width = index === 2 ? baseWidth * 2 - margin.left - margin.right : baseWidth - margin.left - margin.right;
            const height = baseHeight - margin.top - margin.bottom;
    
            // Define x-axis ranges
            const xDomain = index === 2 ? [0, 240] : [0, 160]; // Final has twice the length
            const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
    
            const yScale = d3.scaleLinear()
                .domain([chartDataSets[index].alignedMinY, chartDataSets[index].alignedMaxY])
                .range([height, 0]);
    
            // **Update the Title Dynamically**
            container.select(".triple-graph-title")
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
            const xTicks = index === 2 ? d3.range(0, 361, 40) : d3.range(0, 181, 20);
            const xAxis = d3.axisBottom(xScale).tickValues(xTicks);
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
            svg.select(".avgs-line")
                .transition()
                .duration(750)
                .attr("y1", yScale(chartDataSets[index].average))
                .attr("y2", yScale(chartDataSets[index].average));
    
            // **Ensure each graph has its own tooltip**
            d3.select(`.tooltips-box-${index}`).remove(); // Remove previous tooltip
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", `tooltip-box tooltips-box-${index}`)
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
                    d3.select(`.tooltips-box-${index}`)
                        .style("opacity", 1)
                        .html(`Avg: ${chartDataSets[index].average}`);
                })
                .on("mousemove", function (event) {
                    d3.select(`.tooltips-box-${index}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function () {
                    d3.select(`.tooltips-box-${index}`).style("opacity", 0);
                });
        });
    
        d3.select(".graph-triple-description")
            .transition()
            .duration(500)
            .style("opacity", 0) // Fade out
            .on("end", function() {
                d3.select(this)
                    .html(getsDescriptionForFeature(feature))
                    .transition()
                    .duration(500)
                    .style("opacity", 1); // Fade in with new text
            });
    }

    function getFilePathsForFeatureStudent(feature, student) {
        switch (feature) {
            case 'hr': return [`HR3/hr_${student}_Midterm 1.csv`, `HR3/hr_${student}_Midterm 2.csv`, `HR3/hr_${student}_Final.csv`];
            case 'temp': return [`TEMP3/temp_${student}_Midterm 1.csv`, `TEMP3/temp_${student}_Midterm 2.csv`, `TEMP3/temp_${student}_Final.csv`];
            case 'eda': return [`EDA3/eda_${student}_Midterm 1.csv`, `EDA3/eda_${student}_Midterm 2.csv`, `EDA3/eda_${student}_Final.csv`];
            case 'acc': return [`ACC3/acc_${student}_Midterm 1.csv`, `ACC3/acc_${student}_Midterm 2.csv`, `ACC3/acc_${student}_Final.csv`];
            default: return [];
        }
    }

    function preparesChartData(csvData, filename) {
        const rows = csvData.split('\n'); // Get all rows
        const headers = rows[0].split(',');  // Extract column headers
    
        // Extract the Y-axis label (real column name)
        const yLabel = headers[1].trim(); // Assuming the second column is the Y-axis data
    
        // Extract the grade from the third column (assuming it's on the first row)
        const gradeRow = rows[1].split(','); 
        const grade = gradeRow.length >= 3 ? gradeRow[2].trim() : "Unknown"; // Extract or default to "Unknown"
    
        // Determine if this is a midterm (181 minutes) or final (361 minutes)
        const isFinal = filename.includes("Final");
        const maxMinutes = isFinal ? 240 : 160;
        
        // Create labels and data array based on exam type
        const labels = Array.from({ length: maxMinutes + 1 }, (_, i) => i);
        const data = new Array(maxMinutes + 1).fill(null);
    
        // Process remaining rows (excluding the first row)
        rows.slice(1).forEach(row => {
            const parts = row.split(',');
            if (parts.length >= 2) {
                const minute = parseInt(parts[0], 10);
                const value = parseFloat(parts[1]);
                if (!isNaN(minute) && !isNaN(value) && minute <= maxMinutes) {
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
            label: `${filename.match(/S\d+/)?.[0]} - ${yLabel} vs. Minutes - Grade: ${grade}`,
            yLabel,  
            grade,  
            average: average.toFixed(2),
            minY: Math.min(...validData),
            maxY: Math.max(...validData)
        };
    }

    function alignsYAxis(chartDataSets) {
        if (chartDataSets.length < 3) return; // Ensure we have all three datasets
    
        // Align only Midterm 1 and Midterm 2 (index 0 and 1)
        let minY = Math.min(chartDataSets[0].minY, chartDataSets[1].minY);
        let maxY = Math.max(chartDataSets[0].maxY, chartDataSets[1].maxY);
    
        // Apply buffer (rounding down/up for better display)
        minY = Math.floor(minY);
        maxY = Math.ceil(maxY);
    
        // Set aligned Y-axis values for Midterm 1 & 2
        chartDataSets[0].alignedMinY = minY;
        chartDataSets[0].alignedMaxY = maxY;
        chartDataSets[1].alignedMinY = minY;
        chartDataSets[1].alignedMaxY = maxY;
    
        // Keep the Final (index 2) independent
        chartDataSets[2].alignedMinY = Math.floor(chartDataSets[2].minY);
        chartDataSets[2].alignedMaxY = Math.ceil(chartDataSets[2].maxY);
    }

    function renderCharts(chartDataSets, feature) {
        const chartsContainers = document.getElementById('chartsContainers');
        chartsContainers.innerHTML = '';
    
        // Create a container for all three graphs
        const tripleContainer = document.createElement('div');
        tripleContainer.className = "triple-graph-container";
        chartsContainers.appendChild(tripleContainer);
    
        // Create two rows: one for midterms, one for final
        const layoutContainer = document.createElement('div');
        layoutContainer.className = "graph-layout";
        tripleContainer.appendChild(layoutContainer);
        
        const midtermRow = document.createElement('div');
        midtermRow.className = "midterm-row";
        layoutContainer.appendChild(midtermRow);
        
        const finalContainer = document.createElement('div');
        finalContainer.className = "final-graph-container";
        layoutContainer.appendChild(finalContainer);
    
        chartDataSets.forEach((chartData, index) => {
            const container = document.createElement('div');
            container.className = "triple-graph";
            container.innerHTML = `
                <h2 class="triple-graph-title">${chartData.label}</h2>
                <div class="legend">
                    <svg width="20" height="10">
                        <line x1="0" y1="5" x2="20" y2="5" stroke="#d63d25" stroke-width="3.5" stroke-dasharray="5,3"></line>
                    </svg>
                    <span>Average Value</span>
                </div>`;
    
            // Append to the correct row (midterms at the top, final at the bottom)
            if (index < 2) {
                container.style.width = "50%"; // Ensures midterms are placed side by side
                midtermRow.appendChild(container); 
            } else {
                finalContainer.appendChild(container); // Final below the midterms
            }
    
            // Set width and x-axis range
            const isFinal = index === 2;
            const svgWidth = isFinal ? 1100 : 550; // Final is twice as wide
            const svgHeight = 300;
            const margin = { top: 40, right: 40, bottom: 60, left: 70 };
            const width = svgWidth - margin.left - margin.right;
            const height = svgHeight - margin.top - margin.bottom;
    
            // Set x-axis scale
            const xDomain = isFinal ? [0, 240] : [0, 160]; // Final is twice as long
            const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
    
            const yScale = d3.scaleLinear()
                .domain([chartData.alignedMinY, chartData.alignedMaxY])
                .range([height, 0]);
    
            const xTicks = isFinal ? d3.range(0, 361, 40) : d3.range(0, 181, 20);
            const xAxis = d3.axisBottom(xScale).tickValues(xTicks);
            const yAxis = d3.axisLeft(yScale).tickValues(d3.ticks(chartData.alignedMinY, chartData.alignedMaxY, 7));
    
            const svg = d3.select(container)
                .append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
    
            // Append axes
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .attr("class", "x-axis axis")
                .call(xAxis);
    
            svg.append("g")
                .attr("class", "y-axis axis")
                .call(yAxis);
    
            // Axis labels
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
                .text(chartData.yLabel);
    
            // Data line
            const line = d3.line()
                .defined(d => d !== null)
                .x((_, i) => xScale(i))
                .y(d => yScale(d))
                .curve(d3.curveMonotoneX);
    
            svg.append("path")
                .datum(chartData.data)
                .attr("class", "data-line")
                .attr("d", line);
    
            // Average line
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", yScale(chartData.average))
                .attr("y2", yScale(chartData.average))
                .attr("class", "avgs-line");
    
            // Tooltip
            d3.select(`.tooltips-box-${index}`).remove();
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", `tooltip-box tooltips-box-${index}`)
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
    
        // **Add description box at the bottom**
        const descriptionBox = document.createElement('p');
        descriptionBox.className = "graph-triple-description";
        descriptionBox.innerHTML = getsDescriptionForFeature(feature);
        tripleContainer.appendChild(descriptionBox);
    }
});