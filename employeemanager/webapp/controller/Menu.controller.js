sap.ui.define([
    //"sap/ui/core/mvc/Controller",
    "EmployeeManager/employeemanager/controller/Base.controller"
],

    function (Base) {
        "use strict";

        function onInit() {

        };

        function onAfterRendering() {
            // Error en el framework : Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL,
            // pero no funciona en la version 1.78. Por tanto, una solución  encontrada es eliminando la propiedad id del componente por jquery
            var genericTileFirmarPedido = this.byId("SignOrders");
            //Id del dom
            var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
            //Se vacia el id
            jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        };

        var Main = Base.extend("EmployeeManager.employeemanager.controller.Menu", {});

        Main.prototype.Init = onInit;
        Main.prototype.onAfterRendering = onAfterRendering;
        return Main;
    });
