// Build nginx.conf
// Why? because nginx will perform best with a static config

const fileMapping = new Map<string, {headers: Record<string, string>}>([
    ['index.html', {
        headers: {
            'Cache-Control': 'public,max-age=0,must-revalidate',
            'Referrer-Policy': 'same-origin',
            'Strict-Transport-Security': 'max-age=63072000',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
        },
    }],
]);

/* eslint-disable no-tabs */
// language=Nginx Configuration
process.stdout.write(`# Generated by tools/build/nginx.conf.ts
load_module modules/ngx_http_brotli_static_module.so;

user nginx;
worker_processes auto;

error_log /dev/stderr notice;
pid /var/run/nginx.pid;

events {
	worker_connections 1024;
}

http {
	brotli_static on;
	gzip_static on;

	log_format main
		'access: [$time_local] ip=$remote_addr r="$request" '
		's=$status b=$body_bytes_sent ref="$http_referer" ua="$http_user_agent" '
		'rt=$request_time rl=$request_length '
		'rid=$request_id';
	access_log /dev/stdout main;

	include mime.types;
	default_type application/octet-stream;
	types {
		# Amend the mime.types
		application/manifest+json webmanifest;
		# application/javascript is obsolete, see https://www.rfc-editor.org/rfc/rfc9239. This has
		# not yet been updated by nginx, see https://trac.nginx.org/nginx/ticket/1407.
		text/javascript js;
	}

	sendfile on;
	server_tokens off;

	server {
		listen 80;
		listen [::]:80;
		server_name _;
		client_max_body_size 1M;

		root /usr/share/nginx/html;

		index index.html;

		error_page 404 /index.html;

		location = / {
		    rewrite index.html last;
		}

		location / {
			try_files $uri $uri.html =404;
		}

		location /_app/immutable {
			add_header Cache-Control "public, max-age=31536000, immutable";
		}

		location /gameicons {
			add_header Cache-Control "public, max-age=604800";
		}

		location = /readyz {
			default_type text/plain;
			return 200 'ready';
		}

		location ~ /__data\\.json$ {
			add_header Cache-Control "no-cache";
		}
${
		Array.from(fileMapping.entries(), ([file, config]) => {
			// language=Nginx Configuration
			return `
		location = /${file} {
${
				Object.entries(config.headers).map(([headerName, headerValue]) => {
					return `			add_header ${headerName} "${headerValue}";`;
				}).join('\n')}
		}`;
		}).join('\n')}
	}
}
`);
