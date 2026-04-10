<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
// ===== API 라우트 =====
$routes->group('api', function($routes) {

    $routes->get('banners/(:segment)', 'Api\BannerController::showByCode/$1');
    // 프론트용 팝업
    $routes->get('popups',           'Api\PopupController::index');
    $routes->get('popups/(:segment)', 'Api\PopupController::showByCode/$1');

    // ===== 일반 회원 인증 (JWT 없음) =====
    $routes->group('auth', function($routes) {
        $routes->post('register', 'Api\AuthController::register');
        $routes->post('login',    'Api\AuthController::login');
        $routes->post('logout',   'Api\AuthController::logout');
    });

    // ===== 공통 파일 업로드 (JWT 필요) =====
    $routes->group('', ['filter' => 'jwt'], function($routes) {
        $routes->post('upload',   'Api\FileController::upload');
        $routes->delete('upload', 'Api\FileController::delete');
    });

    // ===== 관리자 =====
    $routes->group('admin', function($routes) {

        $routes->get('me', 'Api\Admin\AdminAuthController::me');

        // 관리자 인증 (JWT 없음)
        $routes->group('auth', function($routes) {
            $routes->post('register', 'Api\Admin\AdminAuthController::register'); // 승인대기 고정
            $routes->post('login',    'Api\Admin\AdminAuthController::login');
        });

        // ===== JWT 필요 =====
        $routes->group('', ['filter' => 'jwt'], function($routes) {
            //회원관리
            $routes->group('users', function($routes) {
                $routes->get('/',                     'Api\Admin\Users\UserController::index');
                $routes->get('grades',                'Api\Admin\Users\UserController::grades');
                $routes->get('interests',             'Api\Admin\Users\UserController::interests');
                $routes->get('check-id',              'Api\Admin\Users\UserController::checkId');
                $routes->get('check-business-number', 'Api\Admin\Users\UserController::checkBizNumber');
                $routes->get('check-referrer',        'Api\Admin\Users\UserController::checkReferrer');
                $routes->post('create',               'Api\Admin\Users\UserController::create');
                $routes->get('(:num)',                'Api\Admin\Users\UserController::show/$1');
                $routes->put('(:num)',                'Api\Admin\Users\UserController::update/$1');
                $routes->delete('(:num)',             'Api\Admin\Users\UserController::delete/$1');

                $routes->get('(:num)/mileage',        'Api\Admin\Users\UserController::mileageHistory/$1');
                $routes->post('(:num)/mileage',       'Api\Admin\Users\UserController::mileageAdd/$1');
                $routes->get('(:num)/cash',           'Api\Admin\Users\UserController::cashHistory/$1');
                $routes->post('(:num)/cash',          'Api\Admin\Users\UserController::cashAdd/$1');
            });

            $routes->group('products', function($routes) {
                // 카테고리 관리
                $routes->group('categories', function ($routes) {
                    $routes->get('/',              'Api\Admin\Products\CategoryController::index');
                    $routes->get('tree',           'Api\Admin\Products\CategoryController::tree');
                    $routes->get('flat',           'Api\Admin\Products\CategoryController::flat');
                    $routes->get('themes',         'Api\Admin\Products\CategoryController::themes');
                    $routes->post('reorder',       'Api\Admin\Products\CategoryController::reorder');
                    $routes->put('toggle/(:num)',  'Api\Admin\Products\CategoryController::toggle/$1');
                    $routes->post('/',             'Api\Admin\Products\CategoryController::create');
                    $routes->get('(:num)',         'Api\Admin\Products\CategoryController::show/$1');
                    $routes->put('(:num)',         'Api\Admin\Products\CategoryController::update/$1');
                    $routes->delete('(:num)',      'Api\Admin\Products\CategoryController::delete/$1');
                });

                // 상품
                $routes->get('/',         'Api\Admin\Products\ProductController::index');
                $routes->post('/',        'Api\Admin\Products\ProductController::create');
                $routes->get('(:num)',    'Api\Admin\Products\ProductController::show/$1');
                $routes->put('(:num)',    'Api\Admin\Products\ProductController::update/$1');
                $routes->delete('(:num)', 'Api\Admin\Products\ProductController::delete/$1');
                $routes->get ('image-sizes', 'Api\Admin\Products\ProductImageSizeController::index');
                $routes->put ('image-sizes', 'Api\Admin\Products\ProductImageSizeController::updateAll');
            });

            //배송비 관리
            $routes->group('delivery-groups', function($routes) {
                $routes->get('/',         'Api\Admin\Products\DeliveryGroupController::index');
                $routes->get('all',       'Api\Admin\Products\DeliveryGroupController::all');
                $routes->post('/',        'Api\Admin\Products\DeliveryGroupController::create');
                $routes->get('(:num)',    'Api\Admin\Products\DeliveryGroupController::show/$1');
                $routes->put('(:num)',    'Api\Admin\Products\DeliveryGroupController::update/$1');
                $routes->delete('(:num)', 'Api\Admin\Products\DeliveryGroupController::delete/$1');
            });

            // 관리자 관리
            $routes->group('managers', function($routes) {
                $routes->get('',           'Api\Admin\Managers\AdminController::index');
                $routes->post('',          'Api\Admin\Managers\AdminController::store');
                $routes->get('(:num)',     'Api\Admin\Managers\AdminController::show/$1');
                $routes->post('(:num)',    'Api\Admin\Managers\AdminController::store/$1');
                $routes->put('status/(:num)', 'Api\Admin\Managers\AdminController::updateStatus/$1');
                $routes->delete('(:num)', 'Api\Admin\Managers\AdminController::delete/$1');
            });

            // 게시판 관리
            $routes->group('boards', function($routes) {
                $routes->get('',          'Api\Admin\Board\BoardController::index');
                $routes->post('',         'Api\Admin\Board\BoardController::store');
                $routes->get('(:num)',    'Api\Admin\Board\BoardController::show/$1');
                $routes->put('(:num)',    'Api\Admin\Board\BoardController::update/$1');
                $routes->delete('(:num)', 'Api\Admin\Board\BoardController::delete/$1');
                $routes->get('code/(:segment)', 'Api\Admin\Board\BoardController::showByCode/$1');
            });

            // 디자인 관리
            $routes->group('design', function($routes) {
                $routes->get('banners',           'Api\Admin\Design\BannerController::index');
                $routes->post('banners',          'Api\Admin\Design\BannerController::store');
                $routes->get('banners/(:num)',    'Api\Admin\Design\BannerController::show/$1');
                $routes->put('banners/(:num)',    'Api\Admin\Design\BannerController::update/$1');
                $routes->delete('banners/(:num)', 'Api\Admin\Design\BannerController::delete/$1');
                $routes->post('banners/(:num)/upload', 'Api\Admin\Design\BannerController::uploadImage/$1');

                $routes->get('popups',           'Api\Admin\Design\PopupController::index');
                $routes->post('popups',          'Api\Admin\Design\PopupController::store');
                $routes->get('popups/(:num)',    'Api\Admin\Design\PopupController::show/$1');
                $routes->put('popups/(:num)',    'Api\Admin\Design\PopupController::update/$1');
                $routes->delete('popups/(:num)', 'Api\Admin\Design\PopupController::delete/$1');
            });

            // 게시글 관리
            $routes->group('boards/(:segment)', function($routes) {
                $routes->get('posts',          'Api\Admin\Board\PostController::index/$1');
                $routes->post('posts',         'Api\Admin\Board\PostController::store/$1');
                $routes->get('posts/(:num)',   'Api\Admin\Board\PostController::show/$1/$2');
                $routes->put('posts/(:num)',   'Api\Admin\Board\PostController::update/$1/$2');
                $routes->delete('posts/(:num)', 'Api\Admin\Board\PostController::delete/$1/$2');
                $routes->post('files',             'Api\Admin\Board\FileController::upload/$1');
                $routes->delete('files/(:segment)', 'Api\Admin\Board\FileController::delete/$1/$2');
            });

            // 설정
            $routes->group('settings', function($routes) {
                $routes->get('site',  'Api\Admin\Settings\SiteSettingController::index');
                $routes->post('site', 'Api\Admin\Settings\SiteSettingController::store');
                $routes->post('site/upload', 'Api\Admin\Settings\SiteSettingController::uploadFile');

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