<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->group('api', function($routes) {
    // 인증
    $routes->post('auth/register', 'Api\AuthController::register');
    $routes->post('auth/login',    'Api\AuthController::login');
    $routes->post('auth/logout',   'Api\AuthController::logout');
});