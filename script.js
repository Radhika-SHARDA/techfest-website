document.getElementById('groupFile').addEventListener('change', handleFileSelect, false);
document.getElementById('hostelFile').addEventListener('change', handleFileSelect, false);

let groupData = [];
let hostelData = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const contents = e.target.result;
        if (event.target.id === 'groupFile') {
            groupData = csvToArray(contents);
        } else if (event.target.id === 'hostelFile') {
            hostelData = csvToArray(contents);
        }
    };

    reader.readAsText(file);
}

function csvToArray(str, delimiter = ',') {
    const headers = str.slice(0, str.indexOf('\n')).trim().split(delimiter);
    const rows = str.slice(str.indexOf('\n') + 1).trim().split('\n');
    return rows.map(row => {
        const values = row.split(delimiter);
        return headers.reduce((object, header, index) => {
            object[header.trim()] = values[index].trim();
            return object;
        }, {});
    });
}

function processFiles() {
    if (groupData.length === 0 || hostelData.length === 0) {
        alert("Please upload both CSV files.");
        return;
    }
    
    const allocation = allocateRooms(groupData, hostelData);
    displayAllocation(allocation);
}

function allocateRooms(groups, hostels) {
    const allocation = [];
    const rooms = [...hostels];
    
    groups.forEach(group => {
        const groupSize = parseInt(group.Members);
        const groupGender = group.Gender.toLowerCase().includes('boys') ? 'Boys' : 'Girls';
        
        let allocated = false;
        
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].Gender === groupGender && parseInt(rooms[i].Capacity) >= groupSize) {
                allocation.push({
                    "Group ID": group['Group ID'],
                    "Hostel Name": rooms[i]['Hostel Name'],
                    "Room Number": rooms[i]['Room Number'],
                    "Members Allocated": groupSize
                });
                rooms.splice(i, 1);
                allocated = true;
                break;
            }
        }
        
        if (!allocated) {
            alert(`Unable to allocate room for Group ID: ${group['Group ID']}`);
        }
    });
    
    return allocation;
}

function displayAllocation(allocation) {
    const tbody = document.querySelector("#outputTable tbody");
    tbody.innerHTML = '';
    
    allocation.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    document.getElementById('downloadButton').style.display = 'block';
}

function downloadCSV() {
    const rows = [["Group ID", "Hostel Name", "Room Number", "Members Allocated"]];
    const tbody = document.querySelector("#outputTable tbody");
    for (let tr of tbody.rows) {
        const row = [];
        for (let td of tr.cells) {
            row.push(td.textContent);
        }
        rows.push(row);
    }
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "allocation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
