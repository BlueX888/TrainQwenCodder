class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成 AI 纹理（绿色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 生成收集物品纹理（黄色圆点）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('item', 16, 16);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成 20 个物品的位置
    const seed = 12345;
    const random = this.createSeededRandom(seed);
    
    for (let i = 0; i < 20; i++) {
      const x = random() * 700 + 50; // 50-750
      const y = random() * 500 + 50; // 50-550
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建得分文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, 120);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 20');

    // 检查是否获胜
    if (this.score >= 20) {
      this.gameWon = true;
      this.endGame('YOU WIN!', 0x00ff00);
    }
  }

  hitAI(player, ai) {
    this.gameOver = true;
    this.endGame('GAME OVER!', 0xff0000);
  }

  endGame(message, color) {
    // 停止所有物理对象
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.physics.pause();

    // 显示游戏结束文本
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    this.statusText.setVisible(true);

    // 添加重启提示
    const restartText = this.add.text(400, 360, 'Press SPACE to restart', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    });
    restartText.setOrigin(0.5);

    // 监听空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  // 创建可预测的随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);