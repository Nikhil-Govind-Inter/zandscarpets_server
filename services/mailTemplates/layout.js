const { SITE_URL } = require("../../constants");
const { escapeHtml } = require("./utils");

// Shared Z&S email layout, ported from the root `mail-template.html` design (the quote
// "Inquiry Received" email). Every transactional email - admin notifications and user
// confirmations alike - is rendered through this one function so the branding stays in
// one place; each mailer method only supplies its own sections/content.
//
// Table-based markup with inline styles only, since most mail clients strip <style> blocks.

const BLUE = "#0066b3";
const PURPLE = "#812990";
const DARK = "#111111";
const FONT = "Arial, sans-serif";

const cellBorderRight = "border-right: 1px solid #eeeeee;";
const cellBorderBottom = "border-bottom: 1px solid #eeeeee;";

const detailCell = ({ label, value, href }, { colspan, right, bottom }) => {
  const content = href
    ? `<a href="${escapeHtml(href)}" style="color: ${BLUE}; font-weight: 500">${escapeHtml(value)}</a>`
    : `<span style="color: ${BLUE}; font-weight: 500">${escapeHtml(value)}</span>`;
  return `
                    <td${colspan ? ` colspan="${colspan}"` : ' width="50%"'} style="padding: 14px 20px; ${right ? cellBorderRight : ""} ${bottom ? cellBorderBottom : ""} font-size: 13px; font-weight: 600; word-break: break-word">
                      ${escapeHtml(label)}<br />
                      ${content}
                    </td>`;
};

// The dashed "Your Inquiry Details" box: label/value pairs laid out two per row.
// Empty values are skipped; an odd last cell spans both columns.
const renderDetails = (title, details) => {
  const cells = (details || []).filter((item) => item && item.value !== undefined && item.value !== null && item.value !== "");
  if (!cells.length) return "";

  const rows = [];
  for (let i = 0; i < cells.length; i += 2) {
    const isLastRow = i + 2 >= cells.length;
    const pair = cells.slice(i, i + 2);
    rows.push(`
                  <tr>${
                    pair.length === 2
                      ? detailCell(pair[0], { right: true, bottom: !isLastRow }) + detailCell(pair[1], { bottom: !isLastRow })
                      : detailCell(pair[0], { colspan: 2, bottom: !isLastRow })
                  }
                  </tr>`);
  }

  return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px dashed #cccccc; margin: 0 0 25px">
                  <tr>
                    <td colspan="2" align="center" style="padding: 12px; font-size: 16px; ${cellBorderBottom} font-weight: 600">
                      ${escapeHtml(title)}
                    </td>
                  </tr>${rows.join("")}
                </table>`;
};

// Line items (quote requests): same dashed box, as a Product / Variant / Qty table.
const renderItems = (title, items) => {
  if (!items || !items.length) return "";
  const th = (label, align = "left") =>
    `<th align="${align}" style="padding: 10px 14px; ${cellBorderBottom} font-size: 12px; font-weight: 600; color: ${DARK}">${label}</th>`;
  const td = (value, { align = "left", last } = {}) =>
    `<td align="${align}" style="padding: 10px 14px; ${last ? "" : cellBorderBottom} font-size: 13px; color: ${BLUE}; word-break: break-word">${escapeHtml(value)}</td>`;

  const rows = items
    .map((item, index) => {
      const last = index === items.length - 1;
      return `
                  <tr>
                    ${td(item.product, { last })}
                    ${td(item.variant || "-", { last })}
                    ${td(item.qty, { align: "center", last })}
                  </tr>`;
    })
    .join("");

  return `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px dashed #cccccc; margin: 0 0 25px; text-align: left">
                  <tr>
                    <td colspan="3" align="center" style="padding: 12px; font-size: 16px; ${cellBorderBottom} font-weight: 600">
                      ${escapeHtml(title)}
                    </td>
                  </tr>
                  <tr>${th("Product")}${th("Variant")}${th("Qty", "center")}</tr>${rows}
                </table>`;
};

/**
 * @param {object} opts
 * @param {string} opts.title           Heading (also the <title>)
 * @param {string} [opts.preheader]     Hidden inbox preview text
 * @param {{name: string, referenceId?: string}} [opts.greeting]  "Hello, <name> (ID - ...)"
 * @param {string} [opts.introHtml]     Intro paragraph - already-escaped HTML (may contain <strong>)
 * @param {string} [opts.detailsTitle]
 * @param {{label: string, value: any, href?: string}[]} [opts.details]
 * @param {string} [opts.itemsTitle]
 * @param {{product: string, variant?: string, qty: any}[]} [opts.items]
 * @param {string} [opts.message]       Free-text message block (plain text, escaped here)
 * @param {string} [opts.messageTitle]
 * @param {string} [opts.bodyHtml]      Extra already-escaped HTML after the intro (e.g. an OTP code)
 * @param {{label: string, href: string} | null} [opts.cta]  Defaults to "Visit Website"; null hides it
 */
const renderEmailLayout = ({
  title,
  preheader,
  greeting,
  introHtml,
  detailsTitle = "Your Inquiry Details",
  details,
  itemsTitle = "Products",
  items,
  message,
  messageTitle = "Message",
  bodyHtml,
  cta = { label: "Visit Website", href: SITE_URL },
}) => `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>

  <body style="margin: 0; padding: 0; background-color: #ffffff">
    ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0">${escapeHtml(preheader)}</div>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff">
            <!-- Header -->
            <tr>
              <td align="center" style="background-color: ${BLUE}; padding: 7px 20px; color: #ffffff; font-family: ${FONT}; font-size: 12px">
                Welcome to Z&amp;S Carpets
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding: 30px 40px; font-family: ${FONT}; color: ${DARK}">
                <img
                  src="${escapeHtml(SITE_URL)}/site-logo-email.png"
                  width="150"
                  alt="Z&amp;S Carpets"
                  style="display: block; width: 150px; height: auto; margin: 0 auto 30px"
                />

                <h1 style="margin: 0 0 10px; color: ${BLUE}; font-size: 26px; font-weight: 700">${escapeHtml(title)}</h1>
                ${
                  greeting
                    ? `
                <p style="margin: 0 0 25px; color: ${DARK}; font-size: 14px; line-height: 1.6">
                  Hello, <strong>${escapeHtml(greeting.name)}</strong>${greeting.referenceId ? `<br />\n                  (ID - ${escapeHtml(greeting.referenceId)})` : ""}
                </p>`
                    : ""
                }
                ${introHtml ? `<p style="margin: 0 0 25px; color: ${DARK}; font-size: 14px; line-height: 1.6">${introHtml}</p>` : ""}
                ${bodyHtml || ""}
                ${details ? renderDetails(detailsTitle, details) : ""}
                ${renderItems(itemsTitle, items)}
                ${
                  message
                    ? `
                <p style="margin: 3px 0 8px; font-size: 14px; font-weight: bold">${escapeHtml(messageTitle)}</p>
                <p style="margin: 0 0 30px; font-size: 14px; line-height: 1.7; white-space: pre-line">${escapeHtml(message)}</p>`
                    : ""
                }
                ${
                  cta
                    ? `
                <a
                  href="${escapeHtml(cta.href)}"
                  style="display: inline-block; min-width: 140px; padding: 12px 20px; background-color: ${PURPLE}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold"
                >
                  ${escapeHtml(cta.label)}
                </a>`
                    : ""
                }
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 8px 20px; background-color: ${DARK}; color: #ffffff; font-family: ${FONT}; font-size: 11px">
                &copy; ${new Date().getFullYear()} Z&amp;S Carpets. All Rights Reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

module.exports = { renderEmailLayout };
