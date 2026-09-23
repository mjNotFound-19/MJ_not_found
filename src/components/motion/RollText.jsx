// Two stacked copies of the label; hovering the nearest `.roll-host` slides the
// second copy up into place, letter by letter.
export default function RollText({ children, className = "" }) {
  const text = String(children);
  const letters = text.split("");

  const renderRow = (hidden) => (
    <span className="roll-row" aria-hidden={hidden || undefined}>
      {letters.map((char, i) => (
        <span key={i} className="roll-char" style={{ transitionDelay: `${i * 12}ms` }}>
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );

  return (
    <span className={`roll-text ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="roll-track" aria-hidden="true">
        {renderRow(false)}
        {renderRow(true)}
      </span>
    </span>
  );
}
