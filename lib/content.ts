import { dailyPhrases } from "./daily-phrases";

export const siteContent = {
  brand: {
    name: "Teka Neves",
    descriptor: "Psicoterapeuta",
  },
  navigation: [
    { label: "Acompanhamento", href: "#acompanhamento" },
    { label: "Para quem é", href: "#para-quem" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ],
  hero: {
    eyebrow: "Psicoterapia para diferentes momentos da vida",
    title: "Você não precisa atravessar tudo sozinho.",
    description:
      "Um espaço de escuta, cuidado e presença para compreender o que você vive e construir caminhos mais possíveis.",
    imageAlt: "Teka Neves, psicoterapeuta, em um retrato com fundo escuro.",
  },
  support: {
    eyebrow: "Acompanhamento",
    title: "Cuidar de si também pode ser uma forma de seguir em frente.",
    description:
      "A psicoterapia oferece tempo e espaço para olhar para a sua história com mais gentileza, clareza e curiosidade.",
  },
  audience: {
    eyebrow: "Para quem é",
    title: "Para quem sente que alguma coisa precisa ser olhada com mais calma.",
    description:
      "Não existe um jeito certo de chegar à terapia. Você pode começar por uma dor específica, por uma pergunta ou pelo desejo de se conhecer melhor.",
  },
  about: {
    eyebrow: "Sobre mim",
    title: "Escuta atenta, cuidado e respeito pelo seu tempo.",
    paragraphs: [
      "Meu trabalho parte da construção de um espaço seguro, onde sua experiência possa ser acolhida sem pressa e sem julgamentos.",
      "A terapia é um processo singular. Juntos, podemos compreender padrões, nomear sentimentos e encontrar novas possibilidades para a sua vida.",
    ],
    ctaLabel: "Vamos conversar",
    ctaHref: "#contato",
    imageAlt: "Retrato de Teka Neves usando uma camisa azul e óculos claros.",
  },
  contact: {
    eyebrow: "Contato",
    title: "Podemos começar por uma conversa.",
    description:
      "Conte um pouco sobre o que trouxe você até aqui. Este formulário é uma prévia local e ainda não envia mensagens.",
    nameLabel: "Seu nome",
    emailLabel: "Seu melhor email",
    messageLabel: "Como posso ajudar?",
    submitLabel: "Enviar mensagem",
  },
  footer: "Website em desenvolvimento local. Informações de atendimento serão adicionadas em breve.",
  dailyPhrases,
} as const;
