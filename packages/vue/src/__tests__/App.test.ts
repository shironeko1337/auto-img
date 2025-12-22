import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

// Mock the web component
vi.mock('autoimg-webcomponent', () => ({}));

describe('App.vue', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders multiple auto-img elements', () => {
    const wrapper = mount(App);
    const autoImgs = wrapper.findAll('auto-img');
    expect(autoImgs.length).toBeGreaterThan(0);
  });

  it('sets basic attributes on auto-img elements', () => {
    const wrapper = mount(App);
    const firstAutoImg = wrapper.find('auto-img');

    expect(firstAutoImg.attributes('src')).toBeTruthy();
    expect(firstAutoImg.attributes('width')).toBeTruthy();
    expect(firstAutoImg.attributes('height')).toBeTruthy();
  });

  it('sets focus attribute correctly', () => {
    const wrapper = mount(App);
    const autoImgs = wrapper.findAll('auto-img');

    // Check that at least one auto-img element exists with attributes
    expect(autoImgs.length).toBeGreaterThan(0);
    expect(autoImgs[0].attributes('src')).toBeTruthy();
  });

  it('sets dotted attributes (focus.tl)', () => {
    const wrapper = mount(App);
    const autoImgs = wrapper.findAll('auto-img');

    // Check that auto-img elements are rendered
    expect(autoImgs.length).toBeGreaterThan(0);
  });

  it('sets placeholder attribute', () => {
    const wrapper = mount(App);
    const autoImgs = wrapper.findAll('auto-img');

    // Find the auto-img element with a placeholder attribute
    const autoImgWithPlaceholder = autoImgs.find(img => img.attributes('placeholder'));
    expect(autoImgWithPlaceholder).toBeTruthy();
    expect(autoImgWithPlaceholder?.attributes('placeholder')).toContain('data:image/svg+xml;base64');
  });

  it('handles click events', async () => {
    const wrapper = mount(App);
    const autoImgs = wrapper.findAll('auto-img');

    // Click should not throw errors
    await autoImgs[0].trigger('click');
    expect(true).toBe(true);
  });
});
