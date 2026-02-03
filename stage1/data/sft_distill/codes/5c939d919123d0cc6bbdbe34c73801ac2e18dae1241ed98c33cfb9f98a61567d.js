// LoadingScene - 预加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
    this.loadingProgress = 0;
  }

  preload() {
    // 创建加载进度条背景
    const width = 400;
    const height = 30;
    const x = (this.cameras.main.width - width) / 2;
    const y = this.cameras.main.height / 2;

    // 背景框
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, width, height);

    // 进度条
    const progressBar = this.add.graphics();

    // 加载文本
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      y - 50,
      'Loading...',
      {
        font: '20px Arial',
        fill: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5, 0.5);

    // 百分比文本
    const percentText = this.add.text(
      this.cameras.main.width / 2,
      y + height / 2,
      '0%',
      {
        font: '18px Arial',
        fill: '#ffffff'
      }
    );
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度
    this.load.on('progress', (value) => {
      this.loadingProgress = value;
      percentText.setText(Math.floor(value * 100) + '%');
      
      // 绘制红色进度条
      progressBar.clear();
      progressBar.fillStyle(0xff0000, 1);
      progressBar.fillRect(x + 2, y + 2, (width - 4) * value, height - 4);
    });

    // 加载完成事件
    this.load.on('complete', () => {
      loadingText.setText('Complete!');
      progressBar.destroy();
      progressBox.destroy();
    });

    // 模拟加载一些假资源（用于触发进度事件）
    // 使用程序化生成的纹理代替外部资源
    for (let i = 0; i < 10; i++) {
      // 创建一个假的图片加载（使用base64的1x1透明图片）
      this.load.image(`dummy${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  create() {
    // 状态信号：记录加载完成状态
    this.registry.set('loadingComplete', true);
    this.registry.set('loadProgress', this.loadingProgress);

    // 延迟1秒后切换到主场景
    this.time.delayedCall(1000, () => {
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    // 可验证的状态变量
    this.score = 0;
    this.health = 100;
    this.level = 1;
  }

  create() {
    // 从注册表获取加载状态
    const loadingComplete = this.registry.get('loadingComplete');
    const loadProgress = this.registry.get('loadProgress');

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 标题文本
    const titleText = this.add.text(
      this.cameras.main.width / 2,
      100,
      'Main Scene',
      {
        font: 'bold 32px Arial',
        fill: '#00ff00'
      }
    );
    titleText.setOrigin(0.5);

    // 显示加载状态
    const statusText = this.add.text(
      this.cameras.main.width / 2,
      180,
      `Loading Status: ${loadingComplete ? 'Complete' : 'Incomplete'}\nProgress: ${Math.floor(loadProgress * 100)}%`,
      {
        font: '18px Arial',
        fill: '#ffffff',
        align: 'center'
      }
    );
    statusText.setOrigin(0.5);

    // 显示可验证的状态变量
    this.statusDisplay = this.add.text(
      this.cameras.main.width / 2,
      280,
      this.getStatusText(),
      {
        font: '20px Arial',
        fill: '#ffff00',
        align: 'center'
      }
    );
    this.statusDisplay.setOrigin(0.5);

    // 创建一个简单的交互元素（点击增加分数）
    const button = this.add.graphics();
    button.fillStyle(0xff0000, 1);
    button.fillRoundedRect(
      this.cameras.main.width / 2 - 100,
      400,
      200,
      50,
      10
    );

    const buttonText = this.add.text(
      this.cameras.main.width / 2,
      425,
      'Click to Score +10',
      {
        font: '18px Arial',
        fill: '#ffffff'
      }
    );
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const interactiveZone = this.add.zone(
      this.cameras.main.width / 2,
      425,
      200,
      50
    ).setInteractive();

    interactiveZone.on('pointerdown', () => {
      this.score += 10;
      this.health = Math.max(0, this.health - 5);
      if (this.score % 50 === 0) {
        this.level++;
      }
      this.statusDisplay.setText(this.getStatusText());
      
      // 视觉反馈
      button.clear();
      button.fillStyle(0xaa0000, 1);
      button.fillRoundedRect(
        this.cameras.main.width / 2 - 100,
        400,
        200,
        50,
        10
      );
      this.time.delayedCall(100, () => {
        button.clear();
        button.fillStyle(0xff0000, 1);
        button.fillRoundedRect(
          this.cameras.main.width / 2 - 100,
          400,
          200,
          50,
          10
        );
      });
    });

    // 提示文本
    const hintText = this.add.text(
      this.cameras.main.width / 2,
      550,
      'Scene transition successful!\nClick button to interact',
      {
        font: '16px Arial',
        fill: '#888888',
        align: 'center'
      }
    );
    hintText.setOrigin(0.5);

    // 将状态变量存储到注册表以便验证
    this.updateRegistry();
  }

  getStatusText() {
    return `Score: ${this.score}\nHealth: ${this.health}\nLevel: ${this.level}`;
  }

  updateRegistry() {
    this.registry.set('score', this.score);
    this.registry.set('health', this.health);
    this.registry.set('level', this.level);
  }

  update() {
    // 每帧更新注册表状态
    this.updateRegistry();
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene]
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态验证接口（用于测试）
window.getGameState = function() {
  return {
    loadingComplete: game.registry.get('loadingComplete'),
    loadProgress: game.registry.get('loadProgress'),
    score: game.registry.get('score'),
    health: game.registry.get('health'),
    level: game.registry.get('level')
  };
};