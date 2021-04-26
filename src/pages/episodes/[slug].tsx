import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";

import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "../../contexts/PlayerContext";

import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./episode.module.scss";
// Criando uma pasta dentro da pasta PAGES, essa pasta vira uma rota automaticamente
// Criando dentro dessa pasta um arquivo com nome entre colchetes, teremos a possibildiade
// de criar rotas após a pasta ex: /episode/nome_do_arquivo
type Episodes = {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
};

type EpisodeProps = {
  episode: Episodes;
};

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr </title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}
// Toda rota que possui os colchetes em volta, é necessário informar o parametro
// getStaticPaths
export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  return {
    // Passando os paths vazios [], no momento da build, o next não vai gerar nenhum
    // episódio de forma statica. O que determina o comportamento de uma página que não
    // foi gerado estaticamente, é o fallback.

    // Se passar fallback: false, se não foi gerado uma página estática no momento da build
    // utilizando, nesse caso, paths: [ {params: { slug: 'NOME DO EPISÓDIO'}}], será retornado
    // error 404.

    // Se passar fallback: true. Ao acessar uma página que não foi gerada estáticasmente
    // no momento da build, a aplicação irá fazer toda a requisição feita no GetStaticProps
    // Porém essa, será feita pelo lado do client.

    // O fallback : blocking, permite o modo increment static regeneration. Isso faz com que,
    // o next gere as páginas estáticas a medida que essas são acessadas, e também que o next
    // revalide essas páginas, pelo tempo passado no revalidate
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;
  // Mesmo nome do arquivo [slug]
  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };
  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, //24hr
  };
};
