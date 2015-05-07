(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('appname.stock.pedidos', ['ngRoute', 'nombreapp.stock.productos', 'nombreapp.stock.proveedores', 'toastr'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/pedidos/:id', {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: 'PedidosController'
            });
        }])
        .controller('PedidosController', PedidosController)
        .service('PedidosService', PedidosService);


    PedidosController.$inject = ['$routeParams', 'ProductosService', 'PedidosService', 'toastr', '$location', '$window',
        'ProveedoresService'];
    function PedidosController($routeParams, ProductosService, PedidosService, toastr, $location, $window, ProveedoresService) {

        var vm = this;
        vm.isUpdate = false;
        vm.id = $routeParams.id;
        vm.pedido_faltante_id = -1;
        vm.productos = [];
        vm.mostrarMoverFaltantes = false;
        vm.pedidosActivos = [];
        vm.pedido = {
            proveedor_id: 0,
            usuario_id: 0,
            fecha_pedido: '',
            fecha_entrega: '',
            total: 0,
            iva: 0,
            sucursal_id: 0,
            detalles: []
        };
        vm.detalle = {
            pedido_id: 0,
            producto_id: 0,
            producto_nombre: '',
            cantidad: 0,
            precio_unidad: 0,
            precio_total: 0
        };
        vm.producto = {
            nombre: '',
            descripcion: '',
            ptoRepo: 0,
            status: 1,
            destacado: 0,
            fotos: [],
            precios: [],
            proveedores: [],
            insumo: 0
        };
        vm.faltantes = [];
        vm.detalles = [];
        vm.proveedores = [];
        vm.proveedor = {};
        //vm.pedido.proveedor_id = 1;
        vm.pedido.sucursal_id = 1;
        vm.busqueda = '';


        //vm.mostrarPanel = mostrarPanel;
        //vm.selectProducto = selectProducto;
        vm.agregarDetalle = agregarDetalle;
        vm.removeDetalle = removeDetalle;
        vm.recalcularTotalDetalle = recalcularTotalDetalle;
        vm.save = save;
        vm.confirmar = confirmar;
        vm.agregarFaltante = agregarFaltante;
        vm.moverFaltantes = moverFaltantes;
        vm.confirmarPedidoFaltante = confirmarPedidoFaltante;
        vm.deletePedido = deletePedido;
        vm.cleanProductos = cleanProductos;

        vm.fncProductos = ProductosService.getProductoByNameProv;

        //var producto_busqueda = document.getElementById("producto_busqueda");
        //var positionLeft = angular.element(filtro_producto).prop('offsetLeft');
        //var positionTop = angular.element(filtro_producto).prop('offsetTop') + 20;
        //angular.element(producto_busqueda).css({width: '200px'});
        //angular.element(producto_busqueda).css({position: 'absolute'});
        //angular.element(producto_busqueda).css({top: positionTop + 'px'});
        //angular.element(producto_busqueda).css({left: positionLeft + 'px'});


        if (vm.id == 0) {
            vm.isUpdate = false;

            ProveedoresService.getProveedores(function (data) {
                vm.proveedores = data;
                //console.log(data[0].proveedor_id);
                //vm.producto.proveedor_id = data[0].proveedor_id;
                //vm.producto.proveedor_id = 1;

                //vm.producto.proveedor_id = data[0].proveedor_id;

                //vm.producto = {proveedor_id : data[0].proveedor_id};
                 //$scope.form = {type : $scope.typeOptions[0].value}                                                    

                //document.getElementById('proveedor').options.selectedIndex = 1;
                //console.log(document.getElementById('proveedor').options);
            });
        } else {
            vm.isUpdate = true;
            ProveedoresService.getProveedores(function (data) {
                vm.proveedores = data;
                PedidosService.getPedidoById(vm.id, function (data) {
                    vm.pedido = data;
                    vm.pedido.proveedor_id = data.proveedor_id;


                });
            });
        }


        function cleanProductos() {

            if (vm.pedido.detalles.length > 0) {

                var r = confirm('Si cambia el proveedor, todo los productos serán eliminados');
                if (r) {
                    vm.pedido.detalles = [];

                }

            }
        }

        function deletePedido() {
            PedidosService.deletePedido(vm.id,
                function (data) {
                    if (data.status > 0) {
                        toastr.success('Pedido borrado con éxito.');
                        $location.path('/listado_pedidos');
                    } else {
                        toastr.success('Error al borrar el pedido.');
                    }
                });

        }

        function recalcularTotalDetalle(detalle) {
            vm.pedido.total = parseFloat(vm.pedido.total) - parseFloat(detalle.precio_total);
            detalle.precio_total = detalle.cantidad * detalle.precio_unidad;
            vm.pedido.total = parseFloat(vm.pedido.total) + parseFloat(detalle.precio_total);
        }


        function agregarDetalle() {
            if (vm.producto.producto_id === undefined || vm.producto.producto_id == -1
                || vm.producto.producto_id == '') {
                toastr.error('Debe seleccionar un producto');
                return;
            }

            if (vm.producto.producto_id === undefined || vm.producto.producto_id == -1
                || vm.producto.producto_id == '') {
                toastr.error('Debe seleccionar un producto');
                return;
            }

            if (vm.cantidad === undefined || vm.cantidad == 0
                || isNaN(vm.cantidad)) {
                toastr.error('Debe ingresar una cantidad');
                return;
            }


            if (vm.precio_unidad_prod === undefined || vm.cantidad == 0
                || isNaN(vm.precio_unidad_prod)) {
                toastr.error('Debe seleccionar un precio');
                return;
            }

            vm.detalle = {
                pedido_id: 0,
                producto_id: vm.producto.producto_id,
                producto_nombre: vm.producto.nombre,
                cantidad: vm.cantidad,
                precio_unidad: vm.precio_unidad_prod,
                precio_total: parseInt(vm.cantidad) * parseFloat(vm.precio_unidad_prod),
                insumo: vm.producto.insumo
            };

            vm.pedido.total = parseFloat(vm.pedido.total) + parseFloat(vm.detalle.precio_total);

            vm.pedido.detalles.push(vm.detalle);

            vm.producto.producto_id = '';
            vm.producto.nombre = '';
            vm.cantidad = '';
            vm.precio_unidad_prod = '';
            document.getElementById('input01').focus();
            vm.detalle = {};


        }

        function removeDetalle(index) {
            var r = confirm('Realmente desea eliminar el producto del pedido?');
            if (r) {
                vm.pedido.total = parseFloat(vm.pedido.total) - parseFloat(vm.pedido.detalles[index].precio_total);
                vm.pedido.detalles.splice(index, 1);
            }
        }

        function confirmar() {
            PedidosService.confirmarPedido('confirmarPedido', vm.pedido,
                function (data) {
                    console.log(data);
                    if (data.status > 0) {
                        toastr.success('Pedido confirmado con éxito.');
                        $location.path('/listado_pedidos');
                    } else {
                        toastr.success('Error al confirmar el pedido.');
                    }
                });
        }

        function save() {
            if (vm.isUpdate) {
                PedidosService.updatePedido('updatePedido', vm.pedido,
                    function (data) {

                        if (data.status > 0) {
                            toastr.success('Pedido modificado con éxito.');
                            $location.path('/listado_pedidos');
                        } else {
                            toastr.success('Error al modificar el pedido.');
                        }
                    });
            } else {
                PedidosService.savePedido('savePedido', vm.pedido,
                    function (data) {

                        if (data.status > 0) {
                            toastr.success('Pedido generado con éxito.');
                            $location.path('/listado_pedidos');
                        } else {
                            toastr.success('Error al generar el pedido.');
                        }
                    });
            }
        }

        function agregarFaltante(detalle) {
            var existe = false;
            for (var i = 0; i < vm.faltantes.length; i++) {
                if (detalle === vm.faltantes[i]) {
                    existe = true;
                    vm.faltantes.splice(i, 1);
                }
            }

            if (!existe) {
                vm.faltantes.push(detalle);
            }

            //console.log(vm.faltantes);

        }


        function confirmarPedidoFaltante() {

            var total_pedido_origen = 0.0;
            var total_pedido_faltantes = 0.0;


            for (var i = 0; i < vm.faltantes.length; i++) {

                total_pedido_faltantes = parseFloat(total_pedido_faltantes) + parseFloat(vm.faltantes[i].precio_total);

            }

            total_pedido_origen = parseFloat(vm.pedido.total) - total_pedido_faltantes;
            //console.log(total_pedido_origen);
            //console.log(total_pedido_faltantes);


            vm.nuevoPedido = {
                detalles: [], iva: '', pedido_id: -1,
                proveedor_nombre: '', sucursal_id: '', total: 0.0, usuario_id: 1, proveedor_id: 0
            };

            vm.nuevoPedido.detalles = vm.faltantes;
            vm.nuevoPedido.iva = vm.pedido.iva;
            vm.nuevoPedido.pedido_id = vm.pedido.pedido_id;
            vm.nuevoPedido.proveedor_nombre = vm.pedido.proveedor_nombre;
            vm.nuevoPedido.sucursal_id = vm.pedido.sucursal_id;
            vm.nuevoPedido.total = total_pedido_faltantes;
            vm.nuevoPedido.usuario_id = vm.usuario_id;
            vm.nuevoPedido.proveedor_id = vm.pedido.proveedor_id;

            vm.pedido.total = total_pedido_origen;


            var detallesSinFaltantes = vm.pedido.detalles.filter(
                function (elem, index, array) {
                    var encontrado = false;
                    for (var x = 0; x < vm.faltantes.length; x++) {
                        if (elem.prod_ped_id == vm.faltantes[x].prod_ped_id) {
                            encontrado = true;
                        }
                    }

                    if (!encontrado) {
                        return elem;
                    }
                }
            );

            vm.pedido.detalles = detallesSinFaltantes;

            //console.log(vm.pedido);
            //console.log(vm.nuevoPedido);


            if (vm.pedido_faltante_id === -1) {

                PedidosService.savePedido('savePedido', vm.nuevoPedido, function (data) {
                    //console.log(data);
                    PedidosService.updatePedido('updatePedido', vm.pedido, function (data) {
                        toastr.success('Pedido creado con éxito');
                        $location.path('/listado_pedidos');
                        //console.log(data);
                    })
                })
            } else {
                //vm.nuevoPedido = {};
                //vm.nuevoPedido = vm.pedido;
                //vm.nuevoPedido.detalles = vm.faltantes;


                PedidosService.getPedidoById(vm.pedido_faltante_id, function (data) {

                    for (var i = 0; i < data.detalles.length; i++) {
                        vm.faltantes.push(data.detalles[i]);
                    }

                    data.detalles = vm.faltantes;
                    data.total = parseFloat(data.total) + total_pedido_faltantes;
                    //console.log(vm.pedido);
                    //console.log(data);

                    PedidosService.updatePedido('updatePedido', data, function (data) {
                        PedidosService.updatePedido('updatePedido', vm.pedido, function (data) {
                            toastr.success('Pedido modificado con éxito');
                            $location.path('/listado_pedidos');
                            //console.log(data);
                        })
                    })
                });


                //PedidosService.savePedidoDetalles(vm.pedido_faltante_id, vm.faltantes, function (data) {
                //    //console.log(data);
                //    PedidosService.updatePedido('updatePedido', vm.pedido, function (data) {
                //        toastr.success('Pedido modificado con éxito');
                //        $location.path('/listado_pedidos');
                //        //console.log(data);
                //    })
                //})
            }
        }

        function moverFaltantes() {

            if (vm.faltantes.length < 1) {
                toastr.error('No hay faltantes seleccionados');
                return;
            }

            var btn = document.getElementById("btn-faltantes");
            var btnTop = angular.element(btn).prop('offsetTop');
            var btnLeft = angular.element(btn).prop('offsetLeft');

            var porcH = (btnTop + 35) * 100 / $window.innerHeight;
            var porcW = (btnLeft + 35) * 100 / $window.innerWidth;

            var stylesheet = document.querySelector("link[href='app.css']").sheet;
            var rules = stylesheet.rules;
            //var i = rules.length - 1;
            var keyframes;
            var keyframe;

            for (var i = 0; i < rules.length; i++) {
                keyframe = rules[i];
                if (keyframe.name == 'show-faltantes') {
                    //keyframe.style.cssText = keyframe.style.cssText.replace("circle(0% at 0% 0%);", "circle(0% at 50% 50%);");
                    keyframe.cssRules[0].style.cssText = keyframe.cssRules[0].style.cssText.replace("circle(0% at 0% 0%);", "circle(0% at " + porcW + "% " + porcH + "%);");
                    keyframe.cssRules[2].style.cssText = keyframe.cssRules[2].style.cssText.replace("circle(200% at 0% 0%);", "circle(200% at " + porcW + "% " + porcH + "%);");

                }
                if (keyframe.name == 'ocultar-faltantes') {
                    //keyframe.style.cssText = keyframe.style.cssText.replace("circle(0% at 0% 0%);", "circle(0% at 50% 50%);");
                    keyframe.cssRules[0].style.cssText = keyframe.cssRules[0].style.cssText.replace("circle(200% at 0% 0%);", "circle(200% at " + porcW + "% " + porcH + "%);");
                    keyframe.cssRules[1].style.cssText = keyframe.cssRules[1].style.cssText.replace("circle(0% at 0% 0%);", "circle(0% at " + porcW + "% " + porcH + "%);");

                }
            }


            vm.mostrarMoverFaltantes = true;
            PedidosService.getPedidosActivos(vm.id, function (data) {
                vm.pedidosActivos = data;
            });

        }

        //console.log(vm.busqueda.prop('offsetTop'));

    }

    PedidosService.$inject = ['$http'];
    function PedidosService($http) {
        var service = {};
        service.savePedido = savePedido;
        service.updatePedido = updatePedido;
        service.getPedidos = getPedidos;
        service.getPedidoById = getPedidoById;
        service.confirmarPedido = confirmarPedido;
        service.getPedidosActivos = getPedidosActivos;
        service.deletePedido = deletePedido;
        service.deletePedidoDetalles = deletePedidoDetalles;
        service.savePedidoDetalles = savePedidoDetalles;

        return service;

        function getPedidos(callback) {

            return $http.post('./stock-api/stock.php',
                {function: 'getPedidos'},
                {cache: true})
                .success(function (data) {

                    for (var i = 0; i < data.length; i++) {
                        for (var x = 0; x < data[i].detalles.length; x++) {
                            data[i].detalles[x].precio_unidad = parseFloat(data[i].detalles[x].precio_unidad);
                        }
                    }

                    callback(data)
                })
                .error(function (data) {
                    console.log(data);
                });
        }

        function getPedidoById(id, callback) {

            getPedidos(function (data) {
                var response = data.filter(function (entry, index, array) {
                    return entry.pedido_id == id;
                })[0];
                callback(response);
            });

        }

        function getPedidosActivos(id, callback) {

            getPedidos(function (data) {
                var response = [];
                data.filter(function (entry, index, array) {
                    if ((entry.fecha_entrega === undefined ||
                        entry.fecha_entrega === '' ||
                        entry.fecha_entrega === null ||
                        entry.fecha_entrega === '0000-00-00 00:00:00') &&
                        entry.pedido_id != id) {

                        response.push(entry);
                    }
                });
                callback(response);
            });

        }

        function savePedido(_function, pedido, callback) {
            return $http.post('./stock-api/stock.php',
                {function: _function, data: JSON.stringify(pedido)})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function updatePedido(_function, pedido, callback) {
            return $http.post('./stock-api/stock.php',
                {function: _function, data: JSON.stringify(pedido)})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function deletePedido(pedido_id, callback) {
            return $http.post('./stock-api/stock.php',
                {function: 'deletePedido', data: pedido_id})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function deletePedidoDetalles(detalles, callback) {
            return $http.post('./stock-api/stock.php',
                {function: 'deletePedidoDetalles', data: JSON.stringify(detalles)})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function savePedidoDetalles(pedido_id, detalles, callback) {
            return $http.post('./stock-api/stock.php',
                {function: 'savePedidoDetalles', pedido_id: pedido_id, data: JSON.stringify(detalles)})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function confirmarPedido(_function, pedido, callback) {
            return $http.post('./stock-api/stock.php',
                {function: _function, data: JSON.stringify(pedido)})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

    }
})();