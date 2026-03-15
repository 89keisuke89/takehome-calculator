<?php
/**
 * Plugin Name: Finance Site Bootstrap
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function finance_site_force_theme() {
	$current_stylesheet = (string) get_option( 'stylesheet' );
	$current_template   = (string) get_option( 'template' );

	if ( 'finance-hub' === $current_stylesheet && 'finance-hub' === $current_template ) {
		return;
	}

	update_option( 'stylesheet', 'finance-hub' );
	update_option( 'template', 'finance-hub' );
	update_option( 'current_theme', 'Finance Hub' );
}

function finance_site_public_origin() {
	if ( empty( $_SERVER['HTTP_HOST'] ) ) {
		return '';
	}

	$host = (string) $_SERVER['HTTP_HOST'];
	if ( false === strpos( $host, 'trycloudflare.com' ) ) {
		return '';
	}

	$scheme = 'http';
	if ( ! empty( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) ) {
		$scheme = (string) $_SERVER['HTTP_X_FORWARDED_PROTO'];
	} elseif ( ! empty( $_SERVER['HTTPS'] ) && 'off' !== $_SERVER['HTTPS'] ) {
		$scheme = 'https';
	}

	return $scheme . '://' . $host;
}

function finance_site_filter_site_origin( $value ) {
	$public_origin = finance_site_public_origin();
	return '' !== $public_origin ? $public_origin : $value;
}

function finance_site_credentials_path() {
	return '/tmp/finance-shared/wordpress-credentials.json';
}

function finance_site_read_credentials() {
	$path = finance_site_credentials_path();
	if ( ! file_exists( $path ) ) {
		return array();
	}

	$json = file_get_contents( $path );
	if ( ! is_string( $json ) || '' === $json ) {
		return array();
	}

	$data = json_decode( $json, true );
	return is_array( $data ) ? $data : array();
}

function finance_site_get_basic_auth_credentials() {
	if ( isset( $_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'] ) ) {
		return array(
			'username' => (string) $_SERVER['PHP_AUTH_USER'],
			'password' => (string) $_SERVER['PHP_AUTH_PW'],
		);
	}

	if ( empty( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
		return array();
	}

	$header = (string) $_SERVER['HTTP_AUTHORIZATION'];
	if ( 0 !== stripos( $header, 'Basic ' ) ) {
		return array();
	}

	$decoded = base64_decode( substr( $header, 6 ), true );
	if ( ! is_string( $decoded ) || false === strpos( $decoded, ':' ) ) {
		return array();
	}

	list( $username, $password ) = explode( ':', $decoded, 2 );

	return array(
		'username' => (string) $username,
		'password' => (string) $password,
	);
}

function finance_site_is_authorized_request() {
	$provided = finance_site_get_basic_auth_credentials();
	$stored   = finance_site_read_credentials();

	if ( empty( $provided['username'] ) || empty( $provided['password'] ) ) {
		return false;
	}

	if ( empty( $stored['username'] ) ) {
		return false;
	}

	if ( $stored['username'] !== $provided['username'] ) {
		return false;
	}

	if ( isset( $stored['application_password'] ) && hash_equals( (string) $stored['application_password'], $provided['password'] ) ) {
		return true;
	}

	if ( isset( $stored['password'] ) && hash_equals( (string) $stored['password'], $provided['password'] ) ) {
		return true;
	}

	return false;
}

function finance_site_ensure_local_user( $stored ) {
	if ( empty( $stored['username'] ) ) {
		$admins = get_users(
			array(
				'role'   => 'administrator',
				'number' => 1,
			)
		);
		return ! empty( $admins[0] ) && $admins[0] instanceof WP_User ? $admins[0] : null;
	}

	$user = get_user_by( 'login', (string) $stored['username'] );
	if ( $user instanceof WP_User ) {
		$user->set_role( 'administrator' );
		return $user;
	}

	if ( empty( $stored['password'] ) ) {
		$admins = get_users(
			array(
				'role'   => 'administrator',
				'number' => 1,
			)
		);
		return ! empty( $admins[0] ) && $admins[0] instanceof WP_User ? $admins[0] : null;
	}

	$user_id = wp_create_user(
		(string) $stored['username'],
		(string) $stored['password'],
		'financebot@example.local'
	);

	if ( is_wp_error( $user_id ) || ! $user_id ) {
		$admins = get_users(
			array(
				'role'   => 'administrator',
				'number' => 1,
			)
		);
		return ! empty( $admins[0] ) && $admins[0] instanceof WP_User ? $admins[0] : null;
	}

	$user = get_user_by( 'id', (int) $user_id );
	if ( $user instanceof WP_User ) {
		$user->set_role( 'administrator' );
	}

	if ( $user instanceof WP_User ) {
		return $user;
	}

	$admins = get_users(
		array(
			'role'   => 'administrator',
			'number' => 1,
		)
	);

	return ! empty( $admins[0] ) && $admins[0] instanceof WP_User ? $admins[0] : null;
}

function finance_site_handle_draft_post( WP_REST_Request $request ) {
	if ( ! finance_site_is_authorized_request() ) {
		return new WP_Error(
			'finance_site_forbidden',
			'Invalid local WordPress credentials.',
			array( 'status' => 401 )
		);
	}

	$stored = finance_site_read_credentials();
	$user   = finance_site_ensure_local_user( $stored );

	if ( ! $user instanceof WP_User ) {
		return new WP_Error(
			'finance_site_user_missing',
			'Local WordPress user is missing.',
			array( 'status' => 500 )
		);
	}

	wp_set_current_user( $user->ID );

	$title   = sanitize_text_field( (string) $request->get_param( 'title' ) );
	$content = wp_kses_post( (string) $request->get_param( 'content' ) );
	$status  = sanitize_key( (string) $request->get_param( 'status' ) );

	if ( '' === $title ) {
		return new WP_Error(
			'finance_site_missing_title',
			'Title is required.',
			array( 'status' => 400 )
		);
	}

	if ( ! in_array( $status, array( 'draft', 'publish', 'pending', 'private' ), true ) ) {
		$status = 'draft';
	}

	$post_id = wp_insert_post(
		array(
			'post_type'    => 'post',
			'post_status'  => $status,
			'post_title'   => $title,
			'post_content' => $content,
			'post_author'  => $user->ID,
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}

	return rest_ensure_response(
		array(
			'id'        => (int) $post_id,
			'link'      => get_permalink( $post_id ),
			'edit_link' => get_edit_post_link( $post_id, 'raw' ),
			'status'    => get_post_status( $post_id ),
		)
	);
}

function finance_site_register_local_post_route() {
	register_rest_route(
		'finance-site/v1',
		'/draft-posts',
		array(
			'methods'             => 'POST',
			'permission_callback' => '__return_true',
			'callback'            => 'finance_site_handle_draft_post',
		)
	);
}

function finance_site_page_id_by_slug( $slug ) {
	$page = get_page_by_path( $slug );
	return $page ? (int) $page->ID : 0;
}

function finance_site_ensure_page( $slug, $title, $content ) {
	$page_id = finance_site_page_id_by_slug( $slug );
	if ( $page_id ) {
		return $page_id;
	}

	return (int) wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_content' => $content,
		)
	);
}

function finance_site_write_credentials( $data ) {
	$path = finance_site_credentials_path();
	$directory = dirname( $path );

	if ( ! is_dir( $directory ) ) {
		wp_mkdir_p( $directory );
	}

	$json = wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
	if ( ! is_string( $json ) ) {
		return;
	}

	file_put_contents( $path, $json );
}

function finance_site_bootstrap() {
	if ( wp_installing() ) {
		return;
	}

	$credentials_path = finance_site_credentials_path();
	$state            = get_option( 'finance_site_bootstrap_state', array() );
	$needs_setup      = ! file_exists( $credentials_path ) || empty( $state['user_id'] );

	if ( ! $needs_setup ) {
		return;
	}

	$user = get_user_by( 'login', 'site_admin' );

	if ( $user instanceof WP_User ) {
		$username = (string) $user->user_login;
		$email    = (string) $user->user_email;
		$user_id  = (int) $user->ID;
	} else {
		$username = 'financebot_admin';
		$email    = 'financebot@example.local';
		$user     = get_user_by( 'login', $username );

		if ( $user instanceof WP_User ) {
			$user_id = (int) $user->ID;
		} else {
			$user_id = (int) wp_create_user( $username, wp_generate_password( 24, true, true ), $email );
		}
	}

	if ( ! $user_id || is_wp_error( $user_id ) ) {
		return;
	}

	$user = get_user_by( 'id', $user_id );
	if ( ! $user instanceof WP_User ) {
		return;
	}

	$user->set_role( 'administrator' );

	$admin_password = wp_generate_password( 24, true, true );
	wp_set_password( $admin_password, $user_id );

	$home_page_id = finance_site_ensure_page(
		'finance-news-hub',
		'Finance News Hub',
		"Welcome to Finance News Hub.\n\nThis site receives finance news automatically and stores each summary as a draft post."
	);

	if ( $home_page_id > 0 ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home_page_id );
	}

	update_option( 'blogname', 'Finance News Hub' );
	update_option( 'blogdescription', 'Automated finance news summaries' );
	update_option( 'timezone_string', 'Asia/Tokyo' );
	$app_name       = 'auto-fin-blog-local';
	$app_password   = wp_generate_password( 24, false, false );

	finance_site_write_credentials(
		array(
			'site_url'             => home_url( '/' ),
			'admin_url'            => admin_url(),
			'username'             => $username,
			'password'             => $admin_password,
			'application_password' => $app_password,
			'created_at'           => gmdate( 'c' ),
		)
	);

	update_option(
		'finance_site_bootstrap_state',
		array(
			'user_id'    => $user_id,
			'app_name'   => $app_name,
			'updated_at' => gmdate( 'c' ),
		),
		false
	);
}

add_action( 'wp_loaded', 'finance_site_bootstrap', 20 );
add_action( 'muplugins_loaded', 'finance_site_force_theme', 1 );
add_action( 'rest_api_init', 'finance_site_register_local_post_route' );
add_filter( 'option_home', 'finance_site_filter_site_origin' );
add_filter( 'option_siteurl', 'finance_site_filter_site_origin' );
