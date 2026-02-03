// LoadingScene - 负责资源加载和显示进度条
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingStatus = 'loading'; // 可验证状态信号
    this.loadProgress = 0;
  }

  preload() {
    // 创建进度条背景
    const width = 600;
    const height = 40;
    const x = (this.cameras.main.width - width) / 2;
    const y = this.cameras.main.height / 2;

    // 绘制进度条背景（灰色）
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x222222, 1);
    progressBg.fillRect(x, y, width, height);

    // 绘制进度条边框
    const progressBorder = this.add.graphics();
    progressBorder.lineStyle(3, 0xffffff, 1);
    progressBorder.strokeRect(x, y, width, height);

    // 创建进度条填充（红色）
    const progressBar = this.add.graphics();

    // 添加加载文本
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      y - 50,
      'Loading...',
      {
        font: '24px Arial',
        fill: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5);

    // 添加百分比文本
    const percentText = this.add.text(
      this.cameras.main.width / 2,
      y + 60,
      '0%',
      {
        font: '20px Arial',
        fill: '#ffffff'
      }
    );
    percentText.setOrigin(0.5);

    // 监听加载进度
    this.load.on('progress', (value) => {
      this.loadProgress = Math.floor(value * 100);
      
      // 更新红色进度条
      progressBar.clear();
      progressBar.fillStyle(0xff0000, 1);
      progressBar.fillRect(x, y, width * value, height);

      // 更新百分比文本
      percentText.setText(`${this.loadProgress}%`);
    });

    // 监听加载完成
    this.load.on('complete', () => {
      this.loadingStatus = 'complete';
      loadingText.setText('Loading Complete!');
    });

    // 程序化生成纹理资源（模拟加载过程）
    this.generateTextures();
  }

  generateTextures() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（红色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 生成金币纹理（黄色圆形）
    const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.lineStyle(2, 0xffa500, 1);
    coinGraphics.strokeCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 生成背景纹理（蓝色渐变）
    const bgGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bgGraphics.fillGradientStyle(0x001155, 0x001155, 0x003388, 0x003388, 1);
    bgGraphics.fillRect(0, 0, 800, 600);
    bgGraphics.generateTexture('background', 800, 600);
    bgGraphics.destroy();

    // 添加一些虚拟文件加载以增加加载时间
    for (let i = 0; i < 10; i++) {
      // 使用 image 的 base64 数据模拟加载
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `hsl(${i * 36}, 70%, 50%)`;
      ctx.fillRect(0, 0, 32, 32);
      const dataUrl = canvas.toDataURL();
      this.load.image(`dummy${i}`, dataUrl);
    }
  }

  create() {
    // 等待一小段时间让用户看到"Loading Complete"
    this.time.delayedCall(500, () => {
      // 切换到主场景，传递加载状态
      this.scene.start('MainScene', {
        loadingStatus: this.loadingStatus,
        loadProgress: this.loadProgress
      });
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    // 可验证的状态信号
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.gameState = 'playing';
  }

  init(data) {
    // 接收从 LoadingScene 传递的数据
    this.loadingData = data;
  }

  create() {
    // 添加背景
    this.add.image(400, 300, 'background');

    // 显示标题
    const title = this.add.text(
      400,
      50,
      'Main Scene - Game Ready!',
      {
        font: 'bold 32px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    title.setOrigin(0.5);

    // 显示加载信息
    const loadInfo = this.add.text(
      400,
      100,
      `Loading Status: ${this.loadingData.loadingStatus}\nProgress: ${this.loadingData.loadProgress}%`,
      {
        font: '18px Arial',
        fill: '#ffff00',
        align: 'center'
      }
    );
    loadInfo.setOrigin(0.5);

    // 显示状态信号（用于验证）
    this.statusText = this.add.text(
      20,
      20,
      this.getStatusText(),
      {
        font: '16px Arial',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );

    // 创建玩家
    this.player = this.add.image(400, 300, 'player');
    this.player.setScale(1.5);

    // 创建一些敌人
    this.enemies = [];
    for (let i = 0; i < 3; i++) {
      const enemy = this.add.image(
        150 + i * 250,
        200,
        'enemy'
      );
      enemy.setScale(1.2);
      this.enemies.push(enemy);
    }

    // 创建一些金币
    this.coins = [];
    for (let i = 0; i < 5; i++) {
      const coin = this.add.image(
        100 + i * 150,
        450,
        'coin'
      );
      coin.setScale(1.5);
      this.coins.push(coin);
      
      // 添加旋转动画
      this.tweens.add({
        targets: coin,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // 添加说明文本
    const instructions = this.add.text(
      400,
      550,
      'Scene transition complete! All resources loaded successfully.',
      {
        font: '16px Arial',
        fill: '#00ff00',
        align: 'center'
      }
    );
    instructions.setOrigin(0.5);

    // 添加简单的动画效果
    this.tweens.add({
      targets: this.enemies,
      y: '+=20',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 更新游戏状态
    this.gameState = 'ready';
  }

  getStatusText() {
    return `Score: ${this.score}\nHealth: ${this.health}\nLevel: ${this.level}\nState: ${this.gameState}`;
  }

  update() {
    // 可以在这里添加游戏逻辑
    // 状态信号会保持可访问用于验证
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene], // 场景顺序：先加载 LoadingScene
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号用于验证（可选）
window.getGameState = function() {
  const mainScene = game.scene.getScene('MainScene');
  if (mainScene) {
    return {
      score: mainScene.score,
      health: mainScene.health,
      level: mainScene.level,
      gameState: mainScene.gameState
    };
  }
  const loadingScene = game.scene.getScene('LoadingScene');
  if (loadingScene) {
    return {
      loadingStatus: loadingScene.loadingStatus,
      loadProgress: loadingScene.loadProgress
    };
  }
  return null;
};