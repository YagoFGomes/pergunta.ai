import { LegalDocument, LegalSection } from '@/features/legal/components/legal-document';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Pergunta.ai',
  description:
    'Saiba como a Pergunta.ai trata dados pessoais de clientes, usuários e respondentes de pesquisas.'
};

const sections = [
  { id: 'escopo', label: 'Escopo e papéis' },
  { id: 'dados', label: 'Dados tratados' },
  { id: 'finalidades', label: 'Finalidades e bases legais' },
  { id: 'compartilhamento', label: 'Compartilhamento' },
  { id: 'armazenamento', label: 'Armazenamento e retenção' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'direitos', label: 'Direitos dos titulares' },
  { id: 'cookies', label: 'Cookies e tecnologias' },
  { id: 'menores', label: 'Crianças e adolescentes' },
  { id: 'alteracoes', label: 'Alterações e contato' }
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      eyebrow='Documento legal'
      title='Política de Privacidade'
      description='Esta política explica, de forma transparente, como a Pergunta.ai coleta, utiliza, armazena e protege dados pessoais na plataforma de pesquisas de satisfação.'
      updatedAt='19 de julho de 2026'
      sections={sections}
    >
      <LegalSection id='escopo' title='1. Escopo e papéis no tratamento'>
        <p>
          Esta Política de Privacidade se aplica ao site, ao painel administrativo, às páginas
          públicas de pesquisa e aos demais serviços da <strong>Pergunta.ai</strong> (em conjunto, a
          “Plataforma”). Ela abrange dados de usuários das empresas clientes, contatos cadastrados
          para campanhas e pessoas que respondem às pesquisas (“Respondentes”).
        </p>
        <p>Na maior parte das operações com dados de pesquisas, os papéis são:</p>
        <ul>
          <li>
            <strong>Empresa cliente como controladora:</strong> define quais pessoas serão
            convidadas, quais perguntas serão feitas, as finalidades da pesquisa, a base legal e
            quem poderá consultar os resultados.
          </li>
          <li>
            <strong>Pergunta.ai como operadora:</strong> trata contatos, convites, respostas e
            resultados em nome e conforme as instruções da empresa cliente, para disponibilizar a
            Plataforma.
          </li>
          <li>
            <strong>Pergunta.ai como controladora:</strong> decide sobre o tratamento necessário
            para cadastro de contas, autenticação, segurança, prevenção a fraudes, suporte,
            faturamento, cumprimento legal e melhoria da própria Plataforma.
          </li>
        </ul>
        <p>
          A definição do papel aplicável depende da atividade concreta. Se você recebeu uma pesquisa
          de uma empresa cliente, consulte também o aviso de privacidade dessa empresa.
        </p>
      </LegalSection>

      <LegalSection id='dados' title='2. Dados pessoais que tratamos'>
        <p>Podemos tratar as seguintes categorias, conforme o uso da Plataforma:</p>
        <ul>
          <li>
            <strong>Conta e organização:</strong> nome, sobrenome, e-mail profissional, senha
            protegida por hash, função, vínculo e permissões na empresa cliente.
          </li>
          <li>
            <strong>Contatos e campanhas:</strong> nome, e-mail, telefone, campos personalizados,
            registro de consentimento ou descadastro, listas, campanhas e status de entrega.
          </li>
          <li>
            <strong>Pesquisas e respostas:</strong> respostas textuais, notas, escolhas, nome e
            e-mail do Respondente quando a empresa cliente optar por identificá-lo, além de data e
            status da resposta.
          </li>
          <li>
            <strong>Dados técnicos e de segurança:</strong> endereço IP, navegador e dispositivo
            (user agent), datas e horários, registros de autenticação, ações realizadas, falhas e
            logs de auditoria.
          </li>
          <li>
            <strong>Suporte:</strong> conteúdo de solicitações, comunicações e informações enviadas
            voluntariamente para atendimento.
          </li>
        </ul>
        <p>
          A Pergunta.ai não solicita dados pessoais sensíveis como requisito padrão. A empresa
          cliente deve evitar perguntas que coletem origem racial ou étnica, convicção religiosa,
          opinião política, filiação sindical, dados de saúde, vida sexual, dados genéticos ou
          biométricos, salvo quando houver necessidade legítima, base legal adequada e salvaguardas
          compatíveis. O conteúdo das perguntas e respostas é definido pela empresa cliente.
        </p>
      </LegalSection>

      <LegalSection id='finalidades' title='3. Para que usamos os dados e bases legais'>
        <p>Tratamos dados pessoais para:</p>
        <ul>
          <li>criar contas, autenticar usuários e administrar organizações e permissões;</li>
          <li>criar formulários e campanhas, enviar convites e lembretes e registrar entregas;</li>
          <li>
            receber, armazenar e organizar respostas e gerar métricas como NPS, CSAT, CES e CSI;
          </li>
          <li>prestar suporte, manter a operação e comunicar mudanças relevantes no serviço;</li>
          <li>
            prevenir abuso, fraude e incidentes, manter logs e proteger clientes e Respondentes;
          </li>
          <li>cumprir obrigações legais, regulatórias e ordens de autoridades competentes;</li>
          <li>
            melhorar desempenho e usabilidade por meio de informações técnicas e estatísticas
            agregadas, sem utilizar respostas identificáveis para publicidade.
          </li>
        </ul>
        <p>
          Conforme o contexto, o tratamento pode se apoiar na execução de contrato ou de
          procedimentos preliminares, cumprimento de obrigação legal ou regulatória, exercício
          regular de direitos, legítimo interesse e consentimento. Quando atuamos como operadora, a
          empresa cliente é responsável por definir e documentar a base legal apropriada para sua
          pesquisa e seus contatos.
        </p>
      </LegalSection>

      <LegalSection id='compartilhamento' title='4. Com quem os dados podem ser compartilhados'>
        <p>
          <strong>Não vendemos, alugamos ou comercializamos dados pessoais.</strong> Também não
          compartilhamos respostas identificáveis com anunciantes ou para publicidade de terceiros.
        </p>
        <p>O acesso ou compartilhamento pode ocorrer apenas nas situações necessárias abaixo:</p>
        <ul>
          <li>
            <strong>Empresa cliente:</strong> usuários autorizados da organização que criou ou
            enviou a pesquisa podem consultar contatos, respostas, relatórios e métricas, conforme
            suas permissões.
          </li>
          <li>
            <strong>Equipe autorizada da Pergunta.ai:</strong> somente quando necessário para
            operação, segurança ou suporte, sujeita a deveres de confidencialidade e controle de
            acesso.
          </li>
          <li>
            <strong>Operadores técnicos:</strong> fornecedores de hospedagem, banco de dados, cache,
            entrega de e-mails e monitoramento podem processar o mínimo necessário para executar
            essas funções. Eles não recebem autorização para usar os dados para finalidades próprias
            de publicidade ou venda.
          </li>
          <li>
            <strong>Autoridades e proteção de direitos:</strong> quando exigido por lei, decisão ou
            ordem válida, ou quando necessário para exercer direitos, prevenir fraude e proteger a
            segurança da Plataforma.
          </li>
        </ul>
        <p>
          Alguns operadores técnicos podem processar dados em outros países. Quando houver
          transferência internacional, adotaremos mecanismos e salvaguardas compatíveis com a LGPD e
          limitaremos o tratamento às finalidades desta política.
        </p>
      </LegalSection>

      <LegalSection id='armazenamento' title='5. Armazenamento e retenção'>
        <p>
          Mantemos os dados pelo tempo necessário para prestar o serviço, atender às instruções e ao
          contrato com a empresa cliente, cumprir obrigações legais, prevenir abusos e exercer ou
          defender direitos. Os prazos variam conforme a categoria e o contexto:
        </p>
        <ul>
          <li>dados de conta permanecem enquanto a conta ou o contrato estiver ativo;</li>
          <li>
            contatos, campanhas, respostas e métricas seguem a configuração e as instruções da
            empresa cliente, além dos prazos necessários para continuidade e integridade do serviço;
          </li>
          <li>
            registros de segurança, auditoria, entrega e transações podem ser mantidos por prazo
            adicional para cumprimento legal, prevenção de fraude e exercício de direitos;
          </li>
          <li>
            cópias de segurança são eliminadas ou sobrescritas de acordo com ciclos técnicos
            controlados.
          </li>
        </ul>
        <p>
          Após o término do tratamento, os dados serão eliminados ou anonimizados, salvo quando a
          conservação for permitida ou exigida pela legislação. A exclusão de uma resposta pode
          alterar métricas agregadas anteriormente calculadas.
        </p>
      </LegalSection>

      <LegalSection id='seguranca' title='6. Segurança e confidencialidade'>
        <p>
          Adotamos medidas técnicas e administrativas proporcionais aos riscos, incluindo controle
          de acesso por organização e função, autenticação, senhas protegidas, isolamento lógico de
          dados entre clientes, registros de auditoria, backups e monitoramento operacional.
        </p>
        <p>
          Nenhum sistema é absolutamente seguro. Em caso de incidente relevante, adotaremos medidas
          para reduzir impactos e realizaremos as comunicações exigidas à empresa cliente, aos
          titulares e/ou à Autoridade Nacional de Proteção de Dados (ANPD), conforme o papel de cada
          agente e a legislação aplicável.
        </p>
      </LegalSection>

      <LegalSection id='direitos' title='7. Seus direitos como titular'>
        <p>
          Nos termos da LGPD, o titular pode solicitar, conforme aplicável: confirmação e acesso;
          correção; anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou
          tratados em desconformidade; portabilidade; informação sobre compartilhamentos; eliminação
          de dados tratados com consentimento; informação sobre a possibilidade de não consentir;
          revogação do consentimento; oposição; e revisão de decisões unicamente automatizadas.
        </p>
        <p>
          <strong>Se você respondeu a uma pesquisa:</strong> procure primeiro a empresa identificada
          no convite ou no formulário, pois ela normalmente é a controladora e decide sobre a
          solicitação. A Pergunta.ai prestará o suporte necessário à empresa cliente para o
          atendimento.
        </p>
        <p>
          <strong>Se a solicitação se refere à sua conta Pergunta.ai</strong> ou se você não
          consegue identificar a empresa responsável, escreva para{' '}
          <a href='mailto:privacidade@pergunta.ai'>privacidade@pergunta.ai</a>. Poderemos pedir
          dados adicionais para confirmar sua identidade e evitar acesso ou exclusão indevida.
          Pedidos legítimos serão atendidos gratuitamente nos prazos legais, ressalvadas as
          hipóteses de conservação autorizadas por lei.
        </p>
      </LegalSection>

      <LegalSection id='cookies' title='8. Cookies e tecnologias semelhantes'>
        <p>
          Utilizamos cookies e armazenamento local estritamente necessários para manter a sessão,
          guardar tokens de autenticação, aplicar preferências de tema e proteger rotas da conta.
          Esses recursos não são usados para venda de perfis nem publicidade comportamental.
        </p>
        <p>
          Você pode apagar cookies e dados locais nas configurações do navegador. Isso poderá
          encerrar sua sessão e exigir uma nova autenticação. Se futuramente adotarmos tecnologias
          opcionais de analytics ou publicidade, esta política será atualizada e, quando necessário,
          solicitaremos sua escolha antes da ativação.
        </p>
      </LegalSection>

      <LegalSection id='menores' title='9. Crianças e adolescentes'>
        <p>
          A Plataforma é voltada a empresas e não é destinada ao cadastro autônomo por crianças ou
          adolescentes. Caso uma empresa cliente pretenda realizar pesquisas com esse público, ela
          deverá avaliar previamente a legalidade, o melhor interesse do titular, os avisos e
          consentimentos necessários e configurar a coleta de forma compatível com a legislação.
        </p>
      </LegalSection>

      <LegalSection id='alteracoes' title='10. Alterações, legislação e contato'>
        <p>
          Podemos atualizar esta política para refletir mudanças legais, técnicas ou operacionais. A
          versão vigente permanecerá nesta página, com a data de atualização. Alterações relevantes
          poderão ser comunicadas pela Plataforma ou por e-mail.
        </p>
        <p>
          Esta política é interpretada conforme as leis da República Federativa do Brasil, em
          especial a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) e o Marco Civil da
          Internet (Lei nº 12.965/2014).
        </p>
        <p>
          Para dúvidas ou solicitações sobre privacidade, entre em contato pelo e-mail{' '}
          <a href='mailto:privacidade@pergunta.ai'>privacidade@pergunta.ai</a>. Para as regras de
          uso da Plataforma, consulte os <Link href='/terms-of-service'>Termos de Serviço</Link>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
