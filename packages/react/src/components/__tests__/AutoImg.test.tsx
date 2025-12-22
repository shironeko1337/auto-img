import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoImg } from '../AutoImg';

// Mock the web component registration
vi.mock('autoimg-webcomponent', () => ({}));

describe('AutoImg Component', () => {
  it('renders without crashing', () => {
    render(<AutoImg src="test.jpg" />);
    const element = document.querySelector('auto-img');
    expect(element).toBeTruthy();
  });

  it('sets basic attributes correctly', () => {
    render(
      <AutoImg
        src="https://example.com/image.jpg"
        width="400px"
        height="300px"
        imgAlt="Test image"
      />
    );

    const element = document.querySelector('auto-img');
    expect(element?.getAttribute('src')).toBe('https://example.com/image.jpg');
    expect(element?.getAttribute('width')).toBe('400px');
    expect(element?.getAttribute('height')).toBe('300px');
    expect(element?.getAttribute('img-alt')).toBe('Test image');
  });

  it('sets focus attributes correctly', () => {
    render(
      <AutoImg
        src="test.jpg"
        focus="50,50;100,100"
        focusCenter="75,75"
        padding="10"
      />
    );

    const element = document.querySelector('auto-img');
    expect(element?.getAttribute('focus')).toBe('50,50;100,100');
    expect(element?.getAttribute('focus-center')).toBe('75,75');
    expect(element?.getAttribute('padding')).toBe('10');
  });

  it('sets boolean attributes via useEffect', async () => {
    render(<AutoImg src="test.jpg" defer={true} allowDistortion={false} />);

    const element = document.querySelector('auto-img');

    // Wait for useEffect to run
    await vi.waitFor(() => {
      expect(element?.getAttribute('defer')).toBe('true');
      expect(element?.getAttribute('allowDistortion')).toBe('false');
    });
  });

  it('sets dotted attributes via useEffect', async () => {
    render(
      <AutoImg
        src="test.jpg"
        focusTl="20,30"
        focusBr="80,70"
      />
    );

    const element = document.querySelector('auto-img');

    // Wait for useEffect to run
    await vi.waitFor(() => {
      expect(element?.getAttribute('focus.tl')).toBe('20,30');
      expect(element?.getAttribute('focus.br')).toBe('80,70');
    });
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<AutoImg src="test.jpg" onClick={handleClick} />);

    const element = document.querySelector('auto-img');
    if (element) {
      await user.click(element);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('handles mouse events', async () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();
    const user = userEvent.setup();

    render(
      <AutoImg
        src="test.jpg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );

    const element = document.querySelector('auto-img');
    if (element) {
      await user.hover(element);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      await user.unhover(element);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    }
  });

  it('sets image attributes with img- prefix', () => {
    render(
      <AutoImg
        src="test.jpg"
        imgLoading="lazy"
        imgTitle="Image title"
        imgDraggable={false}
      />
    );

    const element = document.querySelector('auto-img');
    expect(element?.getAttribute('img-loading')).toBe('lazy');
    expect(element?.getAttribute('img-title')).toBe('Image title');
  });
});
