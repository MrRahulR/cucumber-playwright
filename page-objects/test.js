const { chromium } = require('playwright');
const wd = require('wd');

const APPIUM_CONFIG = {
  platformName: 'Android',
  deviceName: 'emulator-5554',
  appPackage: 'com.example.hybridapp',
  appActivity: 'com.example.hybridapp.MainActivity',
  automationName: 'UiAutomator2'
};

const APPIUM_URL = 'http://localhost:4723/wd/hub';

class HybridAppTester {
  constructor() {
    this.driver = null;
    this.browser = null;
    this.page = null;
  }

  async initializeAppium() {
    this.driver = wd.promiseChainRemote(APPIUM_URL);
    await this.driver.init(APPIUM_CONFIG);
  }

  async switchToWebView() {
    const contexts = await this.driver.contexts();
    const webviewContext = contexts.find(c => c.includes('WEBVIEW'));
    
    if (!webviewContext) {
      throw new Error('WebView context not found');
    }
    
    await this.driver.context(webviewContext);
  }

  async connectPlaywright() {
    const devtoolsUrl = await this.driver.execute('mobile: getWebviewDevtoolsUrl', {});
    this.browser = await chromium.connectOverCDP(devtoolsUrl);
    this.page = await this.browser.newPage();
  }

  async performWebViewLogin(username, password) {
    await this.page.goto('https://example.com');
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.click('#login');
  }

  async switchToNativeContext() {
    await this.driver.context('NATIVE_APP');
  }

  async getNativeElementText(accessibilityId) {
    const element = await this.driver.elementByAccessibilityId(accessibilityId);
    return await element.text();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.driver) {
      await this.driver.quit();
    }
  }
}

async function runHybridTest() {
  const tester = new HybridAppTester();
  
  try {
    await tester.initializeAppium();
    await tester.switchToWebView();
    await tester.connectPlaywright();
    await tester.performWebViewLogin('Infinity', 'secret');
    await tester.switchToNativeContext();
    
    const welcomeText = await tester.getNativeElementText('welcomeMessage');
    console.log(welcomeText);
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  runHybridTest().catch(console.error);
}

module.exports = { HybridAppTester };
