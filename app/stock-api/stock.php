<?php
/**
 * Created by PhpStorm.
 * User: kn
 * Date: 16/03/15
 * Time: 19:13
 */

session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded != null) {
    if ($decoded->function == 'save') {
        saveProducto($decoded->producto);
    } elseif ($decoded->function == 'update') {
        updateProducto($decoded->producto);
    } elseif ($decoded->function == 'deleteProducto') {
        deleteProducto($decoded->id);
    } elseif ($decoded->function == 'getProductos') {
        getProductos();
    } elseif ($decoded->function == 'getProductoByID') {
        getProductoByID($id);
    } elseif ($decoded->function == 'savePedido') {
        savePedido($decoded->data);
    } elseif ($decoded->function == 'updatePedido') {
        updatePedido($decoded->data);
    } elseif ($decoded->function == 'getPedidos') {
        getPedidos();
    } elseif ($decoded->function == 'confirmarPedido') {
        confirmarPedido($decoded->data);
    } elseif ($decoded->function == 'deletePedido') {
        deletePedido($decoded->data);
    } elseif ($decoded->function == 'deletePedidoDetalles') {
        deletePedidoDetalles($decoded->data);
    } elseif ($decoded->function == 'savePedidoDetalles') {
        savePedidoDetalles($decoded->pedido_id, json_decode($decoded->data));
    } elseif ($decoded->function == 'saveStock') {
        saveStock($decoded->pedido, $decoded->stock);
    } elseif ($decoded->function == 'getStock') {
        getStock();
    } elseif ($decoded->function == 'updateStock') {
        updateStock($decoded->stock);
    } elseif ($decoded->function == 'aReponer') {
        aReponer();
    } elseif ($decoded->function == 'trasladar') {
        trasladar($decoded->origen_id, $decoded->destino_id, $decoded->producto_id, $decoded->cantidad);
    }
} else {

    $function = $_GET["function"];
    if ($function == 'getProductos') {
        getProductos();
    }

}


//Productos +
function saveProducto($producto)
{

    $db = new MysqliDb();
    $item_decoded = json_decode($producto);
//    $fotos_decoded = json_decode($producto->fotos);
    $data = array(
        'nombre' => $item_decoded->nombre,
        'descripcion' => $item_decoded->descripcion,
        'pto_repo' => $item_decoded->ptoRepo,
        'cuenta_id' => '1.1.1.1',
        'sku' => $item_decoded->sku,
        'status' => $item_decoded->status,
        'vendidos' => 0,
        'destacado' => $item_decoded->destacado,
        'categoria_id' => $item_decoded->categoria_id,
        'producto_tipo' => $item_decoded->producto_tipo
    );


    $results = $db->insert('productos', $data);


    $res = array('status' => 1, 'results' => []);
    if ($results > -1) {

        saveFotos($item_decoded->fotos, $results);
        savePrecios($item_decoded->precios, $results);
        saveProveedores($item_decoded->proveedores, $results);
        if ($item_decoded->producto_tipo == '2') {
            saveProductosKit($item_decoded->productos_kit, $results);
        }

        $res->results = $results;
        echo $res;

    } else {
        $res->status = 0;
        echo $res;
    }
}

function updateProducto($producto)
{
    $db = new MysqliDb();
    $item_decoded = json_decode($producto);
//    $fotos_decoded = json_decode($producto->fotos);
    $data = array(
        'nombre' => $item_decoded->nombre,
        'descripcion' => $item_decoded->descripcion,
        'pto_repo' => $item_decoded->ptoRepo,
        'cuenta_id' => '1.1.1.1',
        'sku' => $item_decoded->sku,
        'status' => $item_decoded->status,
        'vendidos' => 0,
        'destacado' => $item_decoded->destacado,
        'categoria_id' => $item_decoded->categoria_id,
        'producto_tipo' => $item_decoded->producto_tipo
    );


    $db->where('producto_id', $item_decoded->producto_id);
    $results = $db->update('productos', $data);

    $db->where('producto_id', $item_decoded->producto_id);
    $db->delete('fotos_prod');

    $db->where('producto_id', $item_decoded->producto_id);
    $db->delete('precios');

    $db->where('producto_id', $item_decoded->producto_id);
    $db->delete('prov_prod');

    $db->where('kit_id', $item_decoded->producto_id);
    $db->delete('kits_prods');

    $res = array('status' => 1, 'results' => []);
    if ($results) {
        saveFotos($item_decoded->fotos, $item_decoded->producto_id);
        savePrecios($item_decoded->precios, $item_decoded->producto_id);
        saveProveedores($item_decoded->proveedores, $item_decoded->producto_id);
        if ($item_decoded->producto_tipo == '2') {
            saveProductosKit($item_decoded->productos_kit, $item_decoded->producto_id);
        }

        $res->results = $results;
        echo $res;

    } else {
        $res->status = 0;
        echo $res;
    }
}

function saveProveedores($proveedores, $producto_id)
{
    $db = new MysqliDb();
    foreach ($proveedores as $proveedor) {

        $data_prov = array(
            'producto_id' => $producto_id,
            'proveedor_id' => $proveedor
        );

        $db->insert('prov_prod', $data_prov);

    }
}

function saveProductosKit($productos_kit, $producto_id)
{
    $db = new MysqliDb();
    foreach ($productos_kit as $producto_kit) {

        $data_kit = array(
            'producto_id' => $producto_kit->producto_id,
            'kit_id' => $producto_id
        );

        $db->insert('kits_prods', $data_kit);

    }
}


function savePrecios($precios, $producto_id)
{
    $db = new MysqliDb();
    foreach ($precios as $precio) {

        $data_precio = array(
            'producto_id' => $producto_id,
            'precio_tipo_id' => $precio->tipo,
            'precio' => $precio->precio
        );

        $db->insert('precios', $data_precio);

    }
}

function saveFotos($fotos, $producto_id)
{
    $db = new MysqliDb();
    $index = 0;
    foreach ($fotos as $foto) {

        $data_foto = array(
            'producto_id' => $producto_id,
            'path' => '../images/',
            'destacado' => $index,
            'nombre' => $foto->nombre
        );

        $db->insert('fotos_prod', $data_foto);

        $index = $index + 1;
    }
}

function deleteProducto($id)
{
    $db = new MysqliDb();
    $db->where("producto_id", $id);

    $db->delete('productos');

    $db->where("producto_id", $id);
    $db->delete("fotos_prod");

    $db->where("producto_id", $id);
    $db->delete("precios");

    $db->where('kit_id', $id);
    $db->delete('kits_prods');

    echo 'borrado';
}

function getProductos()
{
    $db = new MysqliDb();
    $precios_arr = array();
    $proveedores_arr = array();
    $stocks_arr = array();
    $prods_kit_arr = array();
    $final = array();
//    $results = $db->get('productos');

    $results = $db->rawQuery(
        "SELECT producto_id,
            nombre,
            descripcion,
            pto_repo,
            cuenta_id,
            sku,
            status,
            vendidos,
            destacado,
            categoria_id,
            producto_tipo,
            (SELECT nombre FROM categorias c WHERE c.categoria_id = p.categoria_id) categoria,
            0 fotos,
            0 precios,
            0 proveedores,
            0 stocks,
            0 productos_kit
        FROM productos p
        ORDER BY nombre;");

    foreach ($results as $row) {

        $db->where("producto_id", $row["producto_id"]);
        $fotos = $db->get('fotos_prod');
        $row["fotos"] = $fotos;
        array_push($precios_arr, $row);
    }

    foreach ($precios_arr as $row) {

        $db->where("producto_id", $row["producto_id"]);
        $precios = $db->get('precios');
        $row["precios"] = $precios;
        array_push($stocks_arr, $row);
    }

    foreach ($stocks_arr as $row) {

        $db->where("producto_id", $row["producto_id"]);
        $db->where("cant_actual > 0");
        $db->orderBy('fecha_compra', 'asc');
        $precios = $db->get('stock');
        $row["stocks"] = $precios;
        array_push($proveedores_arr, $row);
    }

    foreach ($proveedores_arr as $row) {

        $db->where("producto_id", $row["producto_id"]);
        $proveedores = $db->get('prov_prod');
        $row["proveedores"] = $proveedores;
        array_push($prods_kit_arr, $row);
    }


//    Obtiene los productos del kit, y les agrega el stock
    foreach ($prods_kit_arr as $row) {

//        $db->where("kit_id", $row["producto_id"]);
//        $producto_kit = $db->get('kits_prods');
        $productos_kit = $db->rawQuery('select *, 0 stock from productos
where producto_id in (select producto_id from kits_prods where kit_id = ' . $row["producto_id"] . ')');

//        $kit_stocks = array();
        foreach ($productos_kit as $key => $stock) {

            $db->where("producto_id", $stock["producto_id"]);
            $db->where("cant_actual > 0");
            $db->orderBy('fecha_compra', 'asc');
            $stocks = $db->get('stock');
            $productos_kit[$key]["stock"] = $stocks;
//            $stock["stocks"] = $stocks;
        }


        $row["productos_kit"] = $productos_kit;
        array_push($final, $row);
    }


    echo json_encode($final);
}

function getProductoByID($id)
{

}

//Productos -

//Pedidos +

function getPedidos()
{
    $db = new MysqliDb();
    $final = array();

    $results = $db->rawQuery(
        "SELECT pedido_id,
            proveedor_id,
            (select nombre from proveedores p where p.proveedor_id = pp.proveedor_id) proveedor_nombre,
            usuario_id,
            fecha_pedido,
            fecha_entrega,
            total,
            iva,
            sucursal_id,
            0 detalles
        FROM pedidos pp
        order by pedido_id desc;");

    foreach ($results as $row) {
        $detalles = $db->rawQuery(
            "select producto_id,
                        (select nombre from productos p where pp.producto_id = p.producto_id) producto_nombre,
                        cantidad,
                        precio_unidad,
                        precio_total,
                        prod_ped_id
                      from prods_ped pp
                      where pedido_id=" . $row["pedido_id"] . ";");
        $row["detalles"] = $detalles;
        array_push($final, $row);
    }


    echo json_encode($final);
}

function savePedido($pedido)
{
    $db = new MysqliDb();
    $item_decoded = json_decode($pedido);
//    $fotos_decoded = json_decode($producto->fotos);
    $data = array(
        'proveedor_id' => $item_decoded->proveedor_id,
        'usuario_id' => 1,
        'total' => $item_decoded->total,
        'iva' => 0,
        'sucursal_id' => $item_decoded->sucursal_id
    );


    $results = $db->insert('pedidos', $data);


    $res = ['status' => 1, 'results' => 0];
    if ($results > -1) {

        savePedidoDetalles($results, $item_decoded->detalles);
        $res["results"] = $results;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }
}

function confirmarPedido($pedido)
{
    $db = new MysqliDb();
    $item_decoded = json_decode($pedido);
//    $fotos_decoded = json_decode($producto->fotos);
    $db->where('pedido_id', $item_decoded->pedido_id);
    $data = array(
        'proveedor_id' => $item_decoded->proveedor_id,
        'usuario_id' => 1,
        'total' => $item_decoded->total,
        'iva' => 0,
        'sucursal_id' => $item_decoded->sucursal_id,
        'fecha_entrega' => $db->now()
    );


    $results = $db->update('pedidos', $data);

    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $db->where('pedido_id', $item_decoded->pedido_id);
        $db->delete('prods_ped');

        savePedidoDetalles($item_decoded->pedido_id, $item_decoded->detalles);

        saveStock($item_decoded, $item_decoded->detalles);


        $res["results"] = $results;

        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }
}

function updatePedido($pedido)
{
    $db = new MysqliDb();
    $item_decoded = json_decode($pedido);
//    $fotos_decoded = json_decode($producto->fotos);
    $db->where('pedido_id', $item_decoded->pedido_id);
    $data = array(
        'proveedor_id' => $item_decoded->proveedor_id,
        'usuario_id' => 1,
        'total' => $item_decoded->total,
        'iva' => 0,
        'sucursal_id' => $item_decoded->sucursal_id
    );


    $results = $db->update('pedidos', $data);

    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $db->where('pedido_id', $item_decoded->pedido_id);
        $db->delete('prods_ped');

        savePedidoDetalles($item_decoded->pedido_id, $item_decoded->detalles);
        $res["results"] = $results;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }
}

function savePedidoDetalles($pedido_id, $detalles)
{
    $db = new MysqliDb();
    foreach ($detalles as $detalle) {

//        if ()

        $data = array(
            'pedido_id' => $pedido_id,
            'producto_id' => $detalle->producto_id,
            'cantidad' => $detalle->cantidad,
            'precio_unidad' => $detalle->precio_unidad,
            'precio_total' => $detalle->precio_total
        );

        $db->insert('prods_ped', $data);

    }
}

function deletePedido($pedido_id)
{
    $db = new MysqliDb();
    $db->where('pedido_id', $pedido_id);


    $results = $db->delete('pedidos');

    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $db->where('pedido_id', $pedido_id);
        $db->delete('prods_ped');

        $res["results"] = $results;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }
}

function deletePedidoDetalles($detalles)
{
    $db = new MysqliDb();
    $decoded = json_decode($detalles);
    foreach ($decoded as $detalle) {

        $db->where('prod_ped_id', $detalle->prod_ped_id);
        $db->delete('prods_ped');
    }

    echo $db->getLastError() || 1;
}

//Pedidos -

//Stock +
function saveStock($pedido, $detalles)
{
    $db = new MysqliDb();
    $results = -1;
    foreach ($detalles as $detalle) {
        $data = array(
            'producto_id' => $detalle->producto_id,
            'proveedor_id' => $pedido->proveedor_id,
            'sucursal_id' => $pedido->sucursal_id,
            'cant_actual' => $detalle->cantidad,
            'cant_total' => $detalle->cantidad,
            'costo_uni' => $detalle->precio_unidad
        );


        $results = $db->insert('stock', $data);

    }
//    $res = [];
//
//    if ($results > -1) {
//        $res = ['status' => 1, 'results' => $results];
//        echo $res;
//
//    } else {
//        $res->status = 0;
//        echo $res;
//    }
}

function getStock()
{
    $db = new MysqliDb();

//    $results = $db->rawQuery(
//        "SELECT stock_id,
//            fecha_compra,
//            cant_actual,
//            cant_total,
//            costo_uni,
//            producto_id,
//            sucursal_id,
//            (SELECT nombre from productos p where s.producto_id = p.producto_id) producto,
//            (SELECT nombre from proveedores pr where s.proveedor_id = pr.proveedor_id) proveedor,
//            (SELECT nombre from sucursales ss where s.sucursal_id = ss.sucursal_id) sucursal
//        FROM stock s
//        ORDER BY producto_id");

    $results = $db->rawQuery(
        "SELECT
    producto_id,
    SUM(cant_actual) cant_actual,
    sucursal_id,
    (SELECT
            nombre
        FROM
            productos p
        WHERE
            s.producto_id = p.producto_id) producto,
    (SELECT
            nombre
        FROM
            proveedores pr
        WHERE
            s.proveedor_id = pr.proveedor_id) proveedor,
    (SELECT
            nombre
        FROM
            sucursales ss
        WHERE
            s.sucursal_id = ss.sucursal_id) sucursal
FROM
    stock s
GROUP BY producto_id , sucursal_id , producto , proveedor , sucursal
ORDER BY producto_id;");

    echo json_encode($results);
}

function aReponer()
{
    $db = new MysqliDb();
    $final = [];

    $results = $db->rawQuery(
        "SELECT producto_id, p.nombre, p.pto_repo, 0 proveedores,
          (SELECT SUM(cant_actual) FROM stock s WHERE s.producto_id=p.producto_id) actual
          FROM productos p
          WHERE p.pto_repo > (SELECT SUM(cant_actual) FROM stock s WHERE s.producto_id=p.producto_id);");


    foreach ($results as $row) {
        $db->where("producto_id", $row["producto_id"]);
        $proveedores = $db->get('prov_prod');
        $row["proveedores"] = $proveedores;
        array_push($final, $row);
    }

    echo json_encode($final);
}

function updateStock($stock)
{

    $decoded = json_decode($stock);

    $results = true;

    foreach ($decoded as $row) {


        if ($row->stock_id < 1 || is_nan($row->stock_id)) {

            file_put_contents("error.txt", $row, FILE_APPEND);

        }else{
            $db = new MysqliDb();
            $data = array('cant_actual' => $row->cant_actual);
            $db->where('stock_id', $row->stock_id);

            $results = $db->update('stock', $data);
        }



    }


    $res = ['status' => 1, 'results' => 1];
    if ($results) {
        echo json_encode($res);
    } else {
        echo $db->getLastError();
    }

}

function trasladar($origen_id, $destino_id, $producto_id, $cantidad)
{
    $db = new MysqliDb();
    $cant_a_mover = $cantidad;

    $stock_origen = $db->rawQuery('select stock_id, cant_actual, costo_uni, proveedor_id from stock where sucursal_id = ' . $origen_id . '
     and producto_id = ' . $producto_id . ' order by stock_id asc');
    foreach ($stock_origen as $row) {

        if ($cant_a_mover > 0 && $row["cant_actual"] > 0) {
            if ($row["cant_actual"] < $cant_a_mover) {
                $db->where('stock_id', $row['stock_id']);
                $data = array('cant_actual' => 0);
                $db->update('stock', $data);


                $insertar = array('producto_id' => $producto_id,
                    'proveedor_id' => $row['proveedor_id'],
                    'sucursal_id' => $destino_id,
                    'cant_actual' => $cant_a_mover - $row["cant_actual"],
                    'cant_total' => $cant_a_mover - $row["cant_actual"],
                    'costo_uni' => $row['costo_uni']
                );
                $db->insert('stock', $insertar);

                $cant_a_mover = $cant_a_mover - $row["cant_actual"];
            }

            if ($row["cant_actual"] > $cant_a_mover) {

                $db->where('stock_id', $row['stock_id']);
                $data = array('cant_actual' => $row["cant_actual"] - $cant_a_mover);
                $db->update('stock', $data);

                $insertar = array('producto_id' => $producto_id,
                    'proveedor_id' => $row['proveedor_id'],
                    'sucursal_id' => $destino_id,
                    'cant_actual' => $cant_a_mover,
                    'cant_total' => $cant_a_mover,
                    'costo_uni' => $row['costo_uni']
                );
                $db->insert('stock', $insertar);

                $cant_a_mover = 0;

            }

            if ($row["cant_actual"] == $cant_a_mover) {

                $db->where('stock_id', $row['stock_id']);
                $data = array('cant_actual' => 0);
                $db->update('stock', $data);


                $insertar = array('producto_id' => $producto_id,
                    'proveedor_id' => $row['proveedor_id'],
                    'sucursal_id' => $destino_id,
                    'cant_actual' => $cant_a_mover,
                    'cant_total' => $cant_a_mover,
                    'costo_uni' => $row['costo_uni']
                );
                $db->insert('stock', $insertar);

                $cant_a_mover = 0;
            }
        }
    }

    echo json_encode($db->getLastError());
}
//Stock -