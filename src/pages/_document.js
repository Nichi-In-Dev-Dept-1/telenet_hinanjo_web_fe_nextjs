import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

    render() {
        return (
            <Html lang={"en"}>
                <Head>
                    <title>Telenet</title>
                    <meta charSet="UTF-8" />
                    <meta name="description" content="The ultimate collection of design-agnostic, flexible and accessible React UI Components." />
                    <meta name="robots" content="index, follow" />
                    <meta name="viewport" content="initial-scale=1, width=device-width" />
                    <link rel="icon" href="data:," />
                    {/* <meta property="og:type" content="website"></meta>
                    <meta property="og:title" content="Sakai by PrimeReact | Free Admin Template for NextJS"></meta>
                    <meta property="og:url" content="https://www.primefaces.org/sakai-react"></meta>
                    <meta property="og:description" content="The ultimate collection of design-agnostic, flexible and accessible React UI Components." />
                    <meta property="og:image" content="https://www.primefaces.org/static/social/sakai-nextjs.png"></meta>
                    <meta property="og:ttl" content="604800"></meta> */}
                    <link rel="icon" href={`/layout/images/favicon.ico`} type="image/x-icon"></link>
                    <link id="theme-css" href={`/themes/default/theme.css`} rel="stylesheet"></link>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
