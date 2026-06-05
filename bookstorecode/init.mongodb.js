<?php
// -------------------------------------------------------------------------
// File name: connRedis.php
// Author:    Sydney and Tyler
// Date:      5/2/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End - Redis Bonus
// Purpose:   Helper file. Defines redis_connect() which reads the Redis
//            host/port from the [redis] section of db.ini and returns
//            an open Redis handle. Used to cache OpenLibrary author URL
//            lookups under the key Team_5:author:FNAME_LNAME:link.
// -------------------------------------------------------------------------

function redis_connect()
{
    $vConfig = parse_ini_file(__DIR__ . "/../db.ini", true);

    $vHost = $vConfig['redis']['host'] ?? '127.0.0.1';
    $vPort = (int)($vConfig['redis']['port'] ?? 6379);
    $vPass = $vConfig['redis']['password'] ?? '';

    $vRedis = new Redis();
    $vRedis->connect($vHost, $vPort);
    if ($vPass !== '') {
        $vRedis->auth($vPass);
    }
    return $vRedis;
}

function redis_close(&$p_redis)
{
    if ($p_redis instanceof Redis) {
        $p_redis->close();
    }
    $p_redis = null;
}
?>
