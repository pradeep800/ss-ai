type Props = {
  questionsInfo: { title: string; day: number; questionNo: number }[];
};

export default function EmailReminder({ questionsInfo }: Props) {
  const questions = questionsInfo.reduce((all, question) => {
    const data = `<table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="border-style:solid;border-width:2px;border-color:rgb(239,68,68);border-radius:0.375rem;margin-top:0.5rem;margin-bottom:0.5rem;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;;padding:0.5rem;box-shadow:0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0,0,0,0.1), 0 4px 6px -4px rgb(0,0,0,0.1)">
              <tbody>
                <tr>
                  <td>
                    <p style="font-size:1.125rem;line-height:1.75rem;margin:0px;font-weight:600">${question.title}</p><a href="https://striversheet.pradeepbisht.com/sheet/day-${question.day}/${question.questionNo}" style="background-color:rgb(248,113,113);padding:8px 8px 8px 8px;border-radius:0.375rem;color:rgb(255,255,255);margin-top:0.5rem;line-height:100%;text-decoration:none;display:inline-block;max-width:100%" target="_blank"><span><!--[if mso]><i style="letter-spacing: 8px;mso-font-width:-100%;mso-text-raise:12" hidden>&nbsp;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:6px">Check Question</span><span><!--[if mso]><i style="letter-spacing: 8px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a>
                  </td>
                </tr>
              </tbody>
        </table>`;
    return all + data;
  }, "");

  return `<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
  </head>

  <body style="background-color:rgb(255,255,255)">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0.5rem">
      <tbody>
        <tr style="width:100%">
          <td>
            <h1 class="dark" style="text-align:center;color:rgb(239,68,68)">Today&#x27;s Question Reminders</h1>
            ${questions}
            <a class="e   " href="https://striversheet.pradeepbisht.com/reminders" style="background-color:rgb(239,68,68);padding:4px 4px 4px 4px;margin-top:0.5rem;border-radius:0.375rem;color:rgb(255,255,255);text-align:center;font-size:1.125rem;line-height:100%;width:100%;text-decoration:none;display:inline-block;max-width:100%" target="_blank"><span><!--[if mso]><i style="letter-spacing: 4px;mso-font-width:-100%;mso-text-raise:6" hidden>&nbsp;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:3px">Reminder Page</span><span><!--[if mso]><i style="letter-spacing: 4px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a>
          </td>
        </tr>
      </tbody>
    </table>
  </body>

</html>
`;
}
