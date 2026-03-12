import { google } from 'googleapis';

const submitSitemap = async () => {
    const clientEmail = process.env.GSC_CLIENT_EMAIL;
    const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const siteUrl = process.env.SITE_URL;
    const sitemapUrl = `${siteUrl}sitemap.xml`;

    if (!clientEmail || !privateKey) {
        console.log('Skipping Google Search Console submission: Secrets GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY not set.');
        return;
    }

    try {
        const auth = new google.auth.JWT(
            clientEmail,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/webmasters']
        );

        const searchconsole = google.searchconsole({ version: 'v1', auth });

        console.log(`Submitting sitemap: ${sitemapUrl} for site: ${siteUrl}`);
        
        await searchconsole.sitemaps.submit({
            feedpath: sitemapUrl,
            siteUrl: siteUrl
        });

        console.log('Sitemap successfully submitted to Google Search Console.');
    } catch (error) {
        console.error('Error submitting sitemap to Google Search Console:', error.message);
        // We don't exit with 1 because we don't want to break the whole CI if GSC is down
    }
};

submitSitemap();
