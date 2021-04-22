export default function Home(props) {
  return (
    <div>
      <h1>index</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </div>
  );
}

// Como não vai ser adicionado novos episodios de podcast a todo momento.
// Podemos utilizar do getStaticProps para renderizar os dados a api (server.json)
// Assim, que o usuario acessar a aplicação, não após os componentes serem
// renderizados, como no SPA.

export async function getStaticProps() {
  const response = await fetch("http://localhost:3333/episodes");
  const data = await response.json();

  return {
    props: {
      episodes: data,
    },
    revalidate: 60 * 60 * 8,
  };
}
