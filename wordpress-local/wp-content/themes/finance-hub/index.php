<?php
get_header();
?>
<main class="site-shell">
	<header class="site-header">
		<p class="site-tagline"><?php bloginfo( 'description' ); ?></p>
		<h1 class="site-title"><?php bloginfo( 'name' ); ?></h1>
	</header>

	<section class="hero">
		<h2>Automated finance headlines, rewritten into draft posts.</h2>
		<p>This local WordPress site receives finance RSS items and stores each generated summary as a WordPress draft through the REST API.</p>
	</section>

	<section class="post-list">
		<?php if ( have_posts() ) : ?>
			<?php while ( have_posts() ) : ?>
				<?php the_post(); ?>
				<article class="post-card">
					<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
					<div><?php the_excerpt(); ?></div>
					<p class="post-meta">Status: <?php echo esc_html( get_post_status() ); ?> | Published: <?php echo esc_html( get_the_date() ); ?></p>
				</article>
			<?php endwhile; ?>
		<?php else : ?>
			<article class="post-card">
				<h3>No posts yet</h3>
				<p>Run the finance bot and draft posts will appear here.</p>
			</article>
		<?php endif; ?>
	</section>
</main>
<?php
get_footer();
