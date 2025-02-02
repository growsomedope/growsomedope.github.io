
const express = require('express'); 
const mysql = require('mysql2'); 
const cors = require('cors');

// Create an instance of express
const app = express();
app.use(cors());

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: "localhost", 
    user: "root",     
    password: "brahms",
});

// Define a route for the root URL '/'
app.get('/', (req, res) => {
    // Respond with a JSON message
    return res.json("From backend side");
});

// Define a route to fetch all items from the 'items' table
app.get('/data', (req, res) => {
    const med = req.query.med || ""
    const providerLastName = req.query.providerLastName || ""
    const providerFirstName = req.query.providerFirstName || ""
    const state = req.query.state || ""
    let flag = false
    let sql = `select * from other_prescriber.records`
    if (med || providerLastName || providerFirstName || state) {
        flag = true
        sql = sql + ' where '
    }
    if (med) {
        sql = sql + `gnrc_name like '%${med}%' and `
    }
    if (providerLastName) {
        sql = sql + `prscrbr_last_org_name like '%${providerLastName}%' and `
    }
    if (providerFirstName) {
        sql = sql + `prscrbr_first_name like '%${providerFirstName}%' and `
    }
    if (state) {
        sql = sql + `prscrbr_state_abrvtn like '%${state}%' and `
    }
    if (flag) sql = sql.slice(0, -4)
    sql = sql + ' order by tot_day_suply desc'
    db.query(sql, (err, data) => { 
        if (err) return res.json(err); 
        return res.send(convertJSONToTable(data))
    })
});

function convertJSONToTable(jsonData) {
    let headers;
    try {
        headers = Object.keys(jsonData[0])
    }catch{
        return '<h1>Sorry, no results found :(</h1>'
    }
    headers = [headers[1], headers[2], headers[3], headers[4], headers[6], headers[8], headers[11]]
    const displayHeaders = ['Provider Last Name', 'Provider First Name', 'Provider City', 'Provider State', 'Specialty', 'Medication', 'Total 30-day fills in 2022']
    let table = '<head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></head><table class="table"><thead><tr>';
    displayHeaders.forEach(header => table += `<th>${header}</th>`);
    table += '</tr></thead><tbody>';

    jsonData.forEach(row => {
    table += '<tr>';
    headers.forEach(header => table += `<td>${row[header]}</td>`);
    table += '</tr>';
    });
    table += '</tbody></table>';
    return table
}
// Start the server and listen on port 8081
app.listen(8081, () => {
    console.log("listening");
});
