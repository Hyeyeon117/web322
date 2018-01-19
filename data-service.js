const Sequelize = require('sequelize');

const sequelize = new Sequelize('dbb550raafbp3e', 'avfzionjitpswl', 'db5c8ee2c2f7cd04448eda4f5d9b1f69ca4b7a34994511f248519b6327df8ebd', {
    host    : 'ec2-54-83-54-224.compute-1.amazonaws.com',
    dialect : 'postgres',
    port    : 5432,
    dialectOptions: {
        ssl: true
    }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch( (err) => {
        console.log('Unable to connect to the database:', err);
    });

var Employee = sequelize.define('Employee', {
    employeeNum   : {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    firstName     : Sequelize.STRING,
    last_name     : Sequelize.STRING,
    email         : Sequelize.STRING,
    SSN           : Sequelize.STRING,
    addressStreet : Sequelize.STRING,
    addresCity    : Sequelize.STRING,
    addressState  : Sequelize.STRING,
    addressPostal : Sequelize.STRING,
    maritalStatus : Sequelize.STRING,
    isManager     : Sequelize.BOOLEAN,
    employeeManagerNum : Sequelize.INTEGER,
    status        : Sequelize.STRING,
    department    : Sequelize.INTEGER,
    hireDate      : Sequelize.STRING
});

var Department = sequelize.define( 'Department', {
    departmentId  : {
        type : Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    departmentName : Sequelize.STRING
});


exports.initialize = function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then( () => {
            resolve()
        }).catch( (err)=>{
            reject("unable to sync the database");
        });
    });
};

exports.getAllEmployees = function(){
    return new Promise((resolve, reject) => {
        Employee.findAll().then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned"); 
        })
    });
};
    


exports.getEmployeesByStatus = function(status){
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where : { 
                status : status  
            } 
        }).then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned");
        });
    });
};


exports.getEmployeesByDepartment = function(department){
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where : { 
                department : department 
            } 
        }).then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned");
        });
    });
};

exports.getEmployeesByManager= function(manager){
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where : { 
                isManager : true
            } 
        }).then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned");
        });
    });
};

exports.getEmployeeByNum = function(num){
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where : { 
                employeeNum : num
            } 
        }).then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned");
        });
    });
};

exports.getManagers = function(){
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where : { 
                isManager : true
            } 
        }).then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned");
        });
    });
};

exports.getDepartments = function(){
    return new Promise((resolve, reject) => {
        Department.findAll().then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned");
        });
    });
};

exports.getDepartmentById = function(id){
    return new Promise((resolve, reject) => {
        Department.findAll({
            where : {
                departmentId : id
            }
        }).then( (data) => {
            resolve(data)
        }).catch( (err) => {
            reject("no results returned");
        });
    });
};


exports.addEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for( var i=0 in employeeData ) {
            if( employeeData[i] === "")
                employeeData[i] = null;
        }
        Employee.create({
                firstName     : employeeData.firstName,
                last_name     : employeeData.last_name,
                email         : employeeData.email,
                SSN           : employeeData.SSN,
                addressStreet : employeeData.addressStreet,
                addresCity    : employeeData.addresCity,
                addressState  : employeeData.addressState,
                addressPostal : employeeData.addressPostal,
                maritalStatus : employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum : employeeData.employeeManagerNum,
                status        : employeeData.status,
                department    : employeeData.department,
                hireDate      : employeeData.hireDate
        }).then( (data) => {
            resolve(data);
        }).catch( (err) => {
            reject("unable to create employee");
        });
    });
};
  

exports.updateEmployee = function(employeeData){
    return new Promise( (resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for( var i=0 in employeeData ) {
            if( employeeData[i] === "")
                employeeData[i] = null;
        }

        Employee.update({
                firstName     : employeeData.firstName,
                last_name     : employeeData.last_name,
                email         : employeeData.email,
                SSN           : employeeData.SSN,
                addressStreet : employeeData.addressStreet,
                addresCity    : employeeData.addresCity,
                addressState  : employeeData.addressState,
                addressPostal : employeeData.addressPostal,
                maritalStatus : employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum : employeeData.employeeManagerNum,
                status        : employeeData.status,
                department    : employeeData.department,
                hireDate      : employeeData.hireDate
        },{ 
            where: {
                employeeNum : employeeData.employeeNum 
            }
        }).then( (data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("unable to update employee");
        });    
    });
};

exports.deleteEmployeeByNum = function(empNum){
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where : { employeeNum : empNum }
        }).then( (data) => {
            resolve(data)
        }).catch((err) => {
            reject("destory rejected")
        });
    });
};

exports.addDepartment = function(departmentData){
    return new Promise(function (resolve, reject) {
        for( var i=0 in departmentData ) {
            if( departmentData[i] === "") 
                departmentData[i] = null;
        }
        Department.create({
            departmentName : departmentData.departmentName
        }).then( (data) => {
            resolve(data);
        }).catch( (err) =>{
            reject("unable to create department");
        });
    });
};

exports.updateDepartment = function(departmentData){
    return new Promise(function (resolve, reject) {
        for( var i=0 in departmentData ) {
            if( departmentData[i] === "") 
                departmentData[i] = null;
        }
        Department.update({
            departmentName : departmentData.departmentName
        },{
            where : {
                departmentId : departmentData.departmentId
            }
        }).then( (data) => {
            resolve(data);
        }).catch( (err) =>{
            reject("unable to update department");
        });
    });
};

