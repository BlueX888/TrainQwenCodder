class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 5;
  }

  preload() {
    // 使用Graphics创建纹理，不依赖外部资源
  }

  create() {
    // 设置固定随机种子以保证可重现性
    Phaser.Math.RND.srand(['phaser3-ai-chase']);

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（青色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ffff, 1);
    aiGraphics.fillCircle(16, 16, 16);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建收集物品纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      const x = 12 + Math.cos(angle) * 12;
      const y = 12 + Math.sin(angle) * 12;
      if (i === 0) {
        itemGraphics.moveTo(x, y);
      } else {
        itemGraphics.lineTo(x, y);
      }
    }
    itemGraphics.closePath();
    itemGraphics.fillPath();
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI角色
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    for (let i = 0; i < this.targetScore; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 碰撞检测：AI碰到玩家
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集进度: ${this.score}/${this.targetScore}`, {
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

    // 添加边界
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动控制
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

    // AI追踪玩家，速度360
    this.physics.moveToObject(this.ai, this.player, 360);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.score++;
    this.scoreText.setText(`收集进度: ${this.score}/${this.targetScore}`);

    // 检查是否获胜
    if (this.score >= this.targetScore) {
      this.gameWon = true;
      this.player.setVelocity(0);
      this.ai.setVelocity(0);
      this.statusText.setText('胜利！');
      this.statusText.setStyle({ fill: '#00ff00' });
      this.statusText.setVisible(true);
    }
  }

  hitByAI(player, ai) {
    // 被AI碰到，游戏失败
    if (!this.gameOver && !this.gameWon) {
      this.gameOver = true;
      this.player.setVelocity(0);
      this.ai.setVelocity(0);
      this.player.setTint(0xff0000);
      this.statusText.setText('失败！');
      this.statusText.setStyle({ fill: '#ff0000' });
      this.statusText.setVisible(true);
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