sap.ui.define([
    "EmployeeManager/employeemanager/controller/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof EmployeeManager.employeemanager.controller} Base
	 * @param {typeof sap.ui.model.Filter} Filter
	 * @param {typeof sap.ui.model.FilterOperator} FilterOperator

	 */
    function (Base, Filter, FilterOperator) {
        "use strict";

        function onBeforeRendering() {
        };
        function onInit() {
            
            var oRouter = this.getOwnerComponent().getRouter().getRoute("RouteShowEmployees")
            oRouter.attachPatternMatched(function (oEvent) {
                this.byId("SplitEmployee").to(this.createId("detailMainEmployee"));                
            }, this);

        };

        function onSelectEmployee(oEvent) {
            this.byId("SplitEmployee").to(this.createId("detailEmployee"));

            var context = oEvent.getParameter("listItem").getBindingContext("employeeModel");
            this.EmployeeId = context.getProperty("EmployeeId");
            var detailEmployee = this.byId("detailEmployee");
            //Concatenamos el id de empleado con el mail de usuario
            detailEmployee.bindElement("employeeModel>/Users(EmployeeId='" + this.EmployeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");

            //Bind files
            this.byId("UploadCollection").bindAggregation("items", {
                path: "employeeModel>/Attachments",
                filters: [
                    new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                    new Filter("EmployeeId", FilterOperator.EQ, this.EmployeeId),
                ],
                template: new sap.m.UploadCollectionItem({
                    documentId: "{employeeModel>AttId}",
                    visibleEdit: false,
                    fileName: "{employeeModel>DocName}"
                }).attachPress(this.onEmployeeFileDownload)

            });
        };

        function onSearchEmployee(oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var filters = [];
            if (sQuery) {

                var filter1 = new Filter([
                    new Filter("FirstName", FilterOperator.Contains, sQuery),
                    // new Filter("LastName", FilterOperator.Contains, sQuery),
                ], false);
                filters.push(filter1);
            };


            var oList = this.getView().byId("EmployeeList");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters, false);
        };

        function onGetFireEmployee(oEvent) {
            sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("showEmployeeConfirmDelete"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        var employeePath = "/Users(EmployeeId='" + this.EmployeeId + "',SapId='" + this.getOwnerComponent().SapId + "')";
                        var oSalary = this.getView().getModel("newPromoteEmployee");
                        this.getView().getModel("employeeModel").remove(employeePath, {
                            success: function (data) {
                                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("showEmployeeDeleted"));
                                this.byId("SplitEmployee").to(this.createId("detailEmployee"));
                            }.bind(this),
                            error: function () {
                                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("showEmployeeErrorDeleted"));
                            }.bind(this),
                        });
                    }
                }.bind(this)
            });
        };

        function onPromoteEmployee() {

            if (!sap.ui.getCore().byId("ButtonSavePromote")) {
                var oButtonOk = new sap.m.Button("ButtonSavePromote", {
                    text: this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeOK"),
                    tap: [this.employeePromoteSave, this]
                });
            };

            if (!sap.ui.getCore().byId("ButtonCancelPromote")) {
                var oButtonCancel = new sap.m.Button("ButtonCancelPromote", {
                    text: this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeCancel"),
                    tap: [this.employeePromoteCancel, this]
                });
            };

            if (!sap.ui.getCore().byId("DialogPromoteEmployee")) {
                var oDialog = new sap.m.Dialog("DialogPromoteEmployee", {
                    title: this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeTitle"),
                    // modal: true,
                    contentWidth: "1em",
                    buttons: [oButtonOk, oButtonCancel],
                    content: [
                        new sap.m.Label({ text: this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeSalary") }),
                        new sap.m.Input({
                            maxLength: 20,
                            id: "EmployeePromoteSalary"
                        }),

                        new sap.m.Label({ text: this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeDate") }),
                        new sap.m.DateTimePicker({ id: "EmployeePromoteDate" }),

                        new sap.m.Label({ text: this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeComments") }),
                        new sap.m.TextArea({
                            maxLength: 50,
                            id: "EmployeePromoteComments"
                        }),
                    ]
                });
                oDialog.addStyleClass("sapUiContentPadding");
            };
            sap.ui.getCore().byId("DialogPromoteEmployee").open();
        };

        function employeePromoteCancel() {
            sap.ui.getCore().byId("EmployeePromoteSalary").setValue();
            sap.ui.getCore().byId("EmployeePromoteDate").setValue();
            sap.ui.getCore().byId("EmployeePromoteComments").setValue();
            sap.ui.getCore().byId("DialogPromoteEmployee").close();
        };

        function employeePromoteSave() {

            sap.ui.getCore().byId("DialogPromoteEmployee").close();

            var employeePromoteSalary = sap.ui.getCore().byId("EmployeePromoteSalary").getValue();
            var employeePromoteDate = sap.ui.getCore().byId("EmployeePromoteDate").getDateValue();
            var employeePromoteComments = sap.ui.getCore().byId("EmployeePromoteComments").getValue();

            sap.ui.getCore().byId("EmployeePromoteSalary").setValue();
            sap.ui.getCore().byId("EmployeePromoteDate").setValue();
            sap.ui.getCore().byId("EmployeePromoteComments").setValue();

            this.promotedEmployee = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                Ammount: employeePromoteSalary,
                CreationDate: employeePromoteDate,
                Comments: employeePromoteComments,
            }), "newPromoteEmployee");
            var promotedEmployee = this.getView().getModel("newPromoteEmployee");
            var body = {
                Ammount: promotedEmployee.getData().Ammount,
                CreationDate: promotedEmployee.getData().CreationDate,
                Comments: promotedEmployee.getData().Comments,
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: this.EmployeeId
            };
            this.getView().getModel("employeeModel").create("/Salaries", body, {
                success: function () {
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeSavedOk"));
                }.bind(this),
                error: function () {
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("promoteEmployeeSavedKO"));
                }.bind(this)
            });
        }

        var Main = Base.extend("EmployeeManager.employeemanager.controller.ShowEmployees", {});

        Main.prototype.onInit = onInit;
        Main.prototype.onSelectEmployee = onSelectEmployee;
        Main.prototype.onSearchEmployee = onSearchEmployee;
        Main.prototype.onGetFireEmployee = onGetFireEmployee;
        Main.prototype.onPromoteEmployee = onPromoteEmployee;
        // Main.prototype._onObjectMached = _onObjectMached;
        Main.prototype.employeePromoteSave = employeePromoteSave;
        Main.prototype.employeePromoteCancel = employeePromoteCancel;
        Main.prototype.onBeforeRendering = onBeforeRendering;

        return Main;
    });
