let allData = [];
let filteredDataSets = {}; // Pre-computed datasets for each section
let canvas, ctx;

d3.csv('data/messages.csv', d => ({
    message_id: d.message_id,
    date: d.date,
    time: d.time,
    timestamp: new Date(d.full_timestamp),
    sender: d.sender,
    text: d.text,
    media_type: d.media_type,
    call_duration_seconds: d.call_duration_seconds,
    reaction_emojis: d.reaction_emojis,
    reaction_senders: d.reaction_senders,
    sentiment_compound: d.sentiment_compound,
    sentiment_category: d.sentiment_category
}))
.then(data => {
    d3.select('.loading').remove();
    allData = data;
    
    // Sort data once by timestamp
    allData.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`Loaded ${allData.length} messages`);
    
    // Pre-compute filtered datasets for each section
    precomputeFilteredData();
    
    // Initialize visualization
    initializeCanvas();
    renderVisualization('step0');
})
.catch(error => {
    console.error("Error loading the CSV file:", error);
});

function precomputeFilteredData() {
    // Pre-compute filtered datasets for each section
    sections.forEach(section => {
        if (section.filter) {
            filteredDataSets[section.id] = allData.filter(section.filter);
            console.log(`Precomputed ${filteredDataSets[section.id].length} messages for ${section.id}`);
        } else {
            filteredDataSets[section.id] = allData;
        }
    });
}

function initializeCanvas() {
    const width = 900;
    const height = 1200;
    
    // Create canvas element
    canvas = d3.select('.sticky-thing')
        .append('canvas')
        .attr('width', width)
        .attr('height', height)
        .node();
    
    ctx = canvas.getContext('2d');
}

function renderVisualization(sectionId) {
    console.time('canvas-render');
    
    const width = canvas.width;
    const height = canvas.height;
    const rectWidth = 4;
    const rectHeight = 8;
    const spacing = 4;
    const rectsPerRow = Math.floor(width / (rectWidth + spacing));
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get current section
    const currentSection = sections.find(s => s.id === sectionId);
    const dataToRender = filteredDataSets[sectionId];
    
    // If it's step0 or step5, render all data with default style
    if (sectionId === 'step0' || sectionId === 'step5') {
        // Render all messages with default style
        allData.forEach((d, i) => {
            const x = (i % rectsPerRow) * (rectWidth + spacing);
            const y = Math.floor(i / rectsPerRow) * (rectHeight + spacing);
            
            // Assign colors based on sender
            if (d.sender === 'Marco Azurin') {
                ctx.fillStyle = 'rgba(151, 184, 161, 0.7)'; // Marco's color
            } else if (d.sender === 'Kat Ventura') {
                ctx.fillStyle = 'rgba(249, 202, 137, 0.7)'; // Kat's color
            } else {
                ctx.fillStyle = 'rgba(245, 245, 245, 0.7)'; // Default color for others
            }
            
            ctx.fillRect(x, y, rectWidth, rectHeight);
        });
    } 
    // Special handling for sentiment analysis step
    else if (sectionId === 'step6') {
        // First render all messages with low opacity
        allData.forEach((d, i) => {
            const x = (i % rectsPerRow) * (rectWidth + spacing);
            const y = Math.floor(i / rectsPerRow) * (rectHeight + spacing);
            
            ctx.fillStyle = 'rgba(200, 200, 200, 0.1)'; // Default low opacity for all messages
            ctx.fillRect(x, y, rectWidth, rectHeight);
        });
        
        // Then highlight filtered data with sentiment-based colors
        dataToRender.forEach(d => {
            const i = allData.indexOf(d);
            const x = (i % rectsPerRow) * (rectWidth + spacing);
            const y = Math.floor(i / rectsPerRow) * (rectHeight + spacing);
            
            // Color based on sentiment category
            if (d.sentiment_category === 'Positive') {
                // ctx.fillStyle = 'rgba(0, 102, 204, 1.0)'; // Blue for positive
                ctx.fillStyle = '#98c1d9';
            } else if (d.sentiment_category === 'Neutral') {
                // ctx.fillStyle = 'rgba(150, 150, 150, 1.0)'; // Gray for neutral
                ctx.fillStyle = '#ebf5ee'; // Light yellow for neutral
            } else if (d.sentiment_category === 'Negative') {
                // ctx.fillStyle = 'rgba(128, 0, 128, 1.0)'; // Purple for negative
                ctx.fillStyle = '#f3b391';
            } else {
                ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'; // Default for undefined
            }
            
            ctx.fillRect(x, y, rectWidth, rectHeight);
        });
    }
    else {
        // First render all messages with low opacity
        allData.forEach((d, i) => {
            const x = (i % rectsPerRow) * (rectWidth + spacing);
            const y = Math.floor(i / rectsPerRow) * (rectHeight + spacing);
            
            // Assign colors based on sender, but with low opacity
            if (d.sender === 'Marco Azurin') {
                ctx.fillStyle = 'rgba(151, 184, 161, 0.1)'; // Marco's color
            } else if (d.sender === 'Kat Ventura') {
                ctx.fillStyle = 'rgba(249, 202, 137, 0.1)'; // Kat's color
            } else {
                ctx.fillStyle = 'rgba(245, 245, 245, 0.1)'; // Default color for others
            }
            
            ctx.fillRect(x, y, rectWidth, rectHeight);
        });
        
        // Then highlight filtered data with full opacity
        dataToRender.forEach(d => {
            const i = allData.indexOf(d);
            const x = (i % rectsPerRow) * (rectWidth + spacing);
            const y = Math.floor(i / rectsPerRow) * (rectHeight + spacing);
            
            // Always use sender-specific colors
            if (d.sender === 'Marco Azurin') {
                ctx.fillStyle = 'rgba(151, 184, 161, 1.0)'; // Marco's blue
            } else if (d.sender === 'Kat Ventura') {
                ctx.fillStyle = 'rgba(249, 202, 137, 1.0)'; // Kat's yellow
            } else {
                ctx.fillStyle = 'rgba(150, 150, 150, 1.0)'; // Default for others
            }
            
            ctx.fillRect(x, y, rectWidth, rectHeight);
        });
    }
    
    console.timeEnd('canvas-render');
}

const sections = [
    {
        id: 'step0',
        filter: null,
        highlight: null
    },
    {
        id: 'step1',
        filter: d => d.sender === 'Marco Azurin',
        highlight: d => d.sender === 'Marco Azurin', 
    },
    {
        id: 'step2',
        filter: d => d.sender === 'Kat Ventura',
        highlight: d => d.sender === 'Kat Ventura'
    },
    {
        id: 'step3',
        filter: d => d.reaction_senders && (d.reaction_senders.includes('MA') || d.reaction_senders.includes('KV')),
        highlight: d => d.reaction_senders && (d.reaction_senders.includes('MA') || d.reaction_senders.includes('KV'))
    },
    {
        id: 'step4',
        filter: d => d.media_type === 'call',
        highlight: d => d.media_type === 'call'
    },
    {
        id: 'step5',
        filter: null,
        highlight: null
    },
    {
        id: 'step6',
        filter: d => d.sentiment_category, // Filter to include all messages with sentiment
        highlight: d => d.sentiment_category // Highlight based on sentiment
    }
];

const scroller = scrollama();
scroller
    .setup({
        step: '.step',
        offset: 0.5
    })
    .onStepEnter(response => {
        console.log(`Entering step ${response.index}: ${sections[response.index].id}`);
        renderVisualization(sections[response.index].id);
    });

// Optional: For very large datasets, implement a downsampled version
function createDownsampledData(factor) {
    // Sample every Nth item
    return allData.filter((_, i) => i % factor === 0);
}
    