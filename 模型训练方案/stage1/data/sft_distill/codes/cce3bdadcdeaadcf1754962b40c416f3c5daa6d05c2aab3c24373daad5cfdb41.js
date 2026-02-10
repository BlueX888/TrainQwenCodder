// LoadingScene - 负责资源加载和进度显示
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingComplete = false;
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, width, height);

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建进度条背景（深灰色）
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x444444, 1);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

    // 创建进度条（粉色）
    const progressBar = this.add.graphics();

    // 创建百分比文本
    const percentText = this.add.text(width / 2, height / 2 + 15, '0%', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      // 清除之前的进度条
      progressBar.clear();
      // 绘制粉色进度条
      progressBar.fillStyle(0xff69b4, 1); // 粉色
      progressBar.fillRect(width / 2 - 158, height / 2 + 2, 316 * value, 26);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      this.loadingComplete = true;
      progressBar.destroy();
      progressBox.destroy();
      loadingText.setText('Loading Complete!');
      percentText.setText('100%');
    });

    // 模拟加载一些资源（使用空白图片数据）
    // 创建程序化纹理作为"加载资源"
    for (let i = 0; i < 10; i++) {
      // 使用 base64 编码的1x1像素图片来模拟资源加载
      const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      this.load.image(`asset${i}`, pixel);
    }
  }

  create() {
    // 等待1秒后切换到主场景，让用户看到加载完成的提示
    this.time.delayedCall(1000, () => {
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.gameState = {
      score: 0,
      level: 1,
      health: 100,
      isReady: false
    };
  }

  preload() {
    // 主场景不需要额外加载资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置游戏状态为就绪
    this.gameState.isReady = true;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建标题文本
    const titleText = this.add.text(width / 2, 100, 'Main Scene', {
      fontSize: '48px',
      color: '#ff69b4',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0.5);

    // 创建状态显示面板
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0x16213e, 1);
    panelGraphics.fillRoundedRect(width / 2 - 150, 180, 300, 200, 10);
    panelGraphics.lineStyle(3, 0xff69b4, 1);
    panelGraphics.strokeRoundedRect(width / 2 - 150, 180, 300, 200, 10);

    // 显示游戏状态
    const stateText = this.add.text(width / 2, 220, 'Game State:', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    stateText.setOrigin(0.5, 0.5);

    const scoreText = this.add.text(width / 2, 260, `Score: ${this.gameState.score}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    scoreText.setOrigin(0.5, 0.5);

    const levelText = this.add.text(width / 2, 290, `Level: ${this.gameState.level}`, {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Arial'
    });
    levelText.setOrigin(0.5, 0.5);

    const healthText = this.add.text(width / 2, 320, `Health: ${this.gameState.health}`, {
      fontSize: '20px',
      color: '#ff6b6b',
      fontFamily: 'Arial'
    });
    healthText.setOrigin(0.5, 0.5);

    const statusText = this.add.text(width / 2, 350, `Status: ${this.gameState.isReady ? 'Ready' : 'Not Ready'}`, {
      fontSize: '20px',
      color: '#ffd93d',
      fontFamily: 'Arial'
    });
    statusText.setOrigin(0.5, 0.5);

    // 创建程序化生成的游戏元素
    const player = this.add.graphics();
    player.fillStyle(0xff69b4, 1);
    player.fillCircle(width / 2, height - 150, 30);
    player.lineStyle(4, 0xffffff, 1);
    player.strokeCircle(width / 2, height - 150, 30);

    // 添加提示文本
    const hintText = this.add.text(width / 2, height - 50, 'Loading Complete! Game Ready to Play', {
      fontSize: '18px',
      color: '#a8dadc',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5, 0.5);

    // 添加闪烁效果
    this.tweens.add({
      targets: hintText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 添加玩家脉动效果
    this.tweens.add({
      targets: player,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 输出状态到控制台用于验证
    console.log('MainScene loaded with state:', this.gameState);
  }

  update(time, delta) {
    // 主场景更新逻辑（如果需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene], // LoadingScene 作为第一个场景自动启动
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露游戏状态用于验证
window.gameInstance = game;