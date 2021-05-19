# todo-journal

my personal ideal todo app, which is a sort of mashup of a
bullet journal and a sort of todo list

definitely a work in progress

## local dev

first do `npm run setup`

then whenever you want to dev do `npm run dev`

***TODO:*** you need to install docker and setup the dynamodb local docker stuff first if you want to be able to run fully local

## notes

collection of notes to organize into a structure

from the cloudflare docs: https://developers.cloudflare.com/workers/platform/routes

> Subdomains must have a DNS Record
>
> All subdomains must have a DNS record to be proxied on Cloudflare and
> used to invoke a Worker. For example, if you want to put a worker on
> `myname.example.com`, and you've added `example.com` to Cloudflare but
> have not added any DNS records for `example.com`, any request to
> `myname.example.com` will result in the error `ERR_NAME_NOT_RESOLVED`.
>
> To support this, you should use the Cloudflare dashboard to add an
> `AAAA` record for `myname` to `example.com`, pointing to `100::` (the
> reserved IPv6 discard prefix).

you can't do deep subdomains with workers https://community.cloudflare.com/t/community-tip-fixing-ssl-error-no-cypher-overlap-in-mozilla/42323

- Will work - www.example.com
- Will work - example.com
- Will work - test.example.com
- Will NOT work - www.test.example.com
- Will NOT work - staging.www.example.com

with that in mind...

these are all static pages

site.com - serves the main page
site.com/build/* - serves built assets
site.com/page/* - serves static pages
site.com/docs/* - serves the swagger docs

routes = ["site.com","site.com/build/*","site.com/page/*","site.com/docs/*"]

site.com/api/* - serves the api stuff
