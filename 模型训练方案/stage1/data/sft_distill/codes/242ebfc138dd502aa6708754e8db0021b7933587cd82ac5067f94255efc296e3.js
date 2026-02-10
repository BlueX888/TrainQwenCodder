class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（蓝色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x0000ff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200, 200);

    // 创建AI敌人
    this.ai = this.physics.add.sprite(700, 500, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保行为确定性）
    const seed = 12345;
    let randomValue = seed;
    const seededRandom = () => {
      randomValue = (randomValue * 9301 + 49297) % 233280;
      return randomValue / 233280;
    };

    // 生成12个物品
    for (let i = 0; i < 12; i++) {
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
      item.body.setOffset(0, 0);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 碰撞检测：玩家与AI碰撞
    this.physics.add.collider(this.player, this.ai, this.hitAI, null, this);

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 12', {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 游戏状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 初始化游戏状态
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      // 游戏结束，停止所有移动
      this.player.setVelocity(0, 0);
      this.ai.setVelocity(0, 0);
      return;
    }

    // 玩家控制
    this.player.setVelocity(0, 0);

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

    // AI追踪玩家（速度300）
    this.physics.moveToObject(this.ai, this.player, 300);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 12');

    // 检查是否获胜
    if (this.score >= 12) {
      this.gameWon = true;
      this.statusText.setText('YOU WIN!');
      this.statusText.setStyle({ fill: '#00ff00' });
      this.statusText.setVisible(true);
    }
  }

  hitAI(player, ai) {
    if (!this.gameOver && !this.gameWon) {
      // 游戏失败
      this.gameOver = true;
      this.statusText.setText('GAME OVER!');
      this.statusText.setStyle({ fill: '#ff0000' });
      this.statusText.setVisible(true);

      // 玩家变红表示失败
      player.setTint(0xff0000);
    }
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