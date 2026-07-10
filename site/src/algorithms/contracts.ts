export type EventSink<Event> = (event: Readonly<Event>) => void

export interface RecordedRun<Result, Event> {
  result: Result
  events: readonly Event[]
}

export const ignoreEvents = () => {}

