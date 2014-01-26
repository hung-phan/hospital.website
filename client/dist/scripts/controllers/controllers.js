define(["angular","jquery","alertify","bootstrap","functional","services"],function(e,t,n,r,i){"use strict";e.module("hospitalControllers",["hospitalServices"]).controller("Login",["$scope","$location","LoginService","AuthenticationService",function(e,t,r,i){e.login=function(){var o=new r;o.$save({username:e.signin.username,password:e.signin.password},function(r){"true"===r.validUser?(i.loginSession(e.signin.username),t.path("/home")):n.error("Wrong username or password")},function(){n.error("Server down, try again later")})}}]).controller("CreateAccount",["$scope","$location","CreateAccountService",function(e,t,r){e.signup={confirmation:"",error:!1,passwordIdentical:!0},e.change=function(){e.signup.passwordIdentical=e.signup.password===e.signup.confirmation,e.signup.error=!e.signup.passwordIdentical},e.createAccount=function(){if(!e.signup.error){var i=new r;i.$save({type:"CreateAccount",firstName:e.signup.firstName,lastName:e.signup.lastName,username:e.signup.username,password:e.signup.password},function(e){"true"==e.success?(n.success("Account successfully created"),t.path("/")):n.error("This account has been registered")},function(){n.error("Server down, try again later")})}}}]).controller("Home",["$scope","$location","WebSocketService","AuthenticationService",function(e,t,n,r){r.authenticateSession()||t.path("/"),n.connect(),e.logout=function(){r.logoutSession(),n.disconnect(),t.path("/")},e.sharedTemplate={url:"partials/main.html"},e.changeTemplateUrl=function(t){e.sharedTemplate.url="partials/"+t}}]).controller("DoctorController",["$scope","$location","WebSocketService",function(t,r,o){var s=15;t.noElements=0,t.doctors=[],t.query="",t.new={name:"",address:"",phone_number:"",working_hour:"",specialist:"",notice:"",reset:function(){for(var e in this)this.hasOwnProperty(e)&&"function"!=typeof this[e]&&(this[e]="")}},t.current={id:-1,name:"",address:"",phone_number:"",working_hour:"",specialist:"",notice:""},o.registerCallBack(function(e){var n=JSON.parse(e);if("doctor_handler"==n.type)switch(n.method){case"query":t.noElements=n.noElements,t.doctors=n.elements;break;case"create":t.doctors.unshift(n.elements[0]);break;case"update":!function(){var e=t.doctors.filter(function(e){return e.id==n.elements[0].id})[0];e&&i.simpleExtend(e,n.elements[0])}();break;case"filter":t.noElements=n.noElements,t.doctors=n.elements;break;case"delete":!function(){var e=i.findIndexByKeyValue(t.doctors,"id",n.elements[0].id);t.doctors.splice(e,1)}()}t.$apply()}),t.toggleEdit=function(n){i.simpleExtend(t.current,t.doctors.filter(function(e){return e.id==n})[0]),e.element("#edit-modal").modal("toggle")},t.toggleCreate=function(){t.new.reset(),e.element("#create-modal").modal("toggle")},t.create=function(){o.send({type:"doctor_handler",method:"create",elements:[{name:t.new.name,address:t.new.address,phone_number:t.new.phone_number,working_hour:t.new.working_hour,specialist:t.new.specialist,notice:t.new.notice}]}),e.element("#create-modal").modal("toggle")},t.update=function(n){i.simpleCompare(t.current,t.doctors.filter(function(e){return e.id==n})[0])||o.send({type:"doctor_handler",method:"update",elements:[t.current]}),e.element("#edit-modal").modal("toggle")},t.delete=function(e){n.confirm("Delete this row ?",function(t){t&&o.send({type:"doctor_handler",method:"delete",elements:[{id:e}]})})},t.filter=function(){o.send({type:"doctor_handler",method:"filter",page:1,max:s,keyword:t.query})},t.toPage=function(e){o.send({type:"doctor_handler",method:""==t.query?"query":"filter",page:e,max:s,keyword:t.query})},o.send({type:"doctor_handler",method:"query",page:1,max:s})}]).controller("PatientController",["$scope","$location","WebSocketService",function(t,r,o){var s=15;t.noElements=0,t.patients=[],t.query="",t.new={name:"",age:"",gender:"",address:"",phone_number:"",reset:function(){for(var e in this)this.hasOwnProperty(e)&&"function"!=typeof this[e]&&(this[e]="")}},t.current={id:-1,name:"",age:"",gender:"",address:"",phone_number:""},o.registerCallBack(function(e){var n=JSON.parse(e);if("patient_handler"==n.type)switch(n.method){case"query":t.noElements=n.noElements,t.patients=n.elements;break;case"create":t.patients.unshift(n.elements[0]);break;case"update":!function(){var e=t.patients.filter(function(e){return e.id==n.elements[0].id})[0];e&&i.simpleExtend(e,n.elements[0])}();break;case"filter":t.noElements=n.noElements,t.patients=n.elements;break;case"delete":!function(){var e=i.findIndexByKeyValue(t.patients,"id",n.elements[0].id);t.patients.splice(e,1)}()}t.$apply()}),t.toggleEdit=function(n){i.simpleExtend(t.current,t.patients.filter(function(e){return e.id==n})[0]),e.element("#edit-modal").modal("toggle")},t.toggleCreate=function(){t.new.reset(),e.element("#create-modal").modal("toggle")},t.create=function(){isNaN(t.new.age)?n.error("Invalid submission form!"):o.send({type:"patient_handler",method:"create",elements:[{name:t.new.name,age:t.new.age,gender:t.new.gender,address:t.new.address,phone_number:t.new.phone_number}]}),e.element("#create-modal").modal("toggle")},t.update=function(n){i.simpleCompare(t.current,t.patients.filter(function(e){return e.id==n})[0])||o.send({type:"patient_handler",method:"update",elements:[t.current]}),e.element("#edit-modal").modal("toggle")},t.delete=function(e){n.confirm("Delete this row ?",function(t){t&&o.send({type:"patient_handler",method:"delete",elements:[{id:e}]})})},t.filter=function(){o.send({type:"patient_handler",method:"filter",page:1,max:s,keyword:t.query})},t.toPage=function(e){o.send({type:"patient_handler",method:""==t.query?"query":"filter",page:e,max:s,keyword:t.query})},o.send({type:"patient_handler",method:"query",page:1,max:s})}]).controller("ICDController",["$scope","$location","WebSocketService",function(t,r,o){var s=15;t.noElements=0,t.icds=[],t.query="",t.new={name:"",code:"",reset:function(){for(var e in this)this.hasOwnProperty(e)&&"function"!=typeof this[e]&&(this[e]="")}},t.current={id:-1,name:"",code:""},o.registerCallBack(function(e){var n=JSON.parse(e);if("icd_handler"==n.type)switch(n.method){case"query":t.noElements=n.noElements,t.icds=n.elements;break;case"create":t.icds.unshift(n.elements[0]);break;case"update":!function(){var e=t.icds.filter(function(e){return e.id==n.elements[0].id})[0];e&&i.simpleExtend(e,n.elements[0])}();break;case"filter":t.noElements=n.noElements,t.icds=n.elements;break;case"delete":!function(){var e=i.findIndexByKeyValue(t.icds,"id",n.elements[0].id);t.icds.splice(e,1)}()}t.$apply()}),t.toggleEdit=function(n){i.simpleExtend(t.current,t.icds.filter(function(e){return e.id==n})[0]),e.element("#edit-modal").modal("toggle")},t.toggleCreate=function(){t.new.reset(),e.element("#create-modal").modal("toggle")},t.create=function(){o.send({type:"icd_handler",method:"create",elements:[{name:t.new.name,code:t.new.code}]}),e.element("#create-modal").modal("toggle")},t.update=function(n){i.simpleCompare(t.current,t.icds.filter(function(e){return e.id==n})[0])||o.send({type:"icd_handler",method:"update",elements:[t.current]}),e.element("#edit-modal").modal("toggle")},t.delete=function(e){n.confirm("Delete this row ?",function(t){t&&o.send({type:"icd_handler",method:"delete",elements:[{id:e}]})})},t.filter=function(){o.send({type:"icd_handler",method:"filter",page:1,max:s,keyword:t.query})},t.toPage=function(e){o.send({type:"icd_handler",method:""==t.query?"query":"filter",page:e,max:s,keyword:t.query})},o.send({type:"icd_handler",method:"query",page:1,max:s})}]).controller("DrugController",["$scope","$location","WebSocketService",function(t,r,o){var s=15;t.noElements=0,t.drugs=[],t.query="",t.new={name:"",unit:"",price:"",reset:function(){for(var e in this)this.hasOwnProperty(e)&&"function"!=typeof this[e]&&(this[e]="")}},t.current={id:-1,name:"",unit:"",price:""},o.registerCallBack(function(e){var n=JSON.parse(e);if("drug_handler"==n.type)switch(n.method){case"query":t.noElements=n.noElements,t.drugs=n.elements;break;case"create":t.drugs.unshift(n.elements[0]);break;case"update":!function(){var e=t.drugs.filter(function(e){return e.id==n.elements[0].id})[0];e&&i.simpleExtend(e,n.elements[0])}();break;case"filter":t.noElements=n.noElements,t.drugs=n.elements;break;case"delete":!function(){var e=i.findIndexByKeyValue(t.drugs,"id",n.elements[0].id);t.drugs.splice(e,1)}()}t.$apply()}),t.toggleEdit=function(n){i.simpleExtend(t.current,t.drugs.filter(function(e){return e.id==n})[0]),e.element("#edit-modal").modal("toggle")},t.toggleCreate=function(){t.new.reset(),e.element("#create-modal").modal("toggle")},t.create=function(){isNaN(t.new.price)?n.error("Invalid submission form!"):o.send({type:"drug_handler",method:"create",elements:[{name:t.new.name,unit:t.new.unit,price:t.new.price}]}),e.element("#create-modal").modal("toggle")},t.update=function(n){i.simpleCompare(t.current,t.drugs.filter(function(e){return e.id==n})[0])||o.send({type:"drug_handler",method:"update",elements:[t.current]}),e.element("#edit-modal").modal("toggle")},t.delete=function(e){n.confirm("Delete this row ?",function(t){t&&o.send({type:"drug_handler",method:"delete",elements:[{id:e}]})})},t.filter=function(){o.send({type:"drug_handler",method:"filter",page:1,max:s,keyword:t.query})},t.toPage=function(e){o.send({type:"drug_handler",method:""==t.query?"query":"filter",page:e,max:s,keyword:t.query})},o.send({type:"drug_handler",method:"query",page:1,max:s})}]).controller("MedicalServiceController",["$scope","$location","WebSocketService",function(t,r,o){var s=15;t.noElements=0,t.medicalServices=[],t.query="",t.new={name:"",price:"",reset:function(){for(var e in this)this.hasOwnProperty(e)&&"function"!=typeof this[e]&&(this[e]="")}},t.current={id:-1,name:"",price:""},o.registerCallBack(function(e){var n=JSON.parse(e);if("medical_service_handler"==n.type)switch(n.method){case"query":t.noElements=n.noElements,t.medicalServices=n.elements;break;case"create":t.medicalServices.unshift(n.elements[0]);break;case"update":!function(){var e=t.medicalServices.filter(function(e){return e.id==n.elements[0].id})[0];e&&i.simpleExtend(e,n.elements[0])}();break;case"filter":t.noElements=n.noElements,t.medicalServices=n.elements;break;case"delete":!function(){var e=i.findIndexByKeyValue(t.medicalServices,"id",n.elements[0].id);t.medicalServices.splice(e,1)}()}t.$apply()}),t.toggleEdit=function(n){i.simpleExtend(t.current,t.medicalServices.filter(function(e){return e.id==n})[0]),e.element("#edit-modal").modal("toggle")},t.toggleCreate=function(){t.new.reset(),e.element("#create-modal").modal("toggle")},t.create=function(){isNaN(t.new.price)?n.error("Invalid submission form!"):o.send({type:"medical_service_handler",method:"create",elements:[{name:t.new.name,price:t.new.price}]}),e.element("#create-modal").modal("toggle")},t.update=function(n){i.simpleCompare(t.current,t.medicalServices.filter(function(e){return e.id==n})[0])||o.send({type:"medical_service_handler",method:"update",elements:[t.current]}),e.element("#edit-modal").modal("toggle")},t.delete=function(e){n.confirm("Delete this row ?",function(t){t&&o.send({type:"medical_service_handler",method:"delete",elements:[{id:e}]})})},t.filter=function(){o.send({type:"medical_service_handler",method:"filter",page:1,max:s,keyword:t.query})},t.toPage=function(e){o.send({type:"medical_service_handler",method:""==t.query?"query":"filter",page:e,max:s,keyword:t.query})},o.send({type:"medical_service_handler",method:"query",page:1,max:s})}]).controller("MedicalHistoryController",["$scope","$location","$q","WebSocketService",function(r,o,s,a){function c(e,t,n){for(var r in t)t.hasOwnProperty(r)&&typeof t[r]==n&&(t[r]=e)}function d(e,t){var n={};for(var r in e)e.hasOwnProperty(r)&&typeof e[r]==t&&(n[r]=e[r]);return n}function l(e,t,n){return a.send({type:"medical_history_handler",method:e,value:t}),n.promise}var u=15;e.element("input[name='datepicker']").datepicker({todayBtn:"linked"}).on("changeDate",function(e){r.$apply(function(){r.create.toggle?r.create.visit_date=e.currentTarget.value:r.edit.visit_date=e.currentTarget.value})}),r.medicalHistories=[],r.noElements=0,r.create={toggle:!1,visit_date:"",outcome:"",patient_name:"",icd_code:"",prescriptions:{doctor_name:"",data:[],"new":{show:!1,drug_name:"",quantity:"",dose:"",notice:"",toggleShow:function(){this.show=!this.show},reset:function(){c("",this,"string")}}},lab_orders:{doctor_name:"",data:[],"new":{show:!1,result:"",toggleShow:function(){this.show=!this.show},reset:function(){c("",this,"string")}}},services:{service_type:"",data:[],"new":{show:!1,medical_service_name:"",toggleShow:function(){this.show=!this.show},reset:function(){c("",this,"string")}}},reset:function(){c("",this,"string"),c("",this.prescriptions,"string"),this.prescriptions.new.show=!1,this.prescriptions.data.length=0,c("",this.lab_orders,"string"),this.lab_orders.new.show=!1,this.lab_orders.data.length=0,c("",this.services,"string"),this.services.new.show=!1,this.services.data.length=0}},r.edit={toggle:!1,visit_date:"",outcome:"",patient_name:"",icd_code:"",prescriptions:{doctor_name:"",data:[],"new":{show:!1,drug_name:"",quantity:"",dose:"",notice:"",toggleShow:function(){this.show=!this.show},reset:function(){c("",this,"string")}}},lab_orders:{doctor_name:"",data:[],"new":{show:!1,result:"",toggleShow:function(){this.show=!this.show},reset:function(){c("",this,"string")}}},services:{service_type:"",data:[],"new":{show:!1,medical_service_name:"",toggleShow:function(){this.show=!this.show},reset:function(){c("",this,"string")}}},reset:function(){c("",this,"string"),c("",this.prescriptions,"string"),this.prescriptions.new.show=!1,this.prescriptions.data.length=0,c("",this.lab_orders,"string"),this.lab_orders.new.show=!1,this.lab_orders.data.length=0,c("",this.services,"string"),this.services.new.show=!1,this.services.data.length=0}},r.enter=function(e){e.reset(),e.toggleShow()},r.input=function(e){var t=d(e.new,"string");t.editMode=!1,e.data.push(t),r.enter(e.new)};var m=s.defer(),p=s.defer(),h=s.defer(),f=s.defer(),g=s.defer();r.getPatients=function(e){return l("patient_lookup",e,m)},r.getDoctors=function(e){return l("doctor_lookup",e,p)},r.getDrugs=function(e){return l("drug_lookup",e,h)},r.getMedicalServices=function(e){return l("medical_service_lookup",e,f)},r.getICDs=function(e){return l("icd_lookup",e,g)},r.deleteElement=function(e,t,i){n.confirm("Delete this row ?",function(n){n&&r.$apply(function(){e.splice(t,i)})})},r.createSubmit=function(){var e=[];r.create.prescriptions.data.forEach(function(t){e.push({drug_name:t.drug_name,quantity:t.quantity,dose:t.dose,notice:t.notice})});var t=[];r.create.lab_orders.data.forEach(function(e){t.push({result:e.result})});var n=[];r.create.services.data.forEach(function(e){n.push({medical_service_name:e.medical_service_name})}),a.send({type:"medical_history_handler",method:"create",elements:[{visit_date:r.create.visit_date,patient_name:r.create.patient_name,icd_code:r.create.icd_code,outcome:r.create.outcome,prescriptions:{doctor_name:r.create.prescriptions.doctor_name,data:e},lab_orders:{doctor_name:r.create.lab_orders.doctor_name,data:t},services:{service_type:r.create.services.service_type,data:n}}]}),r.create.toggle=!1,r.create.reset()},r.editRecord=function(e){[r.edit.prescriptions,r.edit.lab_orders,r.edit.services].forEach(function(e){e.data.length=0}),t.extend(!0,r.edit,r.medicalHistories[e])},r.updateSubmit=function(){var e=t.extend(!0,{},r.edit);delete e.prescriptions.new,delete e.lab_orders.new,delete e.services.new,a.send({type:"medical_history_handler",method:"update",elements:[e]}),r.edit.toggle=!1},r.delete=function(e){n.confirm("Delete this medical history ?",function(t){t&&a.send({type:"medical_history_handler",method:"delete",elements:[{id:r.medicalHistories[e].id}]})})},r.export=function(){o.path("/export")},r.filter=function(){a.send({type:"medical_history_handler",method:"filter",page:1,max:u,keyword:r.query})},r.toPage=function(e){a.send({type:"medical_history_handler",method:""===r.query?"query":"filter",page:e,max:u,keyword:r.query})},a.registerCallBack(function(e){var t=JSON.parse(e);if("medical_history_handler"==t.type)switch(t.method){case"query":r.noElements=t.noElements,r.medicalHistories=t.elements;break;case"create":r.medicalHistories.unshift(t.elements[0]);break;case"update":!function(){var e=r.medicalHistories.filter(function(e){return e.id==t.elements[0].id})[0];e&&i.simpleExtend(e,t.elements[0])}();break;case"filter":r.noElements=t.noElements,r.medicalHistories=t.elements;break;case"delete":!function(){var e=i.findIndexByKeyValue(r.medicalHistories,"id",t.elements[0].id);r.medicalHistories.splice(e,1)}();break;case"patient_lookup":m.resolve(t.elements),m=s.defer();break;case"doctor_lookup":p.resolve(t.elements),p=s.defer();break;case"drug_lookup":h.resolve(t.elements),h=s.defer();break;case"medical_service_lookup":f.resolve(t.elements),f=s.defer();break;case"icd_lookup":g.resolve(t.elements),g=s.defer()}r.$apply()}),a.send({type:"medical_history_handler",method:"query",page:1,max:u})}])});