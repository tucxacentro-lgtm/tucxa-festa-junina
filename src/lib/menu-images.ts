import type { PublicSalesMenuItem } from "@/components/public-sales-menu";

export type MenuItemImage = {
  url: string;
  alt: string;
};

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const DEFAULT_FESTA_JUNINA_IMAGES: MenuItemImage[] = [
  {
    url: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=80",
    alt: "Mesa de festa com comidas variadas",
  },
];

const IMAGE_LIBRARY: Array<{ match: string[]; images: MenuItemImage[] }> = [
  {
    match: ["cachorro", "hot dog"],
    images: [
      { url: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=900&q=80", alt: "Cachorro-quente servido com molho" },
      { url: "https://images.unsplash.com/photo-1551044499-589cdc0683c1?auto=format&fit=crop&w=900&q=80", alt: "Lanche servido em mesa rústica" },
    ],
  },
  {
    match: ["batata"],
    images: [
      { url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", alt: "Porção de batata frita crocante" },
      { url: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=80", alt: "Batatas fritas em porção individual" },
    ],
  },
  {
    match: ["pastel"],
    images: [
      { url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80", alt: "Salgado dourado em prato" },
      { url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80", alt: "Porção salgada preparada para festa" },
    ],
  },
  {
    match: ["lanche", "pernil"],
    images: [
      { url: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80", alt: "Lanche servido com recheio farto" },
      { url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80", alt: "Sanduíche em pão artesanal" },
    ],
  },
  {
    match: ["milho"],
    images: [
      { url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80", alt: "Milho verde cozido" },
      { url: "https://images.unsplash.com/photo-1601593768797-73e4256c606c?auto=format&fit=crop&w=900&q=80", alt: "Espigas de milho para festa" },
    ],
  },
  {
    match: ["caldo", "feijao"],
    images: [
      { url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80", alt: "Caldo quente servido em tigela" },
      { url: "https://images.unsplash.com/photo-1604908177070-22d7d86c4cde?auto=format&fit=crop&w=900&q=80", alt: "Sopa ou caldo em tigela rústica" },
    ],
  },
  {
    match: ["espetinho", "kafta", "frango"],
    images: [
      { url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=80", alt: "Espetinhos grelhados" },
      { url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80", alt: "Carne grelhada para porção" },
      { url: "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?auto=format&fit=crop&w=900&q=80", alt: "Frango grelhado em porção" },
    ],
  },
  {
    match: ["bolo", "doce", "doces"],
    images: [
      { url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", alt: "Bolo recheado para sobremesa" },
      { url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80", alt: "Doces variados para festa" },
    ],
  },
  {
    match: ["maca", "amor"],
    images: [
      { url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=900&q=80", alt: "Maçãs vermelhas decorativas" },
      { url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80", alt: "Maçãs vermelhas frescas" },
    ],
  },
  {
    match: ["canjica"],
    images: [
      { url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80", alt: "Doce cremoso servido em tigela" },
    ],
  },
  {
    match: ["cerveja", "heineken", "imperio", "original"],
    images: [
      { url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=80", alt: "Copo de cerveja gelada" },
      { url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=900&q=80", alt: "Cerveja servida em ambiente de festa" },
    ],
  },
  {
    match: ["refrigerante", "suco", "agua"],
    images: [
      { url: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80", alt: "Bebida refrescante servida com gelo" },
      { url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80", alt: "Copos com bebidas geladas" },
    ],
  },
  {
    match: ["vinho quente", "quentao"],
    images: [
      { url: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=900&q=80", alt: "Bebida quente em caneca" },
      { url: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=900&q=80", alt: "Canecas com bebida quente" },
    ],
  },
];

export function getMenuItemImages(item: Pick<PublicSalesMenuItem, "name" | "category">): MenuItemImage[] {
  const searchable = normalize(`${item.name} ${item.category}`);
  const match = IMAGE_LIBRARY.find((entry) => entry.match.some((term) => searchable.includes(normalize(term))));

  return (match?.images ?? DEFAULT_FESTA_JUNINA_IMAGES).slice(0, 3);
}
