class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 12;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家（绿色方块）
    this.player = this.physics.add.sprite(100, 100, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(250, 250);
    this.player.setDrag(800, 800);

    // 创建 AI（蓝色圆形）
    this.ai = this.physics.add.sprite(700, 500, 'aiTex');
    this.ai.setCollideWorldBounds(true);

    // 创建可收集物品组（黄色星形）
    this.items = this.physics.add.group();
    this.createItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, `Score: 0/${this.totalItems}`, {
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
    }).setOrigin(0.5).setVisible(false);

    // 添加重启提示
    this.restartText = this.add.text(400, 360, 'Press SPACE to restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    // 重启键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（蓝色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x0000ff, 1);
    aiGraphics.fillCircle(20, 20, 20);
    aiGraphics.generateTexture('aiTex', 40, 40);
    aiGraphics.destroy();

    // 创建物品纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.fillStyle(0xffa500, 1);
    itemGraphics.fillCircle(12, 12, 8);
    itemGraphics.generateTexture('itemTex', 24, 24);
    itemGraphics.destroy();
  }

  createItems() {
    // 使用固定种子生成随机位置
    const positions = [
      { x: 200, y: 150 }, { x: 400, y: 100 }, { x: 600, y: 150 },
      { x: 150, y: 300 }, { x: 350, y: 250 }, { x: 550, y: 300 },
      { x: 200, y: 450 }, { x: 400, y: 500 }, { x: 600, y: 450 },
      { x: 100, y: 550 }, { x: 500, y: 550 }, { x: 700, y: 350 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'itemTex');
      item.setScale(1);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/${this.totalItems}`);

    // 检查胜利条件
    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;

    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.physics.pause();
    
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);
    this.restartText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.physics.pause();
    
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);
    this.restartText.setVisible(true);
  }

  update(time, delta) {
    if (this.gameOver) {
      // 检查重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart();
      }
      return;
    }

    // 玩家移动控制
    const acceleration = 600;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // AI 追踪逻辑
    this.updateAI();
  }

  updateAI() {
    const aiSpeed = 300;
    
    // 计算 AI 到玩家的方向
    const angle = Phaser.Math.Angle.Between(
      this.ai.x, this.ai.y,
      this.player.x, this.player.y
    );

    // 设置 AI 速度朝向玩家
    this.physics.velocityFromRotation(angle, aiSpeed, this.ai.body.velocity);
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