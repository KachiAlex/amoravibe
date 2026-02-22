Netlify build cloning error — troubleshooting

Problem

- Error seen in Netlify build logs:
  "Unable to access repository... Host key verification failed. fatal: Could not read from remote repository. User git error while checking for ref refs/heads/master"

Quick summary

- This is an access / authentication problem between Netlify and your Git provider (GitHub). It happens before the build starts (Netlify cannot clone the repo).

Action checklist (do these in order)

1) Reconnect repository in Netlify UI (fastest fix)
   - Site settings → Build & deploy → Continuous Deployment → Repository
   - Click "Reconnect" or "Change repository" and re-authorize Netlify with GitHub.
   - Confirm the repository and branch (master / main) are correct.

2) Verify OAuth / Git provider permissions
   - In GitHub: Settings → Applications → Authorized OAuth Apps → Netlify — ensure it has access to this repo.
   - If you use a GitHub App for Netlify, ensure the app is installed for the repository and has `contents: read` permission.

3) If Netlify is using SSH to access the repo (uncommon for ordinary repos)
   - In Netlify UI, get the site's deploy SSH public key (Site settings → Build & deploy → Continuous Deployment → Deploy keys).
   - Add that public key in GitHub as a repository Deploy key (Repo → Settings → Deploy keys → Add key) with read access.
   - If you use private submodules hosted on another host, add Netlify's key to those hosts as well.

4) Confirm branch exists on remote
   - Ensure Netlify is set to use the branch that actually exists (e.g., `main` or `master`).
   - Check GitHub/Git to confirm branch name.

5) Revoke & re-authorize Netlify (if problems persist)
   - Remove Netlify OAuth app from GitHub and re-add it via the Netlify "Connect to Git provider" flow.

6) As a short-term fallback: use GitHub Actions to push a built artifact to Netlify (manual deploy)
   - Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` repository secrets in GitHub.
   - Use the provided `netlify-deploy-fallback` workflow (repo contains a template) to build and deploy from CI (this bypasses Netlify's repo clone step).
   - Note: deploying Next.js server/runtime-only artifacts via `netlify deploy` may not fully replicate Netlify's in-platform serverless build — use as a temporary workaround.

Verification

- After reconnecting, trigger a manual deploy in Netlify (Deploys → Trigger deploy) or push to the configured branch and confirm the build proceeds past "Preparing repo".
- If the build still fails with host-key errors, check repository-level settings and revoke/reconnect Netlify.

If you want, I can:
- Reconnect Netlify for you (requires Netlify account access).
- Add or enable the GitHub Actions fallback deploy workflow (I can add the workflow file; you will need to set two secrets: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`).

References

- Netlify docs: https://docs.netlify.com/configure-builds/troubleshooting-tips/#build-fails-with-error-128
- Netlify deploy keys: https://docs.netlify.com/configure-builds/manage-deploy-keys/
