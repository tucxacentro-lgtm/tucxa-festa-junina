"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getMenuItemImages } from "@/lib/menu-images";
import type { PublicSalesMenuItem } from "@/components/public-sales-menu";

type Props = {
  items: PublicSalesMenuItem[];
};

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function priceOf(item: PublicSalesMenuItem) {
  return formatCurrency(Number(item.price) || 0);
}

function categoryMessage(category: string) {
  const key = normalize(category);

  if (key.includes("bebida")) {
    return {
      title: "Bebidas para refrescar e acompanhar a festa",
      subtitle:
        "Do refrigerante à cerveja, opções para manter o clima leve enquanto você aproveita o arraiá.",
      why: "Ajuda a evitar filas e facilita a retirada: escolha antes, peça com o garçom e siga para aproveitar a festa.",
    };
  }

  if (key.includes("doce")) {
    return {
      title: "Doces com gostinho de Festa Junina",
      subtitle:
        "Maçã do amor, canjica, bolo e doces diversos para fechar o pedido com carinho de festa de comunidade.",
      why: "Ideal para agradar crianças, família e amigos sem perder tempo decidindo na hora da retirada.",
    };
  }

  if (key.includes("bingo")) {
    return {
      title: "Bingo para entrar no clima",
      subtitle:
        "Cartelas e itens ligados ao bingo para deixar a festa ainda mais participativa.",
      why: "Além de se divertir, você ajuda o Tucxa a organizar melhor a arrecadação e a operação do evento.",
    };
  }

  return {
    title: "Comidas de arraiá para matar a fome com alegria",
    subtitle:
      "Cachorro-quente, pastel, espetinho, milho, caldo e outras opções para comer bem durante a festa.",
    why: "Você escolhe com tranquilidade, o garçom registra o pedido e a ficha em papel orienta a retirada.",
  };
}

function categoryAnchor(category: string) {
  return `categoria-${normalize(category).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "outros"}`;
}

export function PublicMenuBrowser({ items }: Props) {
  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category || "Outros"))),
    [items],
  );
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const visibleItems = useMemo(() => {
    const query = normalize(search.trim());
    return items.filter((item) => {
      const category = item.category || "Outros";
      const matchesCategory = activeCategory === "Todos" || category === activeCategory;
      const searchable = normalize(`${item.name} ${item.description ?? ""} ${category}`);
      const matchesSearch = !query || searchable.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, items, search]);

  const visibleGroups = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          items: visibleItems.filter((item) => (item.category || "Outros") === category),
          message: categoryMessage(category),
        }))
        .filter((group) => group.items.length > 0),
    [categories, visibleItems],
  );

  function chooseCategory(category: string) {
    setActiveCategory(category);
    const target = document.getElementById("itens");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="itens" className="mt-8 scroll-mt-4">
      <div className="sticky top-2 z-20 rounded-[1.5rem] border border-amber-100 bg-white/95 p-3 shadow-lg backdrop-blur md:top-4 md:p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
          <Search className="h-4 w-4 shrink-0 text-stone-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400"
            placeholder="Buscar cachorro-quente, batata, cerveja..."
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {["Todos", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => chooseCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${
                activeCategory === category
                  ? "bg-green-900 text-white shadow-sm"
                  : "bg-amber-50 text-green-950 hover:bg-amber-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="mt-5 rounded-[2rem] bg-white p-6 text-sm font-bold text-stone-600 shadow-sm">
          Nenhum item encontrado. Tente buscar por outro nome ou selecione outra categoria.
        </div>
      ) : (
        <div className="mt-5 grid gap-6">
          {visibleGroups.map(({ category, items: categoryItems, message }) => (
            <article
              key={category}
              id={categoryAnchor(category)}
              className="scroll-mt-32 overflow-hidden rounded-[2rem] bg-white shadow-sm"
            >
              <div className="border-b border-amber-100 bg-amber-50 p-5 md:p-6">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-900">
                  {category}
                </span>
                <h2 className="mt-3 text-2xl font-black text-green-950">
                  {message.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-700">
                  {message.subtitle}
                </p>
                <p className="mt-2 max-w-3xl text-xs font-bold leading-relaxed text-green-900 md:text-sm">
                  {message.why}
                </p>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2 md:p-6">
                {categoryItems.map((item) => {
                  const images = getMenuItemImages(item);
                  const [mainImage, ...extraImages] = images;

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"
                    >
                      {mainImage ? (
                        <div className="relative min-h-44 bg-amber-100 md:min-h-52">
                          <div
                            aria-label={mainImage.alt}
                            role="img"
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${mainImage.url})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-black text-green-950 shadow-sm">
                            Foto ilustrativa
                          </span>
                          {extraImages.length > 0 ? (
                            <span className="absolute bottom-3 right-3 rounded-full bg-green-950/90 px-3 py-1 text-[0.65rem] font-black text-white shadow-sm md:hidden">
                              +{extraImages.length} foto{extraImages.length > 1 ? "s" : ""}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black text-green-950">
                              {item.name}
                            </h3>
                            {item.description ? (
                              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                          <p className="shrink-0 rounded-full bg-green-900 px-3 py-2 text-sm font-black text-white">
                            {priceOf(item)}
                          </p>
                        </div>

                        {extraImages.length > 0 ? (
                          <div className="mt-4 hidden grid-cols-2 gap-2 md:grid">
                            {extraImages.map((image) => (
                              <div
                                key={image.url}
                                aria-label={image.alt}
                                role="img"
                                className="h-20 rounded-2xl bg-amber-100 bg-cover bg-center"
                                style={{ backgroundImage: `url(${image.url})` }}
                              />
                            ))}
                          </div>
                        ) : null}

                        <p className="mt-3 text-xs font-bold text-stone-500">
                          {item.requires_preparation ? "Preparado no evento" : "Pronto para retirada"} · {item.unit_label || "un"}
                        </p>
                        <p className="mt-1 text-[0.68rem] font-bold text-stone-400">
                          Fotos meramente ilustrativas.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="sticky bottom-3 z-20 mt-8 rounded-[1.5rem] border border-green-100 bg-white/95 p-3 shadow-xl backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="flex w-full items-center justify-center rounded-2xl bg-green-900 px-6 py-4 text-center font-black text-white">
          Chame um garçom para fazer seu pedido
        </div>
      </div>
    </section>
  );
}
