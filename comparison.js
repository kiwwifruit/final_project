
// async function getData(sid, exam, feature, timeAdjustment = 1) {
//     let examName;
//     if (exam === 1) {
//         examName = 'Midterm 1';
//     } else if (exam === 2) {
//         examName = 'Midterm 2';
//     } else if (exam === 3) {
//         examName = 'Final';
//     }

//     const response = await fetch(`data/S${sid}/${examName}/${feature}.csv`);
//     const text = await response.text();
//     const data = d3.csvParseRows(text);

//     const sessionStartUnix = +data[0][0];
//     const sampleRate = +data[1][0];

//     const sessionStartDt = new Date(sessionStartUnix * 1000);
//     const examStartDt = new Date(sessionStartDt);
//     examStartDt.setHours(sessionStartDt.getHours() + timeAdjustment, 0, 0, 0);
//     const examStartTime = Math.floor(examStartDt.getTime() / 1000);

//     let timePoints;
//     if (examName === 'Final') {
//         timePoints = d3.range(examStartTime, examStartTime + 10800 + 1, 60);
//     } else {
//         timePoints = d3.range(examStartTime, examStartTime + 5400 + 1, 60);
//     }

//     const timestamps = data.slice(2).map((row, i) => sessionStartUnix + i / sampleRate);
//     const values = data.slice(2).map(row => +row[0]);

//     const minuteLabels = timePoints.slice(0, -1).map(t => (t - examStartTime) / 60);
//     const minuteData = new Array(minuteLabels.length).fill(0).map(() => []);

//     timestamps.forEach((timestamp, i) => {
//         const minuteIndex = Math.floor((timestamp - examStartTime) / 60);
//         if (minuteIndex >= 0 && minuteIndex < minuteData.length) {
//             minuteData[minuteIndex].push(values[i]);
//         }
//     });

//     const avgTempPerMin = minuteData.map(arr => d3.mean(arr)).filter(d => d !== undefined);

//     return avgTempPerMin;
// }

// async function getGrades(sid) {
//     const response = await fetch('processed_data/grades.csv');
//     const text = await response.text();
//     const data = d3.csvParse(text);

//     const sgrade = [];
//     const exams = ['Midterm 1', 'Midterm 2', 'Final'];

//     exams.forEach(exam => {
//         const grade = data.find(row => row.Name === `S${sid}_${exam}`).Percentage_Score;
//         sgrade.push(grade);
//     });

//     return sgrade;
// }

// async function plotSingleStudent(sid, feature) {
//     const exam1 = await getData(sid, 1, feature);
//     const exam2 = await getData(sid, 2, feature);
//     const final = await getData(sid, 3, feature);

//     const grades = await getGrades(sid);

//     const width = 500;
//     const height = 250;
//     const margin = { top: 45, right: 250, bottom: 60, left: 70 }; // Adjusted right margin for legend
    
//     function createLineChart(datasets, containerId, title, gradeLabels) {
//         const svg = d3.select(containerId)
//             .append("svg")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         const xScale = d3.scaleLinear()
//             .domain([0, d3.max(datasets, data => data.length - 1)])
//             .range([0, width]);

//         const yScale = d3.scaleLinear()
//             .domain([d3.min(datasets, data => d3.min(data)), d3.max(datasets, data => d3.max(data))])
//             .range([height, 0]);

//         const line = d3.line()
//             .x((d, i) => xScale(i))
//             .y(d => yScale(d));

//         const colors = ["steelblue", "orange", "green"];

//         datasets.forEach((data, index) => {
//             svg.append("path")
//                 .datum(data)
//                 .attr("fill", "none")
//                 .attr("stroke", colors[index])
//                 .attr("stroke-width", 1.5)
//                 .attr("d", line);
//         });

//         // Add the X Axis
//         svg.append("g")
//             .attr("transform", `translate(0,${height})`)
//             .call(d3.axisBottom(xScale));

//         // Add the Y Axis
//         svg.append("g")
//             .call(d3.axisLeft(yScale));

//         svg.append("text")
//             .attr("x", width / 2)
//             .attr("y", height + 40)
//             .attr("text-anchor", "middle")
//             .text("Time");

//         svg.append("text")
//             .attr("transform", "rotate(-90)")
//             .attr("x", -height / 2)
//             .attr("y", -50)
//             .attr("text-anchor", "middle")
//             .text(feature);

//         svg.append("text")
//             .attr("x", width / 2)
//             .attr("y", -10)
//             .attr("text-anchor", "middle")
//             .text(title);

//         // Add the legend
//         const legend = svg.selectAll(".legend")
//             .data(gradeLabels)
//             .enter().append("g")
//             .attr("class", "legend")
//             .attr("transform", (d, i) => `translate(${width + 20},${i * 20})`); // Position legend outside the plot

//         legend.append("rect")
//             .attr("x", 0)
//             .attr("width", 18)
//             .attr("height", 18)
//             .style("fill", (d, i) => colors[i]);

//         legend.append("text")
//             .attr("x", 24)
//             .attr("y", 9)
//             .attr("dy", ".35em")
//             .style("text-anchor", "start")
//             .text(d => d);
//     }

//     createLineChart([exam1, exam2], "#midterms", `Student ${sid} Midterms`, [`Midterm 1 grade = ${grades[0]}%`, `Midterm 2 grade = ${grades[1]}%`]);
//     createLineChart([final], "#final", `Student ${sid} Final`, [`Final grade = ${grades[2]}%`]);
// }

// // Example usage
// plotSingleStudent(1, 'TEMP');

async function getData(sid, exam, feature, timeAdjustment = 1) {
    let examName;
    if (exam === 1) {
        examName = 'Midterm 1';
    } else if (exam === 2) {
        examName = 'Midterm 2';
    } else if (exam === 3) {
        examName = 'Final';
    }

    const response = await fetch(`data/S${sid}/${examName}/${feature}.csv`);
    const text = await response.text();
    const data = d3.csvParseRows(text);

    const sessionStartUnix = +data[0][0];
    const sampleRate = +data[1][0];

    const sessionStartDt = new Date(sessionStartUnix * 1000);
    const examStartDt = new Date(sessionStartDt);
    examStartDt.setHours(sessionStartDt.getHours() + timeAdjustment, 0, 0, 0);
    const examStartTime = Math.floor(examStartDt.getTime() / 1000);

    let timePoints;
    if (examName === 'Final') {
        timePoints = d3.range(examStartTime, examStartTime + 10800 + 1, 60);
    } else {
        timePoints = d3.range(examStartTime, examStartTime + 5400 + 1, 60);
    }

    const timestamps = data.slice(2).map((row, i) => sessionStartUnix + i / sampleRate);
    const values = data.slice(2).map(row => +row[0]);

    const minuteLabels = timePoints.slice(0, -1).map(t => (t - examStartTime) / 60);
    const minuteData = new Array(minuteLabels.length).fill(0).map(() => []);

    timestamps.forEach((timestamp, i) => {
        const minuteIndex = Math.floor((timestamp - examStartTime) / 60);
        if (minuteIndex >= 0 && minuteIndex < minuteData.length) {
            minuteData[minuteIndex].push(values[i]);
        }
    });

    const avgTempPerMin = minuteData.map(arr => d3.mean(arr)).filter(d => d !== undefined);

    return avgTempPerMin;
}

async function getGrades(sid) {
    const response = await fetch('processed_data/grades.csv');
    const text = await response.text();
    const data = d3.csvParse(text);

    const sgrade = [];
    const exams = ['Midterm 1', 'Midterm 2', 'Final'];

    exams.forEach(exam => {
        const grade = data.find(row => row.Name === `S${sid}_${exam}`).Percentage_Score;
        sgrade.push(grade);
    });

    return sgrade;
}

async function plotSingleStudent(sid, feature) {
    const exam1 = await getData(sid, 1, feature);
    const exam2 = await getData(sid, 2, feature);
    const final = await getData(sid, 3, feature);

    const grades = await getGrades(sid);

    const width = 500;
    const height = 250;
    const margin = { top: 45, right: 250, bottom: 60, left: 70 }; // Adjusted right margin for legend
    
    function createLineChart(datasets, containerId, title, gradeLabels) {
        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(datasets, data => data.length - 1)])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(datasets, data => d3.min(data)), d3.max(datasets, data => d3.max(data))])
            .range([height, 0]);

        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d));

        const colors = ["steelblue", "orange", "green"];

        datasets.forEach((data, index) => {
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colors[index])
                .attr("stroke-width", 1.5)
                .attr("d", line);
        });

        // Add the X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .text("Time");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .text(feature);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(title);

        // Add the legend
        const legend = svg.selectAll(".legend")
            .data(gradeLabels)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width + 20},${i * 20})`); // Position legend outside the plot

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d, i) => colors[i]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);
    }

    // Clear existing plots
    d3.select("#midterms").selectAll("*").remove();
    d3.select("#final").selectAll("*").remove();

    createLineChart([exam1, exam2], "#midterms", `Student ${sid} Midterms`, [`Midterm 1 grade = ${grades[0]}%`, `Midterm 2 grade = ${grades[1]}%`]);
    createLineChart([final], "#final", `Student ${sid} Final`, [`Final grade = ${grades[2]}%`]);
}

// Function to update the plot based on the selected student ID
function updatePlot() {
    const studentSelect = document.getElementById("studentSelect");
    const sid = studentSelect.value;
    plotSingleStudent(sid, 'TEMP');
}

// Example usage
plotSingleStudent(1, 'TEMP');