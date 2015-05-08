(function () {

    'use strict';


    angular.module('nombreapp.stock.depositos', ['ngRoute', 'toastr', 'acMovimientos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/depositos/:id', {
                templateUrl: './depositos/depositos.html',
                controller: 'DepositosController'
            });
        }])

        .controller('DepositosController', DepositosController)
        .service('DepositosService', DepositosService);

    DepositosController.$inject = ["$scope", "$routeParams", "DepositosService", "$location", "toastr", "MovimientosService"];
    function DepositosController($scope, $routeParams, DepositosService, $location, toastr, MovimientosService) {
        var vm = this;
        vm.movimiento = '000';
        vm.comentario = 'Movimiento entre cuentas';
        vm.subtipo = '00';
        vm.forma_pago = '01';
        vm.save = save;
        vm.id = $routeParams.id;
        vm.destino = '01';
        vm.origen = '04';


        function save() {
            console.log(vm.importe);
            //tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, cliente_id, usuario_id, comentario, callback
            MovimientosService.armarMovimiento(vm.movimiento, vm.subtipo, 1, vm.destino, vm.origen, vm.importe, '', vm.comentario, [], 0, 1, vm.comentario, function(data){
                console.log(data);
            } );
        }


    }



    DepositosService.$inject = ['$http'];
    function DepositosService($http) {
        var service = {};
        var url = './stock-api/depositos.php';
        service.getDepositos = getDepositos;
        service.getDepositoByID = getDepositoByID;
        service.getDepositoByName = getDepositoByName;
        service.saveDeposito = saveDeposito;
        service.deleteDeposito = deleteDeposito;


        return service;

        function getDepositos(callback) {
            return $http.post(url,
                {function: 'getDepositos'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function getDepositoByID(id, callback) {
            getDepositos(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.deposito_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getDepositoByName(name, callback) {
            getDepositos(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
                });
                callback(response);
            })

        }



        function saveDeposito(deposito, _function, callback) {

            return $http.post(url,
                {function: _function, deposito: JSON.stringify(deposito)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }


        function deleteDeposito(id, callback) {
            return $http.post(url,
                {function: 'deleteDeposito', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();
