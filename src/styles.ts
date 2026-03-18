export const WIDGET_CSS = `
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    color: #1a1a1a;
    line-height: 1.5;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .vvz-agenda {
    max-width: 720px;
    margin: 0 auto;
  }

  .vvz-header {
    background: #006B3F;
    color: #fff;
    padding: 16px 20px;
    border-radius: 8px 8px 0 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .vvz-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: #e0e0e0;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
  }

  .vvz-card {
    background: #fff;
    padding: 16px 20px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .vvz-card:last-child {
    border-radius: 0 0 8px 8px;
  }

  .vvz-date-badge {
    flex-shrink: 0;
    width: 56px;
    text-align: center;
    background: #006B3F;
    color: #fff;
    border-radius: 6px;
    padding: 6px 4px;
    line-height: 1.2;
  }

  .vvz-date-badge .weekday {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: lowercase;
    opacity: 0.85;
  }

  .vvz-date-badge .day {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .vvz-date-badge .month {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .vvz-card-body {
    flex: 1;
    min-width: 0;
  }

  .vvz-card-title {
    margin: 0 0 2px;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .vvz-card-link {
    color: #006B3F;
    text-decoration: none;
    font-weight: 600;
  }

  .vvz-card-link:hover {
    text-decoration: underline;
  }

  .vvz-card-link:visited {
    color: #005432;
  }

  .vvz-card-time {
    font-size: 0.85rem;
    color: #006B3F;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .vvz-card-desc {
    font-size: 0.875rem;
    color: #555;
    margin: 0;
  }

  .vvz-card-body-content {
    font-size: 0.875rem;
    color: #444;
    margin-top: 8px;
  }

  .vvz-card-body-content p {
    margin: 0.4em 0;
  }

  .vvz-empty {
    background: #fff;
    padding: 32px 20px;
    text-align: center;
    color: #888;
    border-radius: 0 0 8px 8px;
  }

  .vvz-error {
    background: #fff3f3;
    color: #c00;
    padding: 16px 20px;
    border-radius: 0 0 8px 8px;
    text-align: center;
  }

  .vvz-loading {
    background: #fff;
    padding: 32px 20px;
    text-align: center;
    color: #888;
    border-radius: 0 0 8px 8px;
  }
`;
