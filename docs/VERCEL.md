# Deploying The Great Transit to Vercel

## Quick Deploy

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `ericzona/Vessel-OS`
   - Vercel auto-detects Next.js settings

3. **Deploy Settings** (Auto-configured)
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Environment Variables** (Optional)
   None required for MVP. Future:
   - `SOLANA_RPC_URL` for blockchain integration
   - `PINATA_API_KEY` for IPFS asset hosting

## Auto-Deploy Setup

Enable automatic deployments for continuous integration:

1. **Production Branch**: `main`
   - Every push to `main` → auto-deploy to production

2. **Preview Deployments**: All other branches
   - Create feature branches for testing
   - Each PR gets a unique preview URL

## Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `transit.lootopian.com`)
3. Update DNS records as instructed

## Performance Optimization

```json
// next.config.mjs already configured for:
{
  "reactStrictMode": true,
  "swcMinify": true,  // Fast builds
  "poweredByHeader": false  // Security
}
```

## Monitoring

- **Analytics**: Vercel Analytics auto-enabled
- **Logs**: Real-time function logs in dashboard
- **Performance**: Web Vitals tracking

## Troubleshooting

**Build Fails?**
- Check `package.json` has all dependencies
- Verify TypeScript compiles: `npm run build` locally

**404 on Routes?**
- Next.js App Router requires `app/` directory structure ✅ (already configured)

**Slow Performance?**
- Enable Vercel Edge Network (automatic)
- Consider ISR for static generation

## Cost

- **Hobby Plan**: Free
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for MVP/testing

- **Pro Plan**: $20/month (when needed)
  - Commercial use
  - Team collaboration
  - Advanced analytics

## GitHub Branch Strategy

```bash
main        # Production (auto-deploys)
dev         # Staging (preview deploys)
feature/*   # Feature branches (preview deploys)
```

## Post-Deploy Checklist

- [ ] Visit production URL
- [ ] Test terminal commands (status, mine, move, look)
- [ ] Verify localStorage save system works
- [ ] Check mobile responsiveness
- [ ] Share with community for testing

---

**Estimated Deploy Time**: 2-3 minutes
**Next Steps**: After deployment, update README.md with live demo link
