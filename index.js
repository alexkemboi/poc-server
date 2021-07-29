const Hapi = require('@hapi/hapi');
const MySQL = require('mysql');
const init = async() => {

    const connection = MySQL.createConnection({
        host: '134.209.246.16',
        user: 'testuser',
        password: '123456789',
        database: 'testDatabase',

    });
    connection.connect();
    const server = Hapi.Server({ host: 'localhost', port: 8003 });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return ('Hello World Alex!');
        }
    });
    server.route({
        method: 'GET',
        path: '/patientlist',
        handler: function(request, h) {

            return new Promise((resolve, reject) => {
                connection.query('SELECT * FROM patients', function(error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    resolve(results);
                });

            })

        }

    });

    server.route({
        method: 'GET',
        path: '/patientsearch',
        handler: function(request, h) {
            const names = request.query.name;
            return new Promise((resolve, reject) => {
                connection.query(`SELECT P.name,P.patientId,P.gender,P.phone_number,DATE_FORMAT(P.dob,"%Y-%m-%d") as dob,
                 E.hiv_status FROM patients P join encounters E on (P.patientId = E.patientId) WHERE name LIKE '${names}%'`, function(error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    resolve(results);
                });

            })

        }

    });

    server.route({
        method: 'GET',
        path: '/patient',
        handler: function(request, h) {

            return new Promise((resolve, reject) => {
                connection.query('SELECT * FROM patients', function(error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    resolve(results);
                });

            })

        }

    });



    server.route({
        method: 'GET',
        path: '/search',
        handler: function(request, h) {
            const months = request.query.months;
            return new Promise((resolve, reject) => {
                connection.query(`select L.name as location,DATE_FORMAT(E.encounter_datetime,"%Y-%m") as encounter_datetime,
                count(case when E.hiv_status='Positive' then E.hiv_status end) as positive,
                count(case when E.hiv_status='Negative' then E.hiv_status end) as negative,
                count(case when E.hiv_status='Unknown' then E.hiv_status end) as unknowns from encounters E 
                join locations L on (E.location_id = L.id)
                where date_format(E.encounter_datetime,"%Y-%m")='${months}' 
                group by location,encounter_datetime order by E.encounter_datetime desc`,
                    function(error, results, fields) {
                        if (error) throw error;
                        console.log(results);
                        resolve(results);
                    });

            })

        }

    });




    server.route({
        method: 'GET',
        path: '/patientlistreport',
        handler: function(request, h) {
            const patientstatus = request.query.patientstatus;
            return new Promise((resolve, reject) => {
                connection.query(`SELECT patients.name,patients.patientId,patients.gender,patients.phone_number,patients.dob,
                encounters.hiv_status,encounters.encounter_datetime,
                locations.name FROM patients join encounters  on (patients.patientId = encounters.patientId) 
                join locations  on (encounters.location_id=locations.id) 
                WHERE hiv_status LIKE "${patientstatus}"`,
                    function(error, results, fields) {
                        if (error) throw error;
                        console.log(results);
                        resolve(results);
                    });

            })

        }

    });


    // Start the server
    server.start();
    console.log('Server running at:', server.info.uri);
    process.on('unhandledRejection', (err) => {
        console.log(err);
        process.exit(1);
    });
}
init();