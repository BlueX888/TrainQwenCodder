// 收集物品游戏 - 完整可运行版本
class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
    this.score = 0;
    this.collectibles = null;
    this.player = null;
    this.scoreText = null;
    this.cursors = null;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（紫色圆形）
    const collectGraphics = this.add.graphics();
    collectGraphics.fillStyle(0x9932cc, 1); // 紫色
    collectGraphics.fillCircle(12, 12, 12);
    collectGraphics.generateTexture('collectible', 24, 24);
    collectGraphics.destroy();
  }

  create() {
    // 初始化 signals 对象
    window.__signals__ = {
      score: 0,
      totalCollectibles: 15,
      remainingCollectibles: 15,
      gameStarted: true,
      collectedItems: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocityDrag(500);
    this.player.setMaxVelocity(300);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 生成15个随机分布的收集物
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12); // 设置圆形碰撞体
      collectible.body.setAllowGravity(false);
      collectible.setData('id', i); // 给每个收集物设置ID
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setDepth(10);

    // 创建提示文本
    this.add.text(400, 580, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 输出初始状态日志
    console.log(JSON.stringify({
      event: 'game_start',
      score: this.score,
      totalCollectibles: 15,
      timestamp: Date.now()
    }));
  }

  collectItem(player, collectible) {
    // 销毁收集物
    const itemId = collectible.getData('id');
    collectible.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 更新 signals
    window.__signals__.score = this.score;
    window.__signals__.remainingCollectibles = this.collectibles.countActive(true);
    window.__signals__.collectedItems.push({
      id: itemId,
      timestamp: Date.now(),
      score: this.score
    });

    // 输出收集事件日志
    console.log(JSON.stringify({
      event: 'item_collected',
      itemId: itemId,
      score: this.score,
      remaining: this.collectibles.countActive(true),
      timestamp: Date.now()
    }));

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.gameComplete();
    }
  }

  gameComplete() {
    // 游戏完成
    window.__signals__.gameCompleted = true;
    window.__signals__.completionTime = Date.now();

    // 显示完成文本
    const completeText = this.add.text(400, 300, 'All Collected!\nFinal Score: ' + this.score, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    completeText.setOrigin(0.5);

    // 输出完成日志
    console.log(JSON.stringify({
      event: 'game_complete',
      finalScore: this.score,
      totalItems: 15,
      timestamp: Date.now()
    }));

    // 停止玩家移动
    this.player.setVelocity(0);
  }

  update(time, delta) {
    // 键盘控制玩家移动
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
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
  scene: CollectGameScene
};

// 启动游戏
const game = new Phaser.Game(config);