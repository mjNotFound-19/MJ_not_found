import { Component } from "react";

// Decorative effects are optional. If one throws, show its fallback (or nothing)
// instead of letting the error unmount the whole page.
export default class EffectBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("[EffectBoundary] effect disabled after error:", error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
