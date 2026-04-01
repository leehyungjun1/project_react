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

    // 관리자 인증
    $routes->post('admin/auth/register', 'Api\AdminAuthController::register');
    $routes->post('admin/auth/login',    'Api\AdminAuthController::login');

    // 관리자 관리
    $routes->get('admin/managers',                'Api\Admin\Managers\AdminController::index');
    $routes->put('admin/managers/status/(:num)',  'Api\Admin\Managers\AdminController::updateStatus/$1');
    $routes->delete('admin/managers/(:num)',      'Api\Admin\Managers\AdminController::delete/$1');

    // 설정 - 코드 관리
    $routes->get('admin/settings/codes',           'Api\Admin\Settings\CodeController::index');
    $routes->post('admin/settings/codes',          'Api\Admin\Settings\CodeController::store');
    $routes->put('admin/settings/codes/(:num)',    'Api\Admin\Settings\CodeController::update/$1');
    $routes->delete('admin/settings/codes/(:num)', 'Api\Admin\Settings\CodeController::delete/$1');
    $routes->post('admin/settings/codes/reorder',  'Api\Admin\Settings\CodeController::reorder');
});