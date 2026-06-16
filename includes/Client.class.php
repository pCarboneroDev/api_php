<?php
    require_once('Database.class.php');

    class Client{
        public static function create_client($email, $name, $city, $telephone){
            $database = new Database();
            $conn = $database->getConnection();

            $stmt = $conn->prepare('INSERT INTO clients(email, name, city, telephone)
                VALUES(:email, :name, :city, :telephone)');
            $stmt->bindParam(':email',$email);
            $stmt->bindParam(':name',$name);
            $stmt->bindParam(':city',$city);
            $stmt->bindParam(':telephone',$telephone);

            if($stmt->execute()){
                header('HTTP/1.1 201 Cliente creado correctamente');
            } else {
                header('HTTP/1.1 404 Cliente no se ha creado correctamente');
            }
        }

        public static function delete_client_by_id($id){
            $database = new Database();
            $conn = $database->getConnection();

            $stmt = $conn->prepare('DELETE FROM clients WHERE id=:id');
            $stmt->bindParam(':id',$id);
            if($stmt->execute()){
                header('HTTP/1.1 201 Cliente borrado correctamente');
            } else {
                header('HTTP/1.1 404 Cliente no se ha podido borrar correctamente');
            }
        }

        public static function get_all_clients(){
            $database = new Database();
            $conn = $database->getConnection();
            $stmt = $conn->prepare('SELECT * FROM clients');
            if($stmt->execute()){
                $result = $stmt->fetchAll();
                echo json_encode($result);
                header('HTTP/1.1 201 OK');
            } else {
                header('HTTP/1.1 404 No se ha podido consultar los clientes');
            }
        }

        public static function update_client($id, $email, $name, $city, $telephone){
            $database = new Database();
            $conn = $database->getConnection();

            $stmt = $conn->prepare('UPDATE clients SET email=:email, name=:name, city=:city, telephone=:telephone WHERE id=:id');
            $stmt->bindParam(':email',$email);
            $stmt->bindParam(':name',$name);
            $stmt->bindParam(':city',$city);
            $stmt->bindParam(':telephone',$telephone);
            $stmt->bindParam(':id',$id);

            if($stmt->execute()){
                header('HTTP/1.1 201 Cliente actualizado correctamente');
            } else {
                header('HTTP/1.1 404 Cliente no se ha podido actualizar correctamente');
            }
        }
    }

?>