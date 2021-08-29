sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 * @param {typeof sap.ui.core.routing.History} History
	 */
    function (Controller, History) {
        "use strict";

        function onInit() {

        };

        function navToNewEmployee() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteNewEmployee", {});
        };

        function navToViewEmployee() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteShowEmployees", {});
        };

        function onPressBackMenu() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMenu", {}, true);
            }

        };

        function onEmployeeFileChange(oEvent) {
            let oUploadCollection = oEvent.getSource();

            //Header Token CSRF - Cross-site request forgery
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("employeeModel").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

        };

        function onEmployeeFileBeforeUploadStart(oEvent) {
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.EmployeeId + ";" + oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        };

        function onEmployeeFileUploadCompleted(oEvent) {
             oEvent.getSource().getBinding("items").refresh();
        };

        function onEmployeeFileDownload(oEvent) {
            const sPath = oEvent.getSource().getBindingContext("employeeModel").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");

        };

        function onEmployeeFileDeleted(oEvent) {
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("employeeModel").getPath();
            this.getView().getModel("employeeModel").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {

                }
            });
        };



        return Controller.extend("EmployeeManager.employeemanager.controller.Base", {
            onInit: onInit,
            navToNewEmployee: navToNewEmployee,
            navToViewEmployee: navToViewEmployee,
            onPressBackMenu: onPressBackMenu,
            onEmployeeFileChange: onEmployeeFileChange,
            onEmployeeFileBeforeUploadStart: onEmployeeFileBeforeUploadStart,
            onEmployeeFileUploadCompleted: onEmployeeFileUploadCompleted,
            onEmployeeFileDownload: onEmployeeFileDownload,
            onEmployeeFileDeleted: onEmployeeFileDeleted

        });
    });
