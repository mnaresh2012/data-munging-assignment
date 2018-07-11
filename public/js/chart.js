function getData(url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      success: data => resolve(data),
      error: (xhr, err) => {
        reject(err);
      },
    });
  });
}

// D3 code from Examples modified to work with current data
// Stack Chart
const drawStackChart = (() => {
  const marginStackChart = {
    top: 20, right: 60, bottom: 30, left: 80,
  };
  const widthStackChart = 900 - marginStackChart.left - marginStackChart.right;
  const heightStackChart = 600 - marginStackChart.top - marginStackChart.bottom;

  const xStackChart = d3.scaleBand()
    .range([0, widthStackChart])
    .padding(0.1);
  const yStackChart = d3.scaleLinear()
    .range([heightStackChart, 0]);


  const colorStackChart = d3.scaleOrdinal(['#7b6888', '#ff8c00']);


  const canvasStackChart = d3.select('#dash-chart').append('svg')
    .attr('width', widthStackChart + marginStackChart.left + marginStackChart.right)
    .attr('height', heightStackChart + marginStackChart.top + marginStackChart.bottom)
    .append('g')
    .attr('transform', `translate(${marginStackChart.left},${marginStackChart.top})`);

  return (input) => {
    let data = input;
    data = Object.values(data);
    colorStackChart.domain(d3.keys(data[0]).filter(key => key !== 'year'));
    data.forEach((d) => {
      let y0 = 0;
      d.ages = colorStackChart.domain().map((name) => {
        const obj = { name, y0, y1: y0 += +d[name] };
        return obj;
      });
      d.total = d.ages[d.ages.length - 1].y1;
    });

    data.sort((a, b) => b.total - a.total);

    xStackChart.domain(data.map(d => d.year));
    yStackChart.domain([0, d3.max(data, d => d.total)]);

    canvasStackChart.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${heightStackChart})`)
      .call(d3.axisBottom(xStackChart));

    canvasStackChart.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(yStackChart))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('No Of Buildings');

    const state = canvasStackChart.selectAll('.year')
      .data(data)
      .enter().append('g')
      .attr('class', 'g')
      .attr('transform', d => `translate(${  xStackChart(d.year)  },0)`);

    state.selectAll('rect')
      .data(d => d.ages)
      .enter().append('rect')
      .attr('width', xStackChart.bandwidth())
      .attr('y', d => yStackChart(d.y1))
      .attr('height', d => yStackChart(d.y0) - yStackChart(d.y1))
      .style('fill', d => colorStackChart(d.name));

    const legend = canvasStackChart.selectAll('.legend')
      .data(colorStackChart.domain().slice().reverse())
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${  i * 20  })`);

    legend.append('rect')
      .attr('x', widthStackChart - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', colorStackChart);

    legend.append('text')
      .attr('x', widthStackChart - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(d => d);
  };
})();

// Line Chart
const drawLineChart = (() => {
  const margin = {
    top: 20, right: 20, bottom: 30, left: 50,
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // parse the date / time
  const parseTime = d3.timeParse('%Y');

  // set the ranges
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // define the line
  const valueline = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.nonArrestCount));
    // define the line
  const valueline2 = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.arrestCount));

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
  const svg = d3.select('#line-chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
      `translate(${margin.left},${margin.top})`);

  return (da) => {
    const data = Object.values(da);


    // format the data
    data.forEach((d) => {
      d.year = parseTime(d.year);
    });

    // sort years ascending
    data.sort((a, b) => a.year - b.year);

    // Scale the range of the data
    x.domain(d3.extent(data, d => d.year));
    y.domain([0, d3.max(data, d => Math.max(d.arrestCount, d.nonArrestCount))]);

    // Add the valueline path.
    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', valueline);
    // Add the valueline path.
    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', valueline2);
      
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));
    const legend = svg.selectAll('.legend')
      .data(['No-Arrests', 'Arrests'])
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${  i * 20  })`);
    legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', d3.scaleOrdinal(['steelblue', 'rgb(180, 7, 65)']));
    legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(d => d);
  };
})();

getData('./../jsonData/theft.json').then(drawStackChart).catch((err) => {
  console.log(err);
});

(async function drawLine() {
  try {
    const dat = await getData('./../jsonData/assault.json');
    drawLineChart(dat);
  } catch (err) {
    console.log(err);
  }
}());
