const exress = require('express');
const {PORT} = require('./config/server-config');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/index');
const db = require('./models/index');

const app = exress();

const setUpAndStartServer = () =>{

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true})); // help us to read request body params

    app.use('/api', apiRoutes);
    
    app.listen(PORT, () =>{
        console.log(`Server started at Port: ${PORT}`);

        if(process.env.DB_SYNC){
            db.sequelize.sync({alter:true});
        }
    });
};

setUpAndStartServer();