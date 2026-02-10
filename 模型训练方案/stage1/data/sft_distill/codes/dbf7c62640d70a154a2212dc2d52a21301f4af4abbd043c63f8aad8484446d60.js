class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 15;
    this.aiSpeed = 160;
  }

  preload() {
    // 使用程序化生成纹理，无需外部资源
  }

  create() {
    // 设置固定随机种子以确保可重现性
    Phaser.Math.RND.sow(['phaser-ai-chase-game']);

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（紫色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x9900ff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆点）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('item', 16, 16);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI精灵
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成15个物品
    for (let i = 0; i < this.targetScore; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(8); // 设置圆形碰撞体
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.ai,
      this.hitByAI,
      null,
      this
    );

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.targetScore}`, {
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

    // 添加提示文本
    this.add.text(16, 560, '方向键移动 | 收集黄点 | 躲避紫色AI', {
      fontSize: '18px',
      fill: '#cccccc'
    });
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

    // AI追踪玩家逻辑
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.targetScore}`);

    // 检查是否获胜
    if (this.score >= this.targetScore) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    // 被AI碰到，游戏失败
    this.gameOver = true;
    this.player.setTint(0xff0000);
    this.ai.setVelocity(0);
    this.player.setVelocity(0);

    this.statusText.setText('游戏失败！\n被AI抓住了');
    this.statusText.setVisible(true);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  winGame() {
    this.gameWon = true;
    this.player.setTint(0x00ff00);
    this.ai.setVelocity(0);
    this.player.setVelocity(0);

    this.statusText.setText('胜利！\n成功收集所有物品');
    this.statusText.setVisible(true);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
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