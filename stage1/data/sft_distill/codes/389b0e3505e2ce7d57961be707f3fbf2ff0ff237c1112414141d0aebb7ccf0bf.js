// MenuScene - 游戏菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建标题
    const title = this.add.text(width / 2, height / 3, 'COLLECT GAME', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建开始按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x00ff00, 1);
    buttonBg.fillRoundedRect(width / 2 - 100, height / 2, 200, 60, 10);

    // 创建按钮文本
    const startText = this.add.text(width / 2, height / 2 + 30, 'START GAME', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);

    // 添加按钮交互区域
    const buttonZone = this.add.zone(width / 2, height / 2 + 30, 200, 60);
    buttonZone.setInteractive({ useHandCursor: true });

    // 按钮悬停效果
    buttonZone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x00dd00, 1);
      buttonBg.fillRoundedRect(width / 2 - 100, height / 2, 200, 60, 10);
    });

    buttonZone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x00ff00, 1);
      buttonBg.fillRoundedRect(width / 2 - 100, height / 2, 200, 60, 10);
    });

    // 点击开始游戏
    buttonZone.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 添加说明文字
    const instructions = this.add.text(width / 2, height * 0.75, 'Use Arrow Keys to Move\nCollect Green Circles to Score', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    instructions.setOrigin(0.5);
  }
}

// GameScene - 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameTime = 0;
    this.maxGameTime = 30000; // 30秒游戏时间
  }

  preload() {
    // 程序化生成玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 程序化生成收集物纹理
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 初始化分数和时间
    this.score = 0;
    this.gameTime = 0;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a3e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建玩家
    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.setScale(1);

    // 创建收集物组
    this.items = this.add.group();
    this.spawnItem();

    // 创建分数文本
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建时间文本
    this.timeText = this.add.text(width - 20, 20, 'Time: 30', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.timeText.setOrigin(1, 0);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置玩家速度
    this.playerSpeed = 300;

    // 存储到 registry 供其他场景访问
    this.registry.set('score', this.score);
  }

  update(time, delta) {
    const { width, height } = this.cameras.main;

    // 更新游戏时间
    this.gameTime += delta;
    const remainingTime = Math.max(0, Math.ceil((this.maxGameTime - this.gameTime) / 1000));
    this.timeText.setText(`Time: ${remainingTime}`);

    // 时间到，游戏结束
    if (this.gameTime >= this.maxGameTime) {
      this.registry.set('finalScore', this.score);
      this.scene.start('GameOverScene');
      return;
    }

    // 玩家移动
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -this.playerSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.playerSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.playerSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.playerSpeed;
    }

    // 应用移动
    this.player.x += velocityX * delta / 1000;
    this.player.y += velocityY * delta / 1000;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, width - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, height - 16);

    // 检测收集物碰撞
    this.items.getChildren().forEach(item => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        item.x, item.y
      );

      if (distance < 28) {
        this.collectItem(item);
      }
    });
  }

  spawnItem() {
    const { width, height } = this.cameras.main;
    
    // 随机位置生成收集物（避免边缘）
    const x = Phaser.Math.Between(50, width - 50);
    const y = Phaser.Math.Between(50, height - 50);
    
    const item = this.add.sprite(x, y, 'item');
    this.items.add(item);

    // 添加闪烁效果
    this.tweens.add({
      targets: item,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  collectItem(item) {
    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
    this.registry.set('score', this.score);

    // 移除收集物
    item.destroy();

    // 生成新的收集物
    this.spawnItem();

    // 播放收集效果（缩放动画）
    this.tweens.add({
      targets: this.player,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }
}

// GameOverScene - 游戏结束场景
class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 获取最终分数
    const finalScore = this.registry.get('finalScore') || 0;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建 GAME OVER 标题
    const title = this.add.text(width / 2, height / 3 - 50, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示最终分数
    const scoreText = this.add.text(width / 2, height / 3 + 30, `Final Score: ${finalScore}`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    scoreText.setOrigin(0.5);

    // 评价文本
    let rating = 'Try Again!';
    if (finalScore >= 100) rating = 'Great!';
    if (finalScore >= 200) rating = 'Excellent!';
    if (finalScore >= 300) rating = 'Amazing!';

    const ratingText = this.add.text(width / 2, height / 2, rating, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    ratingText.setOrigin(0.5);

    // 创建重新开始按钮
    const restartBg = this.add.graphics();
    restartBg.fillStyle(0x00ff00, 1);
    restartBg.fillRoundedRect(width / 2 - 120, height * 0.65, 240, 60, 10);

    const restartText = this.add.text(width / 2, height * 0.65 + 30, 'PLAY AGAIN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);

    const restartZone = this.add.zone(width / 2, height * 0.65 + 30, 240, 60);
    restartZone.setInteractive({ useHandCursor: true });

    restartZone.on('pointerover', () => {
      restartBg.clear();
      restartBg.fillStyle(0x00dd00, 1);
      restartBg.fillRoundedRect(width / 2 - 120, height * 0.65, 240, 60, 10);
    });

    restartZone.on('pointerout', () => {
      restartBg.clear();
      restartBg.fillStyle(0x00ff00, 1);
      restartBg.fillRoundedRect(width / 2 - 120, height * 0.65, 240, 60, 10);
    });

    restartZone.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 创建返回菜单按钮
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x4444ff, 1);
    menuBg.fillRoundedRect(width / 2 - 120, height * 0.8, 240, 60, 10);

    const menuText = this.add.text(width / 2, height * 0.8 + 30, 'MAIN MENU', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    menuText.setOrigin(0.5);

    const menuZone = this.add.zone(width / 2, height * 0.8 + 30, 240, 60);
    menuZone.setInteractive({ useHandCursor: true });

    menuZone.on('pointerover', () => {
      menuBg.clear();
      menuBg.fillStyle(0x3333dd, 1);
      menuBg.fillRoundedRect(width / 2 - 120, height * 0.8, 240, 60, 10);
    });

    menuZone.on('pointerout', () => {
      menuBg.clear();
      menuBg.fillStyle(0x4444ff, 1);
      menuBg.fillRoundedRect(width / 2 - 120, height * 0.8, 240, 60, 10);
    });

    menuZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: