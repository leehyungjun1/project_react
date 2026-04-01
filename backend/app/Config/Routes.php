<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
// ===== API 라우트 =====
$routes->group('api', function($routes) {

    // ===== 일반 회원 인증 (JWT 없음) =====
    $routes->group('auth', function($routes) {
        $routes->post('register', 'Api\AuthController::register');
        $routes->post('login',    'Api\AuthController::login');
        $routes->post('logout',   'Api\AuthController::logout');
    });

    // ===== 관리자 =====
    $routes->group('admin', function($routes) {

        // 관리자 인증 (JWT 없음)
        $routes->group('auth', function($routes) {
            $routes->post('register', 'Api\Admin\AdminAuthController::register'); // 승인대기 고정
            $routes->post('login',    'Api\Admin\AdminAuthController::login');
        });

        // ===== JWT 필요 =====
        $routes->group('', ['filter' => 'jwt'], function($routes) {

            // 관리자 관리
            $routes->group('managers', function($routes) {
                $routes->get('',                  'Api\Admin\Managers\AdminController::index');
                $routes->post('',                 'Api\Admin\Managers\AdminController::store');
                $routes->put('status/(:num)',     'Api\Admin\Managers\AdminController::updateStatus/$1');
                $routes->delete('(:num)',         'Api\Admin\Managers\AdminController::delete/$1');
            });

            // 설정
            $routes->group('settings', function($routes) {

                // 코드 관리
                $routes->group('codes', function($routes) {
                    $routes->get('',              'Api\Admin\Settings\CodeController::index');
                    $routes->post('',             'Api\Admin\Settings\CodeController::store');
                    $routes->post('reorder',      'Api\Admin\Settings\CodeController::reorder');
                    $routes->get('by/(:segment)', 'Api\Admin\Settings\CodeController::getByCode/$1');
                    $routes->put('(:num)',         'Api\Admin\Settings\CodeController::update/$1');
                    $routes->delete('(:num)',      'Api\Admin\Settings\CodeController::delete/$1');
                });

            });

        });

    });

});