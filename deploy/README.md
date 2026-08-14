# Backend deployment bundle

This directory is the complete production bundle for the backend. Copy it to
`/opt/talent-lab/deploy` on the VPS and keep every file used by `deploy.sh`
owned by root. Do not authorize a sudo command from a deploy-user-writable path.

## One-time VPS setup

1. Copy this directory to `/opt/talent-lab/deploy`.
2. Create `.env.production` from `.env.production.example` and fill the real secrets.
3. Set ownership and permissions:

   ```bash
   sudo chown -R root:root /opt/talent-lab
   sudo chmod 755 /opt/talent-lab /opt/talent-lab/deploy
   sudo chmod 700 /opt/talent-lab/deploy/deploy.sh
   sudo chmod 600 /opt/talent-lab/deploy/.env.production
   ```

4. Log root in to the private GHCR package with a token limited to `read:packages`:

   ```bash
   sudo docker login ghcr.io -u chiyuchia
   ```

5. Allow the SSH deploy user to invoke only the root-owned deployment script. Use
   `sudo visudo -f /etc/sudoers.d/talent-lab-deploy` and add:

   ```sudoers
   deploy ALL=(root) NOPASSWD: /opt/talent-lab/deploy/deploy.sh
   ```

## Deploy an image

Always deploy an immutable digest produced by GitHub Actions:

```bash
sudo /opt/talent-lab/deploy/deploy.sh \
  ghcr.io/chiyuchia/talent-lab-backend@sha256:<64-hex-digest>
```

The script validates the image repository, pulls it, creates an online SQLite
backup in the data volume, runs the idempotent migration, starts the service,
waits for the health check, and records the active image in `.env.release`.
Local volume backups do not replace an encrypted off-site backup.

## GitHub Actions deployment

The `production` GitHub Environment must provide these secrets:

- `TALENT_LAB_VPS_SSH_KEY`
- `VPS_SSH_KNOWN_HOSTS`

It must also provide these variables:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`

Pushes to `main` and `master` build immutable images. Only `master` deploys to
the production VPS. Deployment configuration changes in this directory still
require a deliberate root-owned installation on the VPS.
