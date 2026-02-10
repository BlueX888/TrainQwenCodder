// LoadingScene - 预加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadProgress = 0; // 可验证的加载进度状态
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建进度文本
    const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontSize: '24px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 创建进度条背景
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 10, 320, 30);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      this.loadProgress = Math.floor(value * 100);
      percentText.setText(this.loadProgress + '%');
      
      // 更新进度条
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2, 300 * value, 10);
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟加载资源 - 使用Graphics生成纹理
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建星星纹理
    const starGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    starGraphics.fillStyle(0xffff00, 1);
    starGraphics.fillStar(12, 12, 5, 6, 12);
    starGraphics.generateTexture('star', 24, 24);
    starGraphics.destroy();

    // 模拟加载延迟（用于演示进度条效果）
    for (let i = 0; i < 50; i++) {
      this.load.image('dummy' + i, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  create() {
    // 延迟切换场景，确保用户能看到100%进度
    this.time.delayedCall(500, () => {
      this.scene.start('MainScene', { 
        loadProgress: this.loadProgress 
      });
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    // 可验证的状态变量
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.loadedSuccessfully = false;
  }

  init(data) {
    // 接收来自LoadingScene的数据
    if (data.loadProgress === 100) {
      this.loadedSuccessfully = true;
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 显示加载完成状态
    const titleText = this.add.text(width / 2, 100, 'Loading Complete!', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0.5);

    // 显示状态信息
    const statusText = this.add.text(width / 2, 180, 
      `Load Status: ${this.loadedSuccessfully ? 'SUCCESS' : 'FAILED'}\n` +
      `Score: ${this.score}\n` +
      `Health: ${this.health}\n` +
      `Level: ${this.level}`, 
      {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center'
      }
    );
    statusText.setOrigin(0.5, 0.5);

    // 显示加载的纹理示例
    const player = this.add.image(width / 2 - 100, height / 2 + 50, 'player');
    const enemy = this.add.image(width / 2, height / 2 + 50, 'enemy');
    const star = this.add.image(width / 2 + 100, height / 2 + 50, 'star');

    // 添加标签
    this.add.text(width / 2 - 100, height / 2 + 90, 'Player', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, height / 2 + 90, 'Enemy', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2 + 100, height / 2 + 90, 'Star', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // 添加简单动画效果
    this.tweens.add({
      targets: [player, enemy, star],
      y: height / 2 + 40,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加重新加载按钮
    const reloadButton = this.add.text(width / 2, height - 80, 'Click to Reload', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    });
    reloadButton.setOrigin(0.5, 0.5);
    reloadButton.setInteractive({ useHandCursor: true });

    reloadButton.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

    reloadButton.on('pointerover', () => {
      reloadButton.setStyle({ color: '#ffffff', backgroundColor: '#555555' });
    });

    reloadButton.on('pointerout', () => {
      reloadButton.setStyle({ color: '#ffff00', backgroundColor: '#333333' });
    });

    // 控制台输出状态用于验证
    console.log('MainScene created with status:', {
      score: this.score,
      health: this.health,
      level: this.level,
      loadedSuccessfully: this.loadedSuccessfully
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
  backgroundColor: '#2d2d2d',
  scene: [LoadingScene, MainScene], // LoadingScene作为第一个场景自动启动
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);