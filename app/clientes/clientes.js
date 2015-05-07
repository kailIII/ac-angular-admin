(function () {

    'use strict';


    angular.module('nombreapp.stock.clientes', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/clientes/:id', {
                templateUrl: './clientes/clientes.html',
                controller: 'ClientesController'
            });
        }])

        .controller('ClientesController', ClientesController)
        .service('ClientesService', ClientesService);

    ClientesController.$inject = ["$scope", "$routeParams", "ClientesService", "$location", "toastr"];
    function ClientesController($scope, $routeParams, ClientesService, $location, toastr) {
        var vm = this;
        vm.isUpdate = false;
        
        vm.save = save;
        vm.delete = deleteCliente;
        vm.id = $routeParams.id;
        vm.cliente = {
            nombre: ''
        };


        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            ClientesService.getClienteByID(vm.id, function (data) {
                vm.cliente = data;
                
            });
        }

        function deleteCliente() {

            var r = confirm("Realmente desea eliminar la cliente? Esta operación no tiene deshacer.");
            if (r) {

                ClientesService.deleteCliente(vm.id, function (data) {
                    toastr.success('Cliente eliminada');
                    $location.path('/listado_clientes');
                });
            }
        }

        function save() {

           

            if (vm.isUpdate) {
                ClientesService.saveCliente(vm.cliente, 'update', function (data) {

                    toastr.success('Cliente salvada con exito');
                    $location.path('/listado_clientes');
                });
            } else {
                ClientesService.saveCliente(vm.cliente, 'save', function (data) {


                    toastr.success('Cliente salvada con exito');
                    $location.path('/listado_clientes');
                });
            }
        }


    }



    ClientesService.$inject = ['$http'];
    function ClientesService($http) {
        var service = {};
        var url = './stock-api/clientes.php';
        service.getClientes = getClientes;
        service.getClienteByID = getClienteByID;
        service.getClienteByName = getClienteByName;
        service.saveCliente = saveCliente;
        service.deleteCliente = deleteCliente;


        return service;

        function getClientes(callback) {
            return $http.post(url,
                {function: 'getClientes'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function getClienteByID(id, callback) {
            getClientes(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.cliente_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getClienteByName(name, callback) {
            getClientes(function (data) {
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



        function saveCliente(cliente, _function, callback) {

            return $http.post(url,
                {function: _function, cliente: JSON.stringify(cliente)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }


        function deleteCliente(id, callback) {
            return $http.post(url,
                {function: 'deleteCliente', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

