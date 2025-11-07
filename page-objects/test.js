const { chromium } = require('playwright');
const wd = require('wd');

const APPIUM_CONFIG = {
  platformName: 'Android',
  deviceName: process.env.DEVICE_NAME || 'emulator-5554',
  appPackage: process.env.APP_PACKAGE || 'com.example.hybridapp',
  appActivity: process.env.APP_ACTIVITY || 'com.example.hybridapp.MainActivity',
  automationName: 'UiAutomator2',
  noReset: true,
  fullReset: false,
  newCommandTimeout: 300
};

const APPIUM_URL = process.env.APPIUM_URL || 'http://localhost:4723/wd/hub';
const WEBVIEW_TIMEOUT = 30000;
const ELEMENT_TIMEOUT = 10000;

class HybridAppTester {
  constructor(config = {}) {
    this.driver = null;
    this.browser = null;
    this.page = null;
    this.currentContext = 'NATIVE_APP';
    this.config = { ...APPIUM_CONFIG, ...config };
    this.appiumUrl = config.appiumUrl || APPIUM_URL;
  }

  async initializeAppium() {
    try {
      console.log('Initializing Appium session...');
      this.driver = wd.promiseChainRemote(this.appiumUrl);
      await this.driver.init(this.config);
      console.log('Appium session initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Appium:', error.message);
      throw new Error(`Appium initialization failed: ${error.message}`);
    }
  }

  async switchToWebView(timeout = WEBVIEW_TIMEOUT) {
    try {
      console.log('Switching to WebView context...');
      const startTime = Date.now();
      let webviewContext = null;
      
      while (Date.now() - startTime < timeout) {
        const contexts = await this.driver.contexts();
        console.log('Available contexts:', contexts);
        webviewContext = contexts.find(c => c.includes('WEBVIEW'));
        
        if (webviewContext) {
          await this.driver.context(webviewContext);
          this.currentContext = webviewContext;
          console.log(`Switched to WebView context: ${webviewContext}`);
          return webviewContext;
        }
        
        await this.sleep(1000);
      }
      
      throw new Error(`WebView context not found within ${timeout}ms`);
    } catch (error) {
      console.error('Failed to switch to WebView:', error.message);
      throw error;
    }
  }

  async connectPlaywright() {
    try {
      console.log('Connecting Playwright to WebView...');
      const devtoolsUrl = await this.driver.execute('mobile: getWebviewDevtoolsUrl', {});
      
      if (!devtoolsUrl) {
        throw new Error('DevTools URL not available');
      }
      
      console.log('DevTools URL:', devtoolsUrl);
      this.browser = await chromium.connectOverCDP(devtoolsUrl);
      
      const contexts = this.browser.contexts();
      if (contexts.length > 0) {
        this.page = contexts[0].pages()[0] || await contexts[0].newPage();
      } else {
        this.page = await this.browser.newPage();
      }
      
      console.log('Playwright connected successfully');
      return this.page;
    } catch (error) {
      console.error('Failed to connect Playwright:', error.message);
      throw new Error(`Playwright connection failed: ${error.message}`);
    }
  }

  async performWebViewLogin(username, password, loginUrl = 'https://example.com') {
    try {
      console.log(`Navigating to login page: ${loginUrl}`);
      await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: ELEMENT_TIMEOUT });
      
      console.log('Filling username...');
      await this.page.waitForSelector('#username', { timeout: ELEMENT_TIMEOUT });
      await this.page.fill('#username', username);
      
      console.log('Filling password...');
      await this.page.waitForSelector('#password', { timeout: ELEMENT_TIMEOUT });
      await this.page.fill('#password', password);
      
      console.log('Clicking login button...');
      await this.page.waitForSelector('#login', { timeout: ELEMENT_TIMEOUT });
      await this.page.click('#login');
      
      console.log('Login submitted successfully');
      return true;
    } catch (error) {
      console.error('Login failed:', error.message);
      throw new Error(`WebView login failed: ${error.message}`);
    }
  }

  async switchToNativeContext() {
    try {
      console.log('Switching to native context...');
      await this.driver.context('NATIVE_APP');
      this.currentContext = 'NATIVE_APP';
      console.log('Switched to native context');
      return true;
    } catch (error) {
      console.error('Failed to switch to native context:', error.message);
      throw error;
    }
  }

  async getNativeElementText(accessibilityId, timeout = ELEMENT_TIMEOUT) {
    try {
      console.log(`Finding element by accessibility ID: ${accessibilityId}`);
      await this.driver.setImplicitWaitTimeout(timeout);
      const element = await this.driver.elementByAccessibilityId(accessibilityId);
      const text = await element.text();
      console.log(`Element text: ${text}`);
      return text;
    } catch (error) {
      console.error(`Failed to get element text for ${accessibilityId}:`, error.message);
      throw error;
    }
  }

  async clickNativeElement(accessibilityId, timeout = ELEMENT_TIMEOUT) {
    try {
      console.log(`Clicking element by accessibility ID: ${accessibilityId}`);
      await this.driver.setImplicitWaitTimeout(timeout);
      const element = await this.driver.elementByAccessibilityId(accessibilityId);
      await element.click();
      console.log('Element clicked successfully');
      return true;
    } catch (error) {
      console.error(`Failed to click element ${accessibilityId}:`, error.message);
      throw error;
    }
  }

  async waitForNativeElement(accessibilityId, timeout = ELEMENT_TIMEOUT) {
    try {
      console.log(`Waiting for element: ${accessibilityId}`);
      await this.driver.setImplicitWaitTimeout(timeout);
      const element = await this.driver.elementByAccessibilityId(accessibilityId);
      const isDisplayed = await element.isDisplayed();
      if (isDisplayed) {
        console.log('Element is displayed');
        return element;
      }
      throw new Error(`Element ${accessibilityId} not displayed`);
    } catch (error) {
      console.error(`Element ${accessibilityId} not found:`, error.message);
      throw error;
    }
  }

  async getCurrentContext() {
    const context = await this.driver.currentContext();
    this.currentContext = context;
    return context;
  }

  async getAllContexts() {
    return await this.driver.contexts();
  }

  async takeScreenshot(filepath) {
    try {
      const screenshot = await this.driver.takeScreenshot();
      if (filepath) {
        const fs = require('fs');
        fs.writeFileSync(filepath, screenshot, 'base64');
        console.log(`Screenshot saved to: ${filepath}`);
      }
      return screenshot;
    } catch (error) {
      console.error('Failed to take screenshot:', error.message);
      throw error;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    console.log('Cleaning up resources...');
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('Browser closed');
      }
    } catch (error) {
      console.error('Error closing browser:', error.message);
    }
    
    try {
      if (this.driver) {
        await this.driver.quit();
        console.log('Appium session ended');
      }
    } catch (error) {
      console.error('Error quitting driver:', error.message);
    }
  }
}

async function runHybridTest(username = 'testuser', password = 'testpass', loginUrl) {
  const tester = new HybridAppTester();
  
  try {
    await tester.initializeAppium();
    
    console.log('\n--- Starting Hybrid App Test ---\n');
    
    await tester.switchToWebView();
    await tester.connectPlaywright();
    await tester.performWebViewLogin(username, password, loginUrl);
    
    await tester.sleep(2000);
    
    await tester.switchToNativeContext();
    
    const welcomeText = await tester.getNativeElementText('welcomeMessage');
    console.log('\n--- Test Result ---');
    console.log('Welcome Message:', welcomeText);
    console.log('\n--- Test Completed Successfully ---\n');
    
    return { success: true, welcomeText };
  } catch (error) {
    console.error('\n--- Test Failed ---');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    try {
      await tester.takeScreenshot('./error-screenshot.png');
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError.message);
    }
    
    return { success: false, error: error.message };
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  const username = process.env.TEST_USERNAME || 'testuser';
  const password = process.env.TEST_PASSWORD || 'testpass';
  const loginUrl = process.env.LOGIN_URL;
  
  runHybridTest(username, password, loginUrl)
    .then(result => {
      if (result.success) {
        console.log('Test execution completed successfully');
        process.exit(0);
      } else {
        console.error('Test execution failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { HybridAppTester };
