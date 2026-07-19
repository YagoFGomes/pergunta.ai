import { LegalDocument, LegalSection } from '@/features/legal/components/legal-document';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Serviço | Pergunta.ai',
  description: 'Conheça as condições para uso da plataforma Pergunta.ai de pesquisas de satisfação.'
};

const sections = [
  { id: 'aceitacao', label: 'Aceitação e escopo' },
  { id: 'plataforma', label: 'A Plataforma' },
  { id: 'contas', label: 'Contas e acesso' },
  { id: 'responsabilidades', label: 'Responsabilidades do cliente' },
  { id: 'uso-aceitavel', label: 'Uso aceitável' },
  { id: 'dados', label: 'Dados e privacidade' },
  { id: 'propriedade', label: 'Propriedade intelectual' },
  { id: 'disponibilidade', label: 'Disponibilidade e mudanças' },
  { id: 'suspensao', label: 'Suspensão e encerramento' },
  { id: 'responsabilidade', label: 'Responsabilidade' },
  { id: 'disposicoes', label: 'Disposições gerais' }
];

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      eyebrow='Documento legal'
      title='Termos de Serviço'
      description='Estes Termos regulam o acesso e o uso da Pergunta.ai por empresas clientes, seus usuários autorizados e visitantes das páginas públicas de pesquisa.'
      updatedAt='19 de julho de 2026'
      sections={sections}
    >
      <LegalSection id='aceitacao' title='1. Aceitação e escopo'>
        <p>
          Ao criar uma conta, contratar um plano, acessar o painel ou utilizar qualquer recurso da
          <strong> Pergunta.ai</strong> (“Plataforma”), você declara ter lido e aceitado estes
          Termos de Serviço e a nossa <Link href='/privacy-policy'>Política de Privacidade</Link>.
        </p>
        <p>
          Se você utiliza a Plataforma em nome de uma empresa ou outra organização (“Cliente”),
          declara possuir poderes para vinculá-la a estes Termos. Nesse caso, “você” inclui o
          Cliente e seus usuários autorizados. Condições comerciais específicas previstas em
          proposta, pedido ou contrato celebrado com o Cliente prevalecem em caso de conflito com
          estes Termos.
        </p>
        <p>
          Respondentes não precisam criar conta para preencher uma pesquisa. Para eles, aplicam-se
          as regras sobre uso aceitável, propriedade intelectual, privacidade, segurança e
          responsabilidade que sejam compatíveis com esse acesso.
        </p>
      </LegalSection>

      <LegalSection id='plataforma' title='2. O que a Pergunta.ai oferece'>
        <p>
          A Pergunta.ai é uma plataforma B2B para criação, envio, coleta, armazenamento e análise de
          pesquisas de satisfação. Entre os recursos disponíveis ou planejados estão:
        </p>
        <ul>
          <li>formulários e perguntas personalizadas;</li>
          <li>metodologias e métricas como NPS, CSAT, CES e CSI;</li>
          <li>listas de contatos, modelos de e-mail e campanhas;</li>
          <li>links públicos para coleta de respostas sem login;</li>
          <li>painéis, relatórios, logs de entrega e controles de acesso por organização.</li>
        </ul>
        <p>
          Recursos podem variar conforme o plano, a etapa de disponibilização e as configurações do
          Cliente. A Pergunta.ai fornece a infraestrutura e as ferramentas; não define o público, o
          conteúdo, a finalidade ou a base legal das pesquisas criadas pelo Cliente.
        </p>
      </LegalSection>

      <LegalSection id='contas' title='3. Cadastro, contas e segurança de acesso'>
        <ul>
          <li>
            As informações de cadastro devem ser verdadeiras, atuais e completas. A conta é pessoal
            e não deve ser compartilhada entre usuários.
          </li>
          <li>
            O Cliente é responsável por conceder apenas os acessos necessários, revisar permissões e
            remover prontamente usuários que não devam mais acessar sua organização.
          </li>
          <li>
            Cada usuário deve proteger sua senha e seus dispositivos. Atividades realizadas com
            credenciais válidas serão atribuídas à respectiva conta, salvo comprovação de falha da
            Plataforma.
          </li>
          <li>
            Suspeitas de acesso indevido ou comprometimento devem ser comunicadas imediatamente pelo
            canal <a href='mailto:suporte@pergunta.ai'>suporte@pergunta.ai</a>.
          </li>
        </ul>
        <p>
          A Pergunta.ai poderá exigir verificação adicional, redefinição de credenciais ou outras
          medidas razoáveis para proteger a conta e os dados do Cliente.
        </p>
      </LegalSection>

      <LegalSection id='responsabilidades' title='4. Responsabilidades do Cliente'>
        <p>O Cliente é responsável por:</p>
        <ul>
          <li>
            determinar objetivos, conteúdo, público, base legal e prazo de retenção de suas
            pesquisas, contatos e respostas;
          </li>
          <li>
            fornecer aos Respondentes avisos claros sobre sua identidade, finalidade da coleta,
            eventual obrigatoriedade das respostas e canal para exercício de direitos;
          </li>
          <li>
            obter consentimento quando essa for a base legal aplicável e respeitar descadastros,
            oposições e preferências de comunicação;
          </li>
          <li>
            inserir na Plataforma apenas dados que possa tratar legalmente e manter contatos e
            campos personalizados corretos e pertinentes;
          </li>
          <li>
            evitar a coleta excessiva e adotar salvaguardas adicionais antes de tratar dados
            pessoais sensíveis ou dados de crianças e adolescentes;
          </li>
          <li>
            analisar os resultados no contexto adequado. Métricas e relatórios são instrumentos de
            apoio e não substituem avaliação profissional nem devem, isoladamente, fundamentar
            decisões que afetem direitos de pessoas;
          </li>
          <li>
            cumprir a LGPD, regras de defesa do consumidor, normas sobre comunicações eletrônicas e
            demais leis aplicáveis à sua operação.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id='uso-aceitavel' title='5. Uso aceitável'>
        <p>É proibido utilizar a Plataforma para:</p>
        <ul>
          <li>praticar atos ilegais, fraudulentos, discriminatórios, abusivos ou enganosos;</li>
          <li>
            enviar spam, mensagens a pessoas sem base legal ou comunicações que ocultem a identidade
            do remetente e o mecanismo de descadastro;
          </li>
          <li>
            coletar dados de forma secreta, desproporcional ou incompatível com o aviso apresentado
            ao Respondente;
          </li>
          <li>
            transmitir malware, explorar vulnerabilidades, contornar limites, testar a segurança sem
            autorização ou interferir na disponibilidade do serviço;
          </li>
          <li>
            acessar dados de outra organização, compartilhar tokens públicos de modo indevido,
            realizar engenharia reversa ilícita ou copiar partes protegidas da Plataforma;
          </li>
          <li>
            usar respostas ou métricas para assédio, perseguição ou decisões exclusivamente
            automatizadas com efeitos relevantes sem as garantias legais cabíveis.
          </li>
        </ul>
        <p>
          Podemos aplicar limites técnicos razoáveis de volume, frequência de requisições, contatos,
          armazenamento e envio de e-mails para preservar a segurança e a estabilidade do serviço.
        </p>
      </LegalSection>

      <LegalSection id='dados' title='6. Dados do Cliente, respostas e privacidade'>
        <p>
          O Cliente mantém os direitos que possui sobre formulários, contatos, respostas e demais
          conteúdos inseridos na Plataforma (“Dados do Cliente”). O Cliente autoriza a Pergunta.ai a
          tratar esses dados somente na medida necessária para prestar, proteger e manter o serviço,
          cumprir instruções documentadas e atender obrigações legais.
        </p>
        <p>
          Em regra, o Cliente atua como <strong>controlador</strong> dos dados de seus contatos e
          Respondentes, e a Pergunta.ai atua como <strong>operadora</strong>. Para dados de
          cadastro, segurança, suporte e relacionamento contratual definidos por nós, a Pergunta.ai
          poderá atuar como controladora. Detalhes constam na{' '}
          <Link href='/privacy-policy'>Política de Privacidade</Link> e, quando celebrado, no acordo
          de tratamento de dados aplicável ao Cliente.
        </p>
        <p>
          <strong>Não vendemos dados pessoais nem respostas.</strong> O acesso aos dados fica
          limitado ao próprio Cliente, aos usuários autorizados, à equipe da Pergunta.ai que
          necessite do acesso e aos operadores técnicos indispensáveis, sempre sujeitos a
          finalidade, segurança e confidencialidade. Poderemos utilizar estatísticas efetivamente
          agregadas ou anonimizadas, que não identifiquem pessoas ou Clientes, para operar e
          aprimorar o serviço.
        </p>
      </LegalSection>

      <LegalSection id='propriedade' title='7. Propriedade intelectual e feedback'>
        <p>
          A Plataforma, sua marca, interfaces, software, documentação e elementos próprios são
          protegidos pelas leis de propriedade intelectual e pertencem à Pergunta.ai ou a seus
          licenciantes. Estes Termos concedem ao Cliente uma licença limitada, não exclusiva,
          intransferível e revogável para usar a Plataforma durante a vigência da contratação.
        </p>
        <p>
          Componentes de terceiros e de código aberto permanecem sujeitos às respectivas licenças. O
          Cliente não adquire titularidade sobre a Plataforma e não pode revendê-la, sublicenciá-la,
          copiar seu código ou remover avisos de propriedade, salvo autorização expressa ou hipótese
          legal irrenunciável.
        </p>
        <p>
          Sugestões e feedback podem ser usados para melhorar a Plataforma sem obrigação de
          remuneração, desde que isso não autorize a divulgação de informações confidenciais ou
          Dados do Cliente.
        </p>
      </LegalSection>

      <LegalSection id='disponibilidade' title='8. Disponibilidade, suporte e alterações'>
        <p>
          Empregamos esforços razoáveis para manter a Plataforma segura e disponível, mas não
          garantimos operação ininterrupta ou livre de falhas. Manutenções, atualizações, incidentes
          de internet, fornecedores de infraestrutura e eventos fora de controle razoável podem
          causar indisponibilidade temporária.
        </p>
        <p>
          Podemos corrigir, atualizar, incluir, limitar ou descontinuar recursos para melhorar
          segurança, desempenho, conformidade ou adequação do produto. Quando uma mudança material
          afetar de forma relevante uma contratação ativa, buscaremos avisar com antecedência
          razoável, salvo urgência de segurança, exigência legal ou impossibilidade técnica.
        </p>
      </LegalSection>

      <LegalSection id='suspensao' title='9. Suspensão e encerramento'>
        <p>
          O acesso poderá ser suspenso ou limitado em caso de violação destes Termos, risco à
          segurança, atividade ilegal, uso abusivo, falta de pagamento prevista em contratação ou
          necessidade de cumprir ordem de autoridade. Sempre que razoável, notificaremos o Cliente e
          daremos oportunidade de correção antes da suspensão.
        </p>
        <p>
          O Cliente pode encerrar sua conta conforme o plano ou contrato aplicável. No término,
          cessará o direito de uso e os Dados do Cliente serão tratados segundo as instruções
          contratuais, a <Link href='/privacy-policy'>Política de Privacidade</Link>, os ciclos de
          backup e as obrigações legais de conservação. É responsabilidade do Cliente exportar os
          dados que deseje manter antes do fim do prazo disponibilizado para isso.
        </p>
      </LegalSection>

      <LegalSection id='responsabilidade' title='10. Garantias e responsabilidade'>
        <p>
          A Pergunta.ai responde pela prestação do serviço nos limites da lei e das condições
          contratadas. Não somos responsáveis pelo conteúdo das pesquisas, pela origem das listas,
          pelas instruções do Cliente, pela interpretação de resultados ou por decisões tomadas com
          base neles.
        </p>
        <p>
          Na máxima extensão permitida pela legislação, nenhuma parte responderá por danos
          indiretos, lucros cessantes, perda de oportunidade ou prejuízos decorrentes de eventos
          fora de seu controle razoável. Eventuais limites de responsabilidade previstos em proposta
          ou contrato aplicam-se sem afastar responsabilidades que, por lei, não possam ser
          excluídas ou limitadas, incluindo direitos de titulares e normas de proteção do consumidor
          quando aplicáveis.
        </p>
      </LegalSection>

      <LegalSection id='disposicoes' title='11. Alterações e disposições gerais'>
        <p>
          Podemos atualizar estes Termos para refletir mudanças legais, técnicas ou comerciais. A
          versão vigente e sua data permanecerão nesta página. Mudanças materiais poderão ser
          comunicadas no painel ou por e-mail e produzirão efeitos a partir da data informada,
          respeitados contratos em vigor e direitos legais.
        </p>
        <p>
          A tolerância a uma violação não significa renúncia de direito. Se uma disposição for
          considerada inválida, as demais continuarão em vigor. O Cliente não pode ceder sua
          contratação sem autorização prévia, salvo reorganização societária que não reduza as
          garantias assumidas.
        </p>
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro
          definido no contrato com o Cliente ou, na ausência de definição, o foro legalmente
          competente, preservado o direito do consumidor de recorrer ao foro de seu domicílio quando
          aplicável.
        </p>
        <p>
          Dúvidas sobre o serviço podem ser enviadas para{' '}
          <a href='mailto:suporte@pergunta.ai'>suporte@pergunta.ai</a>. Questões sobre dados
          pessoais devem ser encaminhadas a{' '}
          <a href='mailto:privacidade@pergunta.ai'>privacidade@pergunta.ai</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
