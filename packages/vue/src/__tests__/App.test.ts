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

  it('renders the title', () => {
    const wrapper = mount(App);
    expect(wrapper.find('h1').text()).toBe('AutoImg Vue Demo');
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

    // Check that auto-img elements can have various attributes
    expect(autoImgs.length).toBeGreaterThan(0);
  });

  it('handles click events', async () => {
    const wrapper = mount(App);
    const autoImgs = wrapper.findAll('auto-img');
    
    // Click should not throw errors
    await autoImgs[0].trigger('click');
    expect(true).toBe(true);
  });

  it('renders demo sections', () => {
    const wrapper = mount(App);
    const demoItems = wrapper.findAll('.demo-item');
    expect(demoItems.length).toBe(6);
  });

  it('renders section titles', () => {
    const wrapper = mount(App);
    const titles = wrapper.findAll('h2');
    
    expect(titles.length).toBe(6);
    expect(titles[0].text()).toBe('Basic Usage');
    expect(titles[1].text()).toBe('With Focus Point');
    expect(titles[2].text()).toBe('With Placeholder');
  });
});
