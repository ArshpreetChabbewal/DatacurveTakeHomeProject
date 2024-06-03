import Head from 'next/head';
import CodeEnvironment from '../components/CodeEnvironment';

const MainPage = () => {
  return (
    <div>
      <Head>
        <title>Datacurve Take Home Project</title>
        <meta name="description" content="A web app for running and submitting Python code" />
      </Head>
      <main>
        <CodeEnvironment />
      </main>
    </div>
  );
};

export default MainPage;