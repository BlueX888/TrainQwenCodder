class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.aiSpeed = 360;
    this.playerSpeed = 200;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（灰色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x808080, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI敌人
    this.ai = this.physics.add.sprite(700, 300, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    this.createItems();

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 5', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);
  }

  createItems() {
    // 使用固定种子生成物品位置（确保可重复性）
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 400, y: 300 },
      { x: 200, y: 450 },
      { x: 600, y: 450 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCollideWorldBounds(true);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 移除物品并增加分数
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / 5`);

    // 检查胜利条件
    if (this.score >= 5) {
      this.gameWon = true;
      this.gameOver = true;
      this.endGame('YOU WIN!', '#00ff00');
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;

    // 玩家被AI碰到，游戏失败
    this.gameOver = true;
    this.gameWon = false;
    this.endGame('GAME OVER!', '#ff0000');
  }

  endGame(message, color) {
    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);

    // 显示结束信息
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: color });
    this.statusText.setVisible(true);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制
    this.player.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // AI追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);

    // 计算AI到玩家的距离（用于调试和验证）
    const distance = Phaser.Math.Distance.Between(
      this.ai.x, this.ai.y,
      this.player.x, this.player.y
    );

    // 可选：显示距离信息（用于调试）
    // console.log('Distance to player:', distance);
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);