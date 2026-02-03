// LoadingScene: 显示加载进度
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingProgress = 0; // 可验证的加载进度状态
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建进度条背景
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 创建进度条
    const progressBar = this.add.graphics();

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建百分比文本
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      this.loadingProgress = Math.floor(value * 100);
      percentText.setText(this.loadingProgress + '%');
      
      // 绘制黄色进度条
      progressBar.clear();
      progressBar.fillStyle(0xffff00, 1); // 黄色
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟加载一些资源（使用内置方法创建纹理）
    // 创建一些假的加载任务来展示进度条效果
    for (let i = 0; i < 10; i++) {
      // 使用 image 加载器加载 base64 编码的 1x1 像素图片（模拟资源加载）
      const fakeImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      this.load.image('fake' + i, fakeImageData);
    }
  }

  create() {
    // 添加短暂延迟以确保用户能看到100%的进度
    this.time.delayedCall(500, () => {
      console.log('Loading complete! Progress:', this.loadingProgress);
      // 切换到主场景
      this.scene.start('MainScene');
    });
  }
}

// MainScene: 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    // 可验证的状态变量
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.isReady = false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 显示加载完成信息
    const titleText = this.add.text(width / 2, height / 2 - 100, 'Loading Complete!', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 显示状态信息
    const statusText = this.add.text(width / 2, height / 2, 
      `Level: ${this.level}\nScore: ${this.score}\nHealth: ${this.health}`, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    statusText.setOrigin(0.5);

    // 创建一个简单的游戏对象（使用Graphics绘制）
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色方块
    graphics.fillRect(width / 2 - 50, height / 2 + 80, 100, 100);

    // 添加交互提示
    const hintText = this.add.text(width / 2, height - 50, 'Click anywhere to increase score', {
      fontSize: '16px',
      color: '#aaaaaa'
    });
    hintText.setOrigin(0.5);

    // 添加点击交互
    this.input.on('pointerdown', () => {
      this.score += 10;
      statusText.setText(`Level: ${this.level}\nScore: ${this.score}\nHealth: ${this.health}`);
      
      // 每100分升级
      if (this.score % 100 === 0) {
        this.level++;
        statusText.setText(`Level: ${this.level}\nScore: ${this.score}\nHealth: ${this.health}`);
      }
    });

    // 标记场景已就绪
    this.isReady = true;
    console.log('MainScene ready! Initial state:', {
      score: this.score,
      level: this.level,
      health: this.health,
      isReady: this.isReady
    });

    // 添加一个简单的动画效果
    this.tweens.add({
      targets: graphics,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    // 可以在这里添加游戏逻辑
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene] // LoadingScene 作为初始场景
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态访问接口（用于测试验证）
window.getGameState = function() {
  const mainScene = game.scene.getScene('MainScene');
  if (mainScene) {
    return {
      score: mainScene.score,
      level: mainScene.level,
      health: mainScene.health,
      isReady: mainScene.isReady
    };
  }
  return null;
};