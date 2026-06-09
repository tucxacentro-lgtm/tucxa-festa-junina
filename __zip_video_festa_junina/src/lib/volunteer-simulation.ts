export function suggestVolunteers(people: number) {
  return [
    { role: "Coordenação geral", quantity: 1, notes: "Ponto focal para decisões e ocorrências." },
    { role: "Check-in/entrada", quantity: Math.max(1, Math.ceil(people / 80)), notes: "Leitura de QR Code/código e orientação inicial." },
    { role: "Atendimento/garçons", quantity: Math.max(2, Math.ceil(people / 30)), notes: "Apoio às mesas, pedidos e dúvidas." },
    { role: "Cozinha/preparo", quantity: Math.max(2, Math.ceil(people / 35)), notes: "Ajustar depois que o cardápio for validado." },
    { role: "Entrega/retirada", quantity: Math.max(1, Math.ceil(people / 45)), notes: "Separação e entrega dos pedidos." },
    { role: "Caixa/pagamentos", quantity: Math.max(1, Math.ceil(people / 80)), notes: "Pix, cartão, dinheiro e conferência de comprovantes." },
    { role: "Compras/estoque", quantity: Math.max(1, Math.ceil(people / 100)), notes: "Controle de insumos, bebidas, gelo e descartáveis." },
  ];
}
