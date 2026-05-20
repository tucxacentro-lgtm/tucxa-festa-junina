import type { PublicSalesMenuItem } from "@/components/public-sales-menu";

export type MenuItemImage = {
  url: string;
  alt: string;
};

const IMAGE_BASE_PATH = "/cardapio/arraia-tucxa-2026";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function image(fileName: string, alt: string): MenuItemImage {
  return {
    url: `${IMAGE_BASE_PATH}/${fileName}`,
    alt,
  };
}

const DEFAULT_FESTA_JUNINA_IMAGES: MenuItemImage[] = [
  image("doces-diversos.jpg", "Mesa de festa junina com itens do cardápio"),
];

const IMAGE_LIBRARY: Array<{ match: string[]; images: MenuItemImage[] }> = [
  {
    match: ["cachorro", "hot dog"],
    images: [image("cachorro-quente-pequeno.jpg", "Cachorro-quente pequeno")],
  },
  {
    match: ["batata"],
    images: [image("batata-frita.jpg", "Batata frita")],
  },
  {
    match: ["pastel", "pasteis"],
    images: [image("pasteis.jpg", "Pastéis variados")],
  },
  {
    match: ["lanche", "pernil"],
    images: [image("lanche-pernil.jpg", "Lanche de pernil")],
  },
  {
    match: ["milho"],
    images: [image("milho-verde.jpg", "Milho verde")],
  },
  {
    match: ["caldo", "feijao"],
    images: [image("caldo-feijao.jpg", "Caldo de feijão")],
  },
  {
    match: ["espetinho", "carne"],
    images: [image("espetinho-carne.jpg", "Espetinho de carne")],
  },
  {
    match: ["kafta"],
    images: [image("espetinho-kafta.jpg", "Espetinho de kafta")],
  },
  {
    match: ["frango"],
    images: [image("espetinho-frango.jpg", "Espetinho de frango")],
  },
  {
    match: ["bolo", "recheado"],
    images: [image("bolo-recheado.jpg", "Bolo recheado")],
  },
  {
    match: ["maca", "amor"],
    images: [image("maca-do-amor.jpg", "Maçã do amor")],
  },
  {
    match: ["canjica"],
    images: [image("canjica.jpg", "Canjica")],
  },
  {
    match: ["doce", "doces"],
    images: [image("doces-diversos.jpg", "Doces diversos")],
  },
  {
    match: ["heineken"],
    images: [image("cerveja-heineken.jpg", "Cerveja Heineken")],
  },
  {
    match: ["imperio", "original"],
    images: [image("cerveja-imperio-original.jpg", "Cerveja Império ou Original")],
  },
  {
    match: ["cerveja"],
    images: [
      image("cerveja-heineken.jpg", "Cerveja Heineken"),
      image("cerveja-imperio-original.jpg", "Cerveja Império ou Original"),
    ],
  },
  {
    match: ["refrigerante"],
    images: [image("refrigerante.jpg", "Refrigerante")],
  },
  {
    match: ["agua"],
    images: [image("agua.jpg", "Água")],
  },
  {
    match: ["suco"],
    images: [image("suco.jpg", "Suco")],
  },
  {
    match: ["vinho quente"],
    images: [image("vinho-quente.jpg", "Vinho quente")],
  },
  {
    match: ["quentao"],
    images: [image("quentao.jpg", "Quentão")],
  },
];

export function getMenuItemImages(
  item: Pick<PublicSalesMenuItem, "name" | "category">,
): MenuItemImage[] {
  const searchable = normalize(`${item.name} ${item.category}`);
  const match = IMAGE_LIBRARY.find((entry) =>
    entry.match.some((term) => searchable.includes(normalize(term))),
  );

  return (match?.images ?? DEFAULT_FESTA_JUNINA_IMAGES).slice(0, 3);
}
