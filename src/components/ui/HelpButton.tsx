import { useState } from "react";
import { Linking, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { saudavelSvg, estressadoSvg, fugiuSvg, semSinalSvg } from "../../assets/svgs";

export type HelpKind = "register" | "empty" | "newBuffalo" | "home" | "status";
const DOCS_URL = "https://bubatag.github.io/bubatag-docs/";

const P = ({ children }: { children: React.ReactNode }) => (
  <Text className="font-body text-white text-[13px] leading-5 mb-3">{children}</Text>
);
const Legend = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View className="flex-row items-center mb-3">
    <View className="w-10 items-center mr-3">{icon}</View>
    <Text className="font-body text-white text-[13px] flex-1">{text}</Text>
  </View>
);

const CONTENT: Record<HelpKind, { title: string; body: React.ReactNode }> = {
  register: {
    title: "Tela de cadastro",
    body: (
      <>
        <P>Para começar a usar o sistema, você precisará preencher algumas informações básicas:</P>
        <P>• E-mail: digite um e-mail válido que você utilize.{"\n"}• Senha: crie uma senha de sua preferência para proteger sua conta.{"\n"}• CCIR: informe o número do seu CCIR, documento que identifica seu imóvel rural.</P>
      </>
    ),
  },
  empty: {
    title: "Tela home",
    body: (
      <>
        <P>Como este é seu primeiro acesso ainda não há bubalinos cadastrados.</P>
        <P>Para adicionar um novo bubalino, basta clicar no botão com ícone de bubalino.</P>
      </>
    ),
  },
  newBuffalo: {
    title: "Tela de cadastro de Bubalinos",
    body: (
      <>
        <P>Nesta tela, você poderá cadastrar os bubalino basta preencher informações pedidas.</P>
        <P>A coleira precisa estar cadastrada previamente no sistema. Após preencher os dados, basta clicar em "Cadastrar".</P>
      </>
    ),
  },
  home: {
    title: "Tela home com bubalino cadastrado",
    body: (
      <>
        <P>Com o bubalino cadastrado ele aparecerá no mapa do pasto e na lista de bubalinos cadastrados, você pode usar a barra de pesquisa para encontrar um bubalino específico.</P>
        <P>O status do animal é indicado pelos seguintes ícones:</P>
        <Legend icon={<SvgXml xml={saudavelSvg} width={30} height={30} />} text="Animal saudável!" />
        <Legend icon={<SvgXml xml={estressadoSvg} width={30} height={30} />} text="Animal estressado" />
        <Legend icon={<SvgXml xml={fugiuSvg} width={30} height={30} />} text="Animal fora da área" />
        <Legend icon={<SvgXml xml={semSinalSvg} width={30} height={30} />} text="Perda de conexão" />
      </>
    ),
  },
  status: {
    title: "Tela status de Bubalinos",
    body: (
      <>
        <P>Na tela de status, será possível acompanhar batimentos cardíacos e temperaturas do animal, no gráfico de monitoramento do bubalino.</P>
        <P>Nesta tela, também é possível editar ou excluir o bubalino.</P>
        <Legend
          icon={<View className="w-8 h-8 rounded-md border-2 border-primary bg-[#1f2933] items-center justify-center"><Text className="text-primary text-base">✎</Text></View>}
          text="Botão para edição de dados do bubalino."
        />
        <Legend
          icon={<View className="w-8 h-8 rounded-md bg-[#FF3939] items-center justify-center"><Text className="text-[#1E2529] text-lg font-bold">✕</Text></View>}
          text="Botão para exclusão de bubalino."
        />
      </>
    ),
  },
};

export default function HelpButton({ kind, inline = false }: { kind: HelpKind; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const { title, body } = CONTENT[kind];
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        accessibilityLabel="Ajuda"
        className="w-12 h-12 rounded-lg border-2 border-primary bg-[#1f2933] items-center justify-center"
        style={inline ? undefined : { position: "absolute", right: 20, bottom: 28 }}
      >
        <Text className="font-title text-primary text-2xl">?</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/70 justify-center px-6" onPress={() => setOpen(false)}>
          <Pressable className="rounded-xl border-2 border-primary bg-[#2a373e] p-5" style={{ maxHeight: "85%" }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between items-start mb-3">
                <Text className="font-title text-white text-2xl flex-1 pr-3">{title}</Text>
                <TouchableOpacity onPress={() => setOpen(false)} className="w-7 h-7 rounded bg-[#E0222A] border border-white items-center justify-center" accessibilityLabel="Fechar">
                  <Text className="text-white font-bold">✕</Text>
                </TouchableOpacity>
              </View>
              {body}
              <P>Segue abaixo o link de acesso para nossa documentação do sistema.</P>
              <Text className="font-body text-primary text-[13px] underline" onPress={() => Linking.openURL(DOCS_URL)}>
                {DOCS_URL}
              </Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
