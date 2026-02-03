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
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（红色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0xff0000, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI敌人
    this.aiEnemy = this.physics.add.sprite(100, 100, 'ai');
    this.aiEnemy.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（保证确定性）
    const seed = 12345;
    const random = this.createSeededRandom(seed);
    
    for (let i = 0; i < 8; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 碰撞检测：AI碰到玩家
    this.physics.add.collider(this.player, this.aiEnemy, this.hitByAI, null, this);

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 8', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // AI追踪玩家（速度80）
    const distance = Phaser.Math.Distance.Between(
      this.aiEnemy.x,
      this.aiEnemy.y,
      this.player.x,
      this.player.y
    );

    if (distance > 0) {
      this.physics.moveToObject(this.aiEnemy, this.player, 80);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();

    // 增加分数
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score + ' / 8');

    // 检查是否获胜
    if (this.score >= 8) {
      this.gameWon = true;
      this.showResult('YOU WIN!', 0x00ff00);
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 游戏失败
    this.gameOver = true;
    this.showResult('GAME OVER!', 0xff0000);
  }

  showResult(message, color) {
    // 停止所有物理运动
    this.player.setVelocity(0);
    this.aiEnemy.setVelocity(0);
    this.physics.pause();

    // 显示结果
    this.resultText.setText(message);
    this.resultText.setColor('#' + color.toString(16).padStart(6, '0'));
    this.resultText.setVisible(true);
  }

  // 创建确定性随机数生成器
  createSeededRandom(seed) {
    let s = seed;
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
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