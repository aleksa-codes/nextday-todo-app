import NextTopLoader from 'nextjs-toploader';

const TopLoader = () => {
  return (
    <NextTopLoader
      color='hsl(var(--primary))'
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing='ease'
      speed={200}
      shadow='0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))'
      zIndex={1600}
      showAtBottom={false}
    />
  );
};

export default TopLoader;
