import { marked } from 'marked';

globalThis.marked = marked;

const style = document.createElement('style');
style.textContent = `
  .mc__card { position: relative; display: block; width: 270px; }
  .mc__card-body {
    font-size: 14px;
    line-height: 1.25;
    padding: 26px;
  }
  .mc__card-body h1 { font-size: 20px; line-height: 1.25; margin: 0 0 1em; }
  .mc__card-body h2 { font-size: 18px; line-height: 1.25; margin: 0 0 1em; }
  .mc__card-body h3 { font-size: 15px; line-height: 1.25; margin: 0 0 1em; }
  .mc__card-body p { margin: 0 0 1em; line-height: 1.25; }
  .mc__card-body ul, .mc__card-body ol { margin: 0 0 1em; padding-inline-start: 2em; }
  .mc__card-body li { margin-bottom: 0.5em; line-height: 1.25; }
  .mc__card-body table { border-collapse: collapse; margin-bottom: 1em; }
  .mc__card-body td, .mc__card-body th { border: 1px solid #ccc; padding: 4px 8px; }
  .mc__card-body pre { margin: 0 0 1em; white-space: pre-wrap; font-size: 13px; line-height: 1.4; }
  .mc__card-body blockquote { margin: 0 0 1em; padding-inline-start: 1em; border-inline-start: 3px solid #ccc; }
  .mc__card-body hr { border: none; border-top: 1px solid #ccc; margin: 1em 0; }
  .mc__card-body code { font-size: 13px; }
`;
document.head.appendChild(style);