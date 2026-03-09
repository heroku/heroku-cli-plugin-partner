import stripAnsi from 'strip-ansi'

export default function stripAnsiAndSymbols(text: string): string {
  return stripAnsi(text).replaceAll(/[»›▸⬢]\s*/gm, '')
}
