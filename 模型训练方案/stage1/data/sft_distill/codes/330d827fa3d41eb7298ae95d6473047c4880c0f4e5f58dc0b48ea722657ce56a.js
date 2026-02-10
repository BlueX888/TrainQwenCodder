// LoadingScene - 资源加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    // 创建进度条背景
    const width = 600;
    const height = 40;
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
        font: '24px Arial',
        color: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5, 0.5);

    // 百分比文本
    const percentText = this.add.text(
      this.cameras.main.width / 2,
      y + 20,
      '0%',
      {
        font: '18px Arial',
        color: '#ffffff'
      }
    );
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度
    this.load.on('progress', (value) => {
      // 清除之前的进度条
      progressBar.clear();
      
      // 绘制黄色进度条
      progressBar.fillStyle(0xffff00, 1);
      progressBar.fillRect(x + 10, y + 10, (width - 20) * value, height - 20);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
    });

    // 监听加载完成
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 创建虚拟资源进行加载（使用 1x1 像素的 base64 图片）
    // 红色方块
    const redPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    
    // 模拟加载多个资源
    for (let i = 0; i < 20; i++) {
      this.load.image(`asset${i}`, redPixel);
    }

    // 添加延迟以便看到加载过程
    this.load.image('dummy', redPixel);
  }

  create() {
    // 添加短暂延迟后切换场景，确保用户看到 100%
    this.time.delayedCall(500, () => {
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    // 状态信号
    this.gameState = {
      score: 0,
      health: 100,
      level: 1,
      loaded: true
    };
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 标题
    const title = this.add.text(
      this.cameras.main.width / 2,
      100,
      'Loading Complete!',
      {
        font: 'bold 48px Arial',
        color: '#00ff00'
      }
    );
    title.setOrigin(0.5, 0.5);

    // 状态面板背景
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x2d2d44, 1);
    panelBg.fillRect(200, 200, 400, 200);
    panelBg.lineStyle(3, 0xffff00, 1);
    panelBg.strokeRect(200, 200, 400, 200);

    // 显示状态信号
    const statusY = 240;
    const lineHeight = 40;

    this.add.text(250, statusY, 'Game Status:', {
      font: 'bold 24px Arial',
      color: '#ffff00'
    });

    this.scoreText = this.add.text(250, statusY + lineHeight, `Score: ${this.gameState.score}`, {
      font: '20px Arial',
      color: '#ffffff'
    });

    this.healthText = this.add.text(250, statusY + lineHeight * 2, `Health: ${this.gameState.health}`, {
      font: '20px Arial',
      color: '#ffffff'
    });

    this.levelText = this.add.text(250, statusY + lineHeight * 3, `Level: ${this.gameState.level}`, {
      font: '20px Arial',
      color: '#ffffff'
    });

    // 创建一些装饰元素（使用加载的资源）
    const decorations = this.add.group();
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 150;
      const sprite = this.add.sprite(x, 500, `asset${i}`);
      sprite.setDisplaySize(50, 50);
      sprite.setTint(0xffff00);
      decorations.add(sprite);
    }

    // 添加交互提示
    const hint = this.add.text(
      this.cameras.main.width / 2,
      550,
      'Click anywhere to increase score',
      {
        font: '18px Arial',
        color: '#aaaaaa'
      }
    );
    hint.setOrigin(0.5, 0.5);

    // 添加点击交互
    this.input.on('pointerdown', () => {
      this.gameState.score += 10;
      this.scoreText.setText(`Score: ${this.gameState.score}`);
      
      // 每 50 分升级
      if (this.gameState.score % 50 === 0) {
        this.gameState.level++;
        this.levelText.setText(`Level: ${this.gameState.level}`);
      }
    });

    // 添加自动回血效果
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.gameState.health < 100) {
          this.gameState.health = Math.min(100, this.gameState.health + 5);
          this.healthText.setText(`Health: ${this.gameState.health}`);
        }
      },
      loop: true
    });

    // 输出状态信号到控制台
    console.log('MainScene loaded with state:', this.gameState);
  }

  update(time, delta) {
    // 可以在这里添加持续更新的逻辑
  }
}

// Game 配置
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

// 暴露状态信号供外部验证
window.getGameState = () => {
  const mainScene = game.scene.getScene('MainScene');
  return mainScene ? mainScene.gameState : null;
};