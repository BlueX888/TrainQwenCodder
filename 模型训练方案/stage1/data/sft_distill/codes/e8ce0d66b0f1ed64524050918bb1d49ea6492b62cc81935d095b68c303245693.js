// LoadingScene - 负责预加载资源并显示进度
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadProgress = 0;
  }

  preload() {
    // 创建进度条背景
    const width = 400;
    const height = 50;
    const x = (this.cameras.main.width - width) / 2;
    const y = (this.cameras.main.height - height) / 2;

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
      this.loadProgress = value;
      percentText.setText(parseInt(value * 100) + '%');
      
      // 绘制红色进度条
      progressBar.clear();
      progressBar.fillStyle(0xff0000, 1);
      progressBar.fillRect(x + 10, y + 10, (width - 20) * value, height - 20);
    });

    // 监听加载完成
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟加载一些假资源（用于演示进度条）
    // 使用空白图片数据来模拟资源加载
    for (let i = 0; i < 10; i++) {
      this.load.image(`dummy${i}`, this.createDummyImageData());
    }

    // 生成一些程序化纹理
    this.load.once('complete', () => {
      this.generateTextures();
    });
  }

  // 创建假图片数据（1x1像素的PNG）
  createDummyImageData() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  // 生成程序化纹理
  generateTextures() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 生成道具纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillStar(16, 16, 5, 8, 16);
    itemGraphics.generateTexture('item', 32, 32);
    itemGraphics.destroy();
  }

  create() {
    // 显示加载完成信息
    const completeText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Loading Complete!\nStarting Game...',
      {
        font: '24px Arial',
        fill: '#00ff00',
        align: 'center'
      }
    );
    completeText.setOrigin(0.5, 0.5);

    // 1秒后切换到主场景
    this.time.delayedCall(1000, () => {
      this.scene.start('MainScene', { loadProgress: this.loadProgress });
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.itemsCollected = 0;
  }

  init(data) {
    // 接收来自LoadingScene的数据
    this.loadProgress = data.loadProgress || 1;
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 标题
    this.add.text(
      this.cameras.main.width / 2,
      50,
      'Main Game Scene',
      {
        font: 'bold 32px Arial',
        fill: '#ffffff'
      }
    ).setOrigin(0.5);

    // 状态信息面板
    const statusY = 120;
    this.add.text(50, statusY, 'Game Status:', {
      font: 'bold 20px Arial',
      fill: '#00ff00'
    });

    // 可验证的状态信号
    this.scoreText = this.add.text(50, statusY + 40, `Score: ${this.score}`, {
      font: '18px Arial',
      fill: '#ffffff'
    });

    this.healthText = this.add.text(50, statusY + 70, `Health: ${this.health}`, {
      font: '18px Arial',
      fill: '#ffffff'
    });

    this.levelText = this.add.text(50, statusY + 100, `Level: ${this.level}`, {
      font: '18px Arial',
      fill: '#ffffff'
    });

    this.itemsText = this.add.text(50, statusY + 130, `Items Collected: ${this.itemsCollected}`, {
      font: '18px Arial',
      fill: '#ffffff'
    });

    this.loadProgressText = this.add.text(50, statusY + 160, `Load Progress: ${(this.loadProgress * 100).toFixed(0)}%`, {
      font: '18px Arial',
      fill: '#ffff00'
    });

    // 显示加载的纹理示例
    this.add.text(400, statusY, 'Loaded Assets:', {
      font: 'bold 20px Arial',
      fill: '#00ff00'
    });

    // 显示玩家精灵
    const player = this.add.sprite(450, statusY + 60, 'player');
    this.add.text(490, statusY + 50, 'Player', {
      font: '16px Arial',
      fill: '#ffffff'
    });

    // 显示敌人精灵
    const enemy = this.add.sprite(450, statusY + 120, 'enemy');
    this.add.text(490, statusY + 110, 'Enemy', {
      font: '16px Arial',
      fill: '#ffffff'
    });

    // 显示道具精灵
    const item = this.add.sprite(450, statusY + 180, 'item');
    this.add.text(490, statusY + 170, 'Item', {
      font: '16px Arial',
      fill: '#ffffff'
    });

    // 添加交互提示
    this.add.text(
      this.cameras.main.width / 2,
      450,
      'Click anywhere to increase score\nPress SPACE to collect item',
      {
        font: '16px Arial',
        fill: '#aaaaaa',
        align: 'center'
      }
    ).setOrigin(0.5);

    // 添加重新加载按钮
    const reloadButton = this.add.text(
      this.cameras.main.width / 2,
      530,
      'Press R to reload scene',
      {
        font: '16px Arial',
        fill: '#ff8800',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setInteractive();

    // 点击事件 - 增加分数
    this.input.on('pointerdown', () => {
      this.score += 10;
      this.updateStatus();
    });

    // 键盘事件
    this.input.keyboard.on('keydown-SPACE', () => {
      this.itemsCollected += 1;
      this.score += 50;
      this.updateStatus();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.scene.start('LoadingScene');
    });

    // 自动更新演示
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.health > 0) {
          this.health -= 5;
          this.updateStatus();
        }
      },
      loop: true
    });
  }

  updateStatus() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.healthText.setText(`Health: ${this.health}`);
    this.levelText.setText(`Level: ${this.level}`);
    this.itemsText.setText(`Items Collected: ${this.itemsCollected}`);

    // 根据分数升级
    const newLevel = Math.floor(this.score / 100) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.health = Math.min(100, this.health + 20);
    }
  }
}

// 游戏配置
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