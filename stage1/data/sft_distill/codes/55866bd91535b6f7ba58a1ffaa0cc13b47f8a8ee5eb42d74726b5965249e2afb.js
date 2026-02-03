// 全局信号对象，用于验证状态
window.__signals__ = {
  loadingProgress: [],
  sceneSwitches: [],
  currentScene: null
};

// LoadingScene - 负责预加载资源并显示进度条
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    window.__signals__.currentScene = 'LoadingScene';
    window.__signals__.sceneSwitches.push({
      scene: 'LoadingScene',
      timestamp: Date.now(),
      action: 'started'
    });

    // 创建青色进度条背景
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.progressBar = this.add.graphics();
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 添加加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px monospace',
      fill: '#ffffff'
    });
    this.percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      const percent = Math.floor(value * 100);
      this.percentText.setText(percent + '%');
      
      // 绘制青色进度条
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ffff, 1); // 青色
      this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);

      // 记录进度信号
      window.__signals__.loadingProgress.push({
        progress: value,
        percent: percent,
        timestamp: Date.now()
      });

      console.log(`Loading progress: ${percent}%`);
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      console.log('Loading complete!');
      window.__signals__.sceneSwitches.push({
        scene: 'LoadingScene',
        timestamp: Date.now(),
        action: 'completed'
      });
    });

    // 模拟加载资源 - 使用虚拟图片（通过 Graphics 生成纹理）
    // 创建一些虚拟纹理资源
    for (let i = 0; i < 5; i++) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xff0000 + i * 0x001100, 1);
      graphics.fillRect(0, 0, 64, 64);
      graphics.generateTexture(`asset${i}`, 64, 64);
      graphics.destroy();
    }

    // 使用 image 加载器模拟延迟（通过加载 base64 图片）
    // 创建一个小的 base64 图片用于模拟加载延迟
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    for (let i = 0; i < 10; i++) {
      this.load.image(`dummy${i}`, dummyImage);
    }
  }

  create() {
    // 延迟切换场景，确保进度条显示完整
    this.time.delayedCall(500, () => {
      console.log('Switching to MainScene...');
      window.__signals__.sceneSwitches.push({
        scene: 'MainScene',
        timestamp: Date.now(),
        action: 'switching'
      });
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // MainScene 不需要额外加载
  }

  create() {
    window.__signals__.currentScene = 'MainScene';
    window.__signals__.sceneSwitches.push({
      scene: 'MainScene',
      timestamp: Date.now(),
      action: 'started'
    });

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示标题
    const title = this.add.text(width / 2, height / 2 - 100, 'Loading Complete!', {
      font: 'bold 32px monospace',
      fill: '#00ffff'
    });
    title.setOrigin(0.5);

    // 显示成功信息
    const successText = this.add.text(width / 2, height / 2, 'Welcome to Main Scene', {
      font: '20px monospace',
      fill: '#ffffff'
    });
    successText.setOrigin(0.5);

    // 显示加载的资源数量
    const assetCount = this.add.text(width / 2, height / 2 + 50, 'Assets Loaded: 15', {
      font: '16px monospace',
      fill: '#00ff00'
    });
    assetCount.setOrigin(0.5);

    // 添加一些视觉效果 - 使用加载的纹理创建精灵
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 120;
      const y = height - 100;
      
      const sprite = this.add.graphics();
      sprite.fillStyle(0x00ffff, 0.8);
      sprite.fillCircle(x, y, 30);
      
      // 添加脉动动画
      this.tweens.add({
        targets: sprite,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        delay: i * 200
      });
    }

    // 添加状态信号
    window.__signals__.mainSceneReady = true;
    window.__signals__.timestamp = Date.now();

    console.log('MainScene initialized successfully');
    console.log('Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  update(time, delta) {
    // 可以在这里添加更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = game;
}