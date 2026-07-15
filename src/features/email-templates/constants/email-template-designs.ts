/**
 * Starter templates para o Unlayer (react-email-editor)
 * -------------------------------------------------------
 * Use contact_name e survey_link como merge tags,
 * alinhados com as variáveis registradas no EmailEditor.
 *
 * Para carregar no editor:
 *   editorRef.current?.editor?.loadDesign(welcomeDesign as JSONTemplate);
 */

const BASE_BODY_VALUES = {
  backgroundColor: '#F4F4F5',
  backgroundImage: {
    url: '',
    fullWidth: true,
    repeat: 'no-repeat',
    size: 'custom',
    position: 'center'
  },
  contentWidth: '600px',
  contentAlign: 'center',
  fontFamily: { label: 'Arial', value: 'arial,helvetica,sans-serif' },
  preheaderText: '',
  linkStyle: {
    body: true,
    linkColor: '#3AAEE0',
    linkHoverColor: '#2D8CB5',
    linkUnderline: true,
    linkHoverUnderline: true
  },
  textColor: '#333333'
};

// ── Row builders ──────────────────────────────────────────────────────────────

function bannerRow(bgColor: string, altText: string) {
  return {
    id: 'row-banner',
    cells: [1],
    columns: [
      {
        id: 'col-banner',
        contents: [
          {
            id: 'image-banner',
            type: 'image',
            values: {
              containerPadding: '0px',
              anchor: '',
              src: {
                url: 'https://placehold.co/600x220/E8ECEF/9AA5B1?text=Sua+imagem+aqui',
                width: 600,
                height: 220
              },
              textAlign: 'center',
              altText,
              action: { name: 'web', values: { href: '', target: '_blank' } },
              _meta: { htmlID: 'u_content_image_banner', htmlClassNames: 'u_content_image' }
            }
          }
        ],
        values: {
          backgroundColor: '',
          padding: '0px',
          border: {},
          _meta: { htmlID: 'u_column_banner', htmlClassNames: 'u_column' }
        }
      }
    ],
    values: {
      backgroundColor: bgColor,
      columnsBackgroundColor: '',
      padding: '0px',
      anchor: '',
      hideDesktop: false,
      _meta: { htmlID: 'u_row_banner', htmlClassNames: 'u_row' }
    }
  };
}

function headingRow(htmlText: string) {
  return {
    id: 'row-heading',
    cells: [1],
    columns: [
      {
        id: 'col-heading',
        contents: [
          {
            id: 'text-heading',
            type: 'text',
            values: {
              containerPadding: '32px 30px 10px',
              anchor: '',
              fontSize: '24px',
              textAlign: 'left',
              lineHeight: '130%',
              text: htmlText,
              _meta: { htmlID: 'u_content_text_heading', htmlClassNames: 'u_content_text' }
            }
          }
        ],
        values: {
          backgroundColor: '',
          padding: '0px',
          border: {},
          _meta: { htmlID: 'u_column_heading', htmlClassNames: 'u_column' }
        }
      }
    ],
    values: {
      backgroundColor: '#FFFFFF',
      padding: '0px',
      anchor: '',
      hideDesktop: false,
      _meta: { htmlID: 'u_row_heading', htmlClassNames: 'u_row' }
    }
  };
}

function bodyTextRow(htmlText: string) {
  return {
    id: 'row-body',
    cells: [1],
    columns: [
      {
        id: 'col-body',
        contents: [
          {
            id: 'text-body',
            type: 'text',
            values: {
              containerPadding: '0px 30px 20px',
              anchor: '',
              fontSize: '15px',
              textAlign: 'left',
              lineHeight: '160%',
              text: htmlText,
              _meta: { htmlID: 'u_content_text_body', htmlClassNames: 'u_content_text' }
            }
          }
        ],
        values: {
          backgroundColor: '',
          padding: '0px',
          border: {},
          _meta: { htmlID: 'u_column_body', htmlClassNames: 'u_column' }
        }
      }
    ],
    values: {
      backgroundColor: '#FFFFFF',
      padding: '0px',
      anchor: '',
      hideDesktop: false,
      _meta: { htmlID: 'u_row_body', htmlClassNames: 'u_row' }
    }
  };
}

function buttonRow(buttonText: string) {
  return {
    id: 'row-button',
    cells: [1],
    columns: [
      {
        id: 'col-button',
        contents: [
          {
            id: 'button-cta',
            type: 'button',
            values: {
              containerPadding: '10px 30px 40px',
              anchor: '',
              href: { name: 'web', values: { href: '{{survey_link}}', target: '_blank' } },
              buttonColors: {
                color: '#FFFFFF',
                backgroundColor: '#3AAEE0',
                hoverColor: '#FFFFFF',
                hoverBackgroundColor: '#2D8CB5'
              },
              size: { autoWidth: false, width: '100%' },
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: '120%',
              padding: '14px 30px',
              border: {},
              borderRadius: '6px',
              text: buttonText,
              _meta: { htmlID: 'u_content_button_cta', htmlClassNames: 'u_content_button' }
            }
          }
        ],
        values: {
          backgroundColor: '',
          padding: '0px',
          border: {},
          _meta: { htmlID: 'u_column_button', htmlClassNames: 'u_column' }
        }
      }
    ],
    values: {
      backgroundColor: '#FFFFFF',
      padding: '0px',
      anchor: '',
      hideDesktop: false,
      _meta: { htmlID: 'u_row_button', htmlClassNames: 'u_row' }
    }
  };
}

function footerRow(htmlText: string) {
  return {
    id: 'row-footer',
    cells: [1],
    columns: [
      {
        id: 'col-footer',
        contents: [
          {
            id: 'text-footer',
            type: 'text',
            values: {
              containerPadding: '20px 30px',
              anchor: '',
              fontSize: '12px',
              textAlign: 'center',
              lineHeight: '150%',
              text: htmlText,
              _meta: { htmlID: 'u_content_text_footer', htmlClassNames: 'u_content_text' }
            }
          }
        ],
        values: {
          backgroundColor: '',
          padding: '0px',
          border: {},
          _meta: { htmlID: 'u_column_footer', htmlClassNames: 'u_column' }
        }
      }
    ],
    values: {
      backgroundColor: '#F4F4F5',
      padding: '0px',
      anchor: '',
      hideDesktop: false,
      _meta: { htmlID: 'u_row_footer', htmlClassNames: 'u_row' }
    }
  };
}

// ── Designs ───────────────────────────────────────────────────────────────────

export const welcomeDesign = {
  schemaVersion: 16,
  body: {
    rows: [
      bannerRow('#FFFFFF', 'Imagem de boas-vindas'),
      headingRow('<p><strong>Bem-vindo(a), {{contact_name}}!</strong></p>'),
      bodyTextRow(
        '<p>Ficamos muito felizes em ter você com a gente. Para te conhecer melhor e ' +
          'melhorar cada vez mais a sua experiência, preparamos uma pesquisa rápida — ' +
          'leva menos de 2 minutos para responder.</p>' +
          '<p>Clique no botão abaixo e nos conte o que você achou até aqui:</p>'
      ),
      buttonRow('Responder Pesquisa'),
      footerRow('<p>Você está recebendo este e-mail porque criou uma conta recentemente.</p>')
    ],
    values: BASE_BODY_VALUES
  }
};

export const reminderDesign = {
  schemaVersion: 16,
  body: {
    rows: [
      bannerRow('#FFFFFF', 'Imagem de lembrete'),
      headingRow('<p><strong>Olá, {{contact_name}}</strong></p>'),
      bodyTextRow(
        '<p>Notamos que você ainda não teve a oportunidade de responder nossa pesquisa. ' +
          'Sua opinião é muito importante para nós e leva menos de 2 minutos para preencher.</p>' +
          '<p>Clique no botão abaixo para responder agora:</p>'
      ),
      buttonRow('Preencher Agora'),
      footerRow('<p>Se você já respondeu, pode ignorar este e-mail. Obrigado!</p>')
    ],
    values: BASE_BODY_VALUES
  }
};

export const thankYouDesign = {
  schemaVersion: 16,
  body: {
    rows: [
      bannerRow('#FFFFFF', 'Imagem de agradecimento'),
      headingRow('<p><strong>Obrigado, {{contact_name}}!</strong></p>'),
      bodyTextRow(
        '<p>Recebemos sua resposta e agradecemos muito por dedicar seu tempo para ' +
          'compartilhar sua opinião com a gente.</p>' +
          '<p>Seu feedback nos ajuda a melhorar continuamente. Até a próxima!</p>'
      ),
      footerRow('<p>Este e-mail confirma o recebimento da sua resposta à nossa pesquisa.</p>')
    ],
    values: BASE_BODY_VALUES
  }
};

/** Map slug → design para lookup rápido */
export const DESIGN_BY_SLUG: Record<string, unknown> = {
  welcome: welcomeDesign,
  reminder: reminderDesign,
  'thank-you': thankYouDesign
};
